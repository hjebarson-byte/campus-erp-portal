import datetime
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Q, Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .models import (
    Department, UserProfile, Course, TimetableEntry,
    AttendanceRecord, ExamGrade, FeeRecord, Notice,
    Assignment, AssignmentSubmission, LeaveApplication
)
from .serializers import (
    DepartmentSerializer, UserProfileSerializer, CourseSerializer,
    TimetableEntrySerializer, AttendanceRecordSerializer,
    ExamGradeSerializer, FeeRecordSerializer, NoticeSerializer,
    AssignmentSerializer, AssignmentSubmissionSerializer,
    LeaveApplicationSerializer
)

def get_current_or_default_student(request):
    """Returns the authenticated student profile, or the student requested via student_id, or fallback."""
    if request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'student':
        return request.user.profile

    student_id = (
        request.query_params.get('student_id') 
        or request.headers.get('X-Student-Id')
        or (hasattr(request, 'data') and isinstance(request.data, dict) and request.data.get('student_id'))
    )
    if student_id:
        student = UserProfile.objects.filter(id=student_id, role='student').first()
        if student:
            return student

    # Fallback to the first student in the database so the portal works right away
    student = UserProfile.objects.filter(role='student').first()
    return student

@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        profile = getattr(user, 'profile', None)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'name': user.get_full_name() or user.username,
                'role': profile.role if profile else 'student',
                'roll_number': profile.roll_number if profile else '',
                'department': profile.department.name if profile and profile.department else '',
                'semester': profile.semester if profile else 1
            }
        })
    return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_profile(request):
    student = get_current_or_default_student(request)
    if not student:
        return Response({'error': 'No student profile found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = UserProfileSerializer(student)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_overview(request):
    """Aggregate dashboard metrics for the student portal."""
    student = get_current_or_default_student(request)
    if not student:
        return Response({'message': 'No student records available'}, status=status.HTTP_200_OK)

    total_classes = AttendanceRecord.objects.filter(student=student).count()
    attended_classes = AttendanceRecord.objects.filter(student=student, status='present').count()
    overall_attendance = round((attended_classes / total_classes * 100), 1) if total_classes > 0 else 0.0

    grades = ExamGrade.objects.filter(student=student)
    avg_grade_point = grades.aggregate(avg=Avg('grade_point'))['avg']
    cgpa = round(avg_grade_point, 2) if avg_grade_point else 8.5

    fees = FeeRecord.objects.filter(student=student)
    total_dues = fees.filter(status__in=['pending', 'overdue']).aggregate(total=Sum('amount'))['total'] or 0.0
    total_paid = fees.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0.0

    today_name = datetime.date.today().strftime('%A')
    if today_name in ['Sunday']:
        today_name = 'Monday'
    today_classes = TimetableEntry.objects.filter(
        semester=student.semester,
        day=today_name
    ).order_by('start_time')
    today_classes_data = TimetableEntrySerializer(today_classes, many=True).data

    pending_assignments = Assignment.objects.filter(
        course__semester=student.semester
    ).exclude(submissions__student=student).order_by('due_date')[:4]
    assignments_data = AssignmentSerializer(pending_assignments, many=True, context={'request': request}).data

    recent_notices = Notice.objects.all().order_by('-is_pinned', '-created_at')[:4]
    notices_data = NoticeSerializer(recent_notices, many=True).data

    return Response({
        'student': UserProfileSerializer(student).data,
        'metrics': {
            'overall_attendance': overall_attendance,
            'classes_attended': attended_classes,
            'total_classes': total_classes,
            'is_shortfall': overall_attendance < 75.0,
            'cgpa': cgpa,
            'total_dues': float(total_dues),
            'total_paid': float(total_paid),
            'active_semester': student.semester,
        },
        'today_classes': today_classes_data,
        'today_day': today_name,
        'pending_assignments': assignments_data,
        'recent_notices': notices_data,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def student_attendance_detail(request):
    """Subject-wise attendance metrics and threshold calculations."""
    student = get_current_or_default_student(request)
    if not student:
        return Response([])

    courses = Course.objects.filter(semester=student.semester)
    result = []

    for course in courses:
        total = AttendanceRecord.objects.filter(student=student, course=course).count()
        attended = AttendanceRecord.objects.filter(student=student, course=course, status='present').count()
        percentage = round((attended / total * 100), 1) if total > 0 else 100.0

        needed_for_75 = max(0, int(round((0.75 * total - attended) / 0.25))) if percentage < 75 else 0
        safe_bunks = max(0, int((attended - 0.75 * total) / 0.75)) if percentage >= 75 else 0

        recent_logs = AttendanceRecord.objects.filter(student=student, course=course).order_by('-date')[:5]

        result.append({
            'course_id': course.id,
            'course_code': course.code,
            'course_name': course.name,
            'credits': course.credits,
            'faculty': course.faculty.user.get_full_name() if course.faculty and course.faculty.user else 'TBA',
            'attended': attended,
            'total': total,
            'percentage': percentage,
            'is_shortfall': percentage < 75.0,
            'needed_for_75': needed_for_75,
            'safe_bunks': safe_bunks,
            'recent_logs': AttendanceRecordSerializer(recent_logs, many=True).data
        })

    return Response(result)


@api_view(['POST'])
@permission_classes([AllowAny])
def toggle_attendance_record(request):
    """Update student attendance status for a given course and date."""
    course_id = request.data.get('course_id')
    status_val = request.data.get('status', 'present')
    date_val = request.data.get('date', datetime.date.today().strftime('%Y-%m-%d'))
    student = get_current_or_default_student(request)

    if not student or not course_id:
        return Response({'error': 'Student and course_id required'}, status=status.HTTP_400_BAD_REQUEST)

    course = get_object_or_404(Course, id=course_id)
    record, created = AttendanceRecord.objects.update_or_create(
        student=student,
        course=course,
        date=date_val,
        defaults={'status': status_val}
    )
    return Response({'message': 'Attendance updated', 'record': AttendanceRecordSerializer(record).data})


@api_view(['GET'])
@permission_classes([AllowAny])
def timetable_schedule(request):
    """Retrieve course schedule, optionally filtered by day or semester."""
    student = get_current_or_default_student(request)
    semester = request.query_params.get('semester', student.semester if student else 1)
    day = request.query_params.get('day')

    query = TimetableEntry.objects.filter(semester=semester)
    if day:
        query = query.filter(day=day)

    entries = query.order_by('day', 'start_time')
    return Response(TimetableEntrySerializer(entries, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def exam_results(request):
    """Retrieve examination grades and calculate SGPA/CGPA."""
    student = get_current_or_default_student(request)
    if not student:
        return Response({'grades': [], 'sgpa': 0.0, 'cgpa': 0.0})

    semester = request.query_params.get('semester', student.semester)
    grades = ExamGrade.objects.filter(student=student, semester=semester)

    total_credits = 0
    weighted_points = 0.0

    for grade in grades:
        c = grade.course.credits
        total_credits += c
        weighted_points += float(grade.grade_point) * c

    sgpa = round(weighted_points / total_credits, 2) if total_credits > 0 else 0.0

    # Overall CGPA
    all_grades = ExamGrade.objects.filter(student=student)
    all_credits = sum(g.course.credits for g in all_grades)
    all_weighted = sum(float(g.grade_point) * g.course.credits for g in all_grades)
    cgpa = round(all_weighted / all_credits, 2) if all_credits > 0 else sgpa

    return Response({
        'semester': semester,
        'sgpa': sgpa,
        'cgpa': cgpa,
        'total_credits': total_credits,
        'grades': ExamGradeSerializer(grades, many=True).data
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def fee_history(request):
    student = get_current_or_default_student(request)
    if not student:
        return Response([])

    records = FeeRecord.objects.filter(student=student).order_by('-due_date')
    return Response(FeeRecordSerializer(records, many=True).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def pay_fee_mock(request):
    """Process student fee payment and generate transaction reference."""
    fee_id = request.data.get('fee_id')
    mode = request.data.get('payment_mode', 'UPI (Google Pay / PhonePe)')

    fee = get_object_or_404(FeeRecord, id=fee_id)
    fee.status = 'paid'
    fee.payment_date = datetime.date.today()
    fee.transaction_id = f"TXN-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}-{fee.id}"
    fee.payment_mode = mode
    fee.save()

    return Response({
        'message': 'Payment confirmed. Receipt generated.',
        'fee': FeeRecordSerializer(fee).data
    })


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def notices_list_create(request):
    if request.method == 'GET':
        category = request.query_params.get('category')
        notices = Notice.objects.all()
        if category and category != 'all':
            notices = notices.filter(category=category)
        return Response(NoticeSerializer(notices, many=True).data)

    elif request.method == 'POST':
        serializer = NoticeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def assignments_list(request):
    student = get_current_or_default_student(request)
    sem = student.semester if student else 1
    assignments = Assignment.objects.filter(course__semester=sem).order_by('due_date')
    return Response(AssignmentSerializer(assignments, many=True, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_assignment(request):
    student = get_current_or_default_student(request)
    assignment_id = request.data.get('assignment_id')
    submission_text = request.data.get('submission_text', '')
    file_attachment = request.data.get('file_attachment', 'document_submission.pdf')

    assignment = get_object_or_404(Assignment, id=assignment_id)
    sub, created = AssignmentSubmission.objects.update_or_create(
        assignment=assignment,
        student=student,
        defaults={
            'submission_text': submission_text,
            'file_attachment': file_attachment,
            'status': 'submitted'
        }
    )
    return Response({
        'message': 'Assignment submitted successfully.',
        'submission': AssignmentSubmissionSerializer(sub).data
    })


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def leave_applications(request):
    student = get_current_or_default_student(request)
    if request.method == 'GET':
        if not student:
            return Response([])
        leaves = LeaveApplication.objects.filter(student=student).order_by('-applied_at')
        return Response(LeaveApplicationSerializer(leaves, many=True).data)

    elif request.method == 'POST':
        leave_type = request.data.get('leave_type', 'medical')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        reason = request.data.get('reason')

        leave = LeaveApplication.objects.create(
            student=student,
            leave_type=leave_type,
            start_date=start_date,
            end_date=end_date,
            reason=reason,
            status='pending'
        )
        return Response({
            'message': 'Leave application submitted for approval',
            'leave': LeaveApplicationSerializer(leave).data
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def faculty_overview(request):
    """Return courses, enrolled students, and pending leave applications."""
    faculty = UserProfile.objects.filter(role='faculty').first()
    courses = Course.objects.filter(faculty=faculty) if faculty else Course.objects.all()
    students = UserProfile.objects.filter(role='student')
    pending_leaves = LeaveApplication.objects.filter(status='pending').order_by('-applied_at')

    return Response({
        'faculty': UserProfileSerializer(faculty).data if faculty else None,
        'courses': CourseSerializer(courses, many=True).data,
        'students': UserProfileSerializer(students, many=True).data,
        'pending_leaves': LeaveApplicationSerializer(pending_leaves, many=True).data,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def faculty_mark_attendance(request):
    """Record student attendance for a course session."""
    course_id = request.data.get('course_id')
    student_id = request.data.get('student_id')
    status_val = request.data.get('status', 'present')
    date_val = request.data.get('date', datetime.date.today().strftime('%Y-%m-%d'))

    student = get_object_or_404(UserProfile, id=student_id)
    course = get_object_or_404(Course, id=course_id)
    faculty = UserProfile.objects.filter(role='faculty').first()

    record, created = AttendanceRecord.objects.update_or_create(
        student=student,
        course=course,
        date=date_val,
        defaults={'status': status_val, 'marked_by': faculty}
    )
    return Response({
        'message': f'Attendance recorded: {student.roll_number} ({status_val.upper()})',
        'record': AttendanceRecordSerializer(record).data
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def faculty_submit_grade(request):
    """Enter or update student examination marks."""
    student_id = request.data.get('student_id')
    course_id = request.data.get('course_id')
    semester = request.data.get('semester', 5)
    exam_type = request.data.get('exam_type', 'End Semester')
    marks = float(request.data.get('marks', 85.0))
    max_marks = float(request.data.get('max_marks', 100.0))

    pct = (marks / max_marks) * 100
    if pct >= 90:
        gp, gl = 10.0, 'O'
    elif pct >= 80:
        gp, gl = 9.0, 'A+'
    elif pct >= 70:
        gp, gl = 8.0, 'A'
    elif pct >= 60:
        gp, gl = 7.0, 'B+'
    elif pct >= 50:
        gp, gl = 6.0, 'B'
    else:
        gp, gl = 0.0, 'F'

    student = get_object_or_404(UserProfile, id=student_id)
    course = get_object_or_404(Course, id=course_id)

    grade, _ = ExamGrade.objects.update_or_create(
        student=student,
        course=course,
        semester=semester,
        exam_type=exam_type,
        defaults={
            'marks_obtained': marks,
            'max_marks': max_marks,
            'grade_point': gp,
            'grade_letter': gl
        }
    )

    return Response({
        'message': f'Grade saved: {gl} ({gp} GP) for {student.roll_number}',
        'grade': ExamGradeSerializer(grade).data
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def faculty_decide_leave(request):
    """Approve or reject a student leave request."""
    leave_id = request.data.get('leave_id')
    decision = request.data.get('status', 'approved')
    reason = request.data.get('decision_reason', 'Verified by Faculty In-Charge')

    leave = get_object_or_404(LeaveApplication, id=leave_id)
    leave.status = decision
    leave.decision_reason = reason
    leave.save()

    return Response({
        'message': f'Leave application status updated to {decision.upper()}',
        'leave': LeaveApplicationSerializer(leave).data
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_analytics(request):
    """System-wide administration metrics."""
    total_students = UserProfile.objects.filter(role='student').count()
    total_faculty = UserProfile.objects.filter(role='faculty').count()
    total_courses = Course.objects.count()
    total_departments = Department.objects.count()
    total_notices = Notice.objects.count()
    total_fee_collected = FeeRecord.objects.filter(status='paid').aggregate(s=Sum('amount'))['s'] or 0.0
    total_fee_pending = FeeRecord.objects.filter(status__in=['pending', 'overdue']).aggregate(s=Sum('amount'))['s'] or 0.0

    return Response({
        'total_students': total_students,
        'total_faculty': total_faculty,
        'total_courses': total_courses,
        'total_departments': total_departments,
        'total_notices': total_notices,
        'total_fee_collected': float(total_fee_collected),
        'total_fee_pending': float(total_fee_pending),
        'departments': DepartmentSerializer(Department.objects.all(), many=True).data,
        'courses': CourseSerializer(Course.objects.all(), many=True).data,
        'recent_notices': NoticeSerializer(Notice.objects.all()[:5], many=True).data,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_list_students(request):
    """List all registered student profiles."""
    students = UserProfile.objects.filter(role='student').order_by('roll_number')
    return Response(UserProfileSerializer(students, many=True).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_create_student(request):
    """Register a new student account, profile, and initial fee assignment."""
    data = request.data
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    roll_number = data.get('roll_number', '').strip()
    email = data.get('email', f"{roll_number.lower()}@college.edu").strip()
    username = data.get('username') or roll_number.lower()
    password = data.get('password') or 'student123'
    department_id = data.get('department_id')
    semester = int(data.get('semester', 1))
    section = data.get('section', 'A')
    phone = data.get('phone', '')
    blood_group = data.get('blood_group', 'O+')
    guardian_name = data.get('guardian_name', '')
    guardian_phone = data.get('guardian_phone', '')

    if not roll_number or not first_name:
        return Response({'error': 'First Name and Roll Number are required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': f'Username/Login ID "{username}" already exists'}, status=status.HTTP_400_BAD_REQUEST)

    if UserProfile.objects.filter(roll_number=roll_number).exists():
        return Response({'error': f'Student with Roll Number "{roll_number}" already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )

    dept = None
    if department_id:
        dept = Department.objects.filter(id=department_id).first()
    if not dept:
        dept = Department.objects.first()

    profile = UserProfile.objects.create(
        user=user,
        role='student',
        roll_number=roll_number,
        department=dept,
        semester=semester,
        section=section,
        phone=phone,
        blood_group=blood_group,
        guardian_name=guardian_name,
        guardian_phone=guardian_phone,
        admission_year=datetime.date.today().year
    )

    FeeRecord.objects.create(
        student=profile,
        title=f'Semester {semester} Tuition & Campus Facilities Fee',
        semester=semester,
        amount=45000.00,
        due_date=datetime.date.today() + datetime.timedelta(days=30),
        status='pending'
    )

    return Response({
        'message': f'Student {first_name} {last_name} ({roll_number}) registered successfully.',
        'student': UserProfileSerializer(profile).data
    }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def admin_delete_student(request, student_id):
    """Remove student account and associated academic records."""
    student = get_object_or_404(UserProfile, id=student_id, role='student')
    user = student.user
    roll = student.roll_number

    user.delete()

    return Response({
        'message': f'Student record {roll} deleted successfully.'
    })
