import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import (
    Department, UserProfile, Course, TimetableEntry,
    AttendanceRecord, ExamGrade, FeeRecord, Notice,
    Assignment, AssignmentSubmission, LeaveApplication
)

class Command(BaseCommand):
    help = 'Seeds initial realistic college ERP data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding College ERP Portal data...")

        # 1. Departments
        cse, _ = Department.objects.get_or_create(
            code='CSE',
            defaults={'name': 'Computer Science & Engineering', 'description': 'School of Computing and Informatics'}
        )
        ece, _ = Department.objects.get_or_create(
            code='ECE',
            defaults={'name': 'Electronics & Communication', 'description': 'School of Electronics and Hardware Systems'}
        )

        # 2. Users & Profiles
        # Faculty
        fac_user, _ = User.objects.get_or_create(
            username='prof_sharma',
            defaults={'first_name': 'Dr. Alok', 'last_name': 'Sharma', 'email': 'sharma@college.edu'}
        )
        fac_user.set_password('faculty123')
        fac_user.save()
        fac_profile, _ = UserProfile.objects.get_or_create(
            user=fac_user,
            defaults={'role': 'faculty', 'department': cse, 'phone': '+91 98765 43210'}
        )

        # Student
        std_user, _ = User.objects.get_or_create(
            username='student',
            defaults={'first_name': 'Aravind', 'last_name': 'Krishna', 'email': 'aravind.k@student.college.edu'}
        )
        std_user.set_password('student123')
        std_user.save()
        std_profile, _ = UserProfile.objects.get_or_create(
            user=std_user,
            defaults={
                'role': 'student',
                'roll_number': '2023CS1042',
                'department': cse,
                'semester': 5,
                'section': 'A',
                'phone': '+91 91234 56789',
                'blood_group': 'O+',
                'guardian_name': 'K. Ramanathan',
                'guardian_phone': '+91 98401 23456',
                'admission_year': 2023
            }
        )

        # 3. Courses
        courses_data = [
            ('CS501', 'Database Management Systems', 4),
            ('CS502', 'Computer Networks & Security', 4),
            ('CS503', 'Theory of Computation', 3),
            ('CS504', 'Machine Learning & AI Basics', 4),
            ('CS505', 'Cloud Computing & DevOps', 3),
            ('CS506', 'Database & Networks Lab', 2),
        ]
        created_courses = []
        for code, name, credits in courses_data:
            course, _ = Course.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'department': cse,
                    'semester': 5,
                    'credits': credits,
                    'faculty': fac_profile
                }
            )
            created_courses.append(course)

        # 4. Timetable
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        schedule_slots = [
            (datetime.time(9, 0), datetime.time(10, 0), 'LH-301'),
            (datetime.time(10, 0), datetime.time(11, 0), 'LH-301'),
            (datetime.time(11, 15), datetime.time(12, 15), 'LH-302'),
            (datetime.time(13, 15), datetime.time(14, 15), 'Lab-3 (Computing Center)'),
            (datetime.time(14, 15), datetime.time(15, 15), 'Lab-3 (Computing Center)'),
        ]
        for day_idx, day in enumerate(days):
            for slot_idx, (start, end, room) in enumerate(schedule_slots):
                course = created_courses[(day_idx + slot_idx) % len(created_courses)]
                TimetableEntry.objects.get_or_create(
                    department=cse,
                    semester=5,
                    section='A',
                    day=day,
                    start_time=start,
                    defaults={
                        'end_time': end,
                        'room_number': room,
                        'course': course,
                        'faculty': fac_profile
                    }
                )

        # 5. Attendance Records (simulating past 30 days)
        today = datetime.date.today()
        for course_idx, course in enumerate(created_courses):
            for i in range(1, 25):
                log_date = today - datetime.timedelta(days=i)
                # Skip Sundays
                if log_date.weekday() == 6:
                    continue
                # Make some subjects high and one subject lower (e.g. 71% to demonstrate warning)
                if course.code == 'CS503':
                    status = 'present' if (i % 3 != 0) else 'absent'
                else:
                    status = 'present' if (i % 6 != 0) else 'absent'

                AttendanceRecord.objects.get_or_create(
                    student=std_profile,
                    course=course,
                    date=log_date,
                    defaults={'status': status, 'marked_by': fac_profile}
                )

        # 6. Exam Grades
        grades_data = [
            ('CS501', 'End Semester', 88.0, 100.0, 9.0, 'A+'),
            ('CS502', 'End Semester', 82.0, 100.0, 8.5, 'A'),
            ('CS503', 'End Semester', 74.0, 100.0, 7.5, 'B+'),
            ('CS504', 'End Semester', 94.0, 100.0, 10.0, 'O'),
            ('CS505', 'End Semester', 85.0, 100.0, 8.5, 'A'),
            ('CS506', 'Practical', 96.0, 100.0, 10.0, 'O'),
        ]
        for c_code, exam_t, marks, max_m, gp, gl in grades_data:
            c = Course.objects.get(code=c_code)
            ExamGrade.objects.get_or_create(
                student=std_profile,
                course=c,
                semester=5,
                exam_type=exam_t,
                defaults={
                    'marks_obtained': marks,
                    'max_marks': max_m,
                    'grade_point': gp,
                    'grade_letter': gl
                }
            )

        # 7. Fee Records
        FeeRecord.objects.get_or_create(
            student=std_profile,
            title='Semester 5 Tuition Fee',
            semester=5,
            defaults={
                'amount': 45000.00,
                'due_date': today - datetime.timedelta(days=20),
                'status': 'paid',
                'payment_date': today - datetime.timedelta(days=25),
                'transaction_id': 'TXN-2026-TUIT-98124',
                'payment_mode': 'Online UPI'
            }
        )
        FeeRecord.objects.get_or_create(
            student=std_profile,
            title='Examination & Lab Consumables Fee',
            semester=5,
            defaults={
                'amount': 3500.00,
                'due_date': today - datetime.timedelta(days=10),
                'status': 'paid',
                'payment_date': today - datetime.timedelta(days=12),
                'transaction_id': 'TXN-2026-EXAM-44102',
                'payment_mode': 'Net Banking'
            }
        )
        FeeRecord.objects.get_or_create(
            student=std_profile,
            title='Hostel & Mess Charges (Term 2)',
            semester=5,
            defaults={
                'amount': 28000.00,
                'due_date': today + datetime.timedelta(days=15),
                'status': 'pending',
                'payment_mode': 'Pending Checkout'
            }
        )
        FeeRecord.objects.get_or_create(
            student=std_profile,
            title='Annual Library & Digital Resource Subscription',
            semester=5,
            defaults={
                'amount': 1500.00,
                'due_date': today + datetime.timedelta(days=5),
                'status': 'pending',
                'payment_mode': 'Pending Checkout'
            }
        )

        # 8. Notices
        Notice.objects.get_or_create(
            title='Mid-Semester Examination Schedule Announced',
            defaults={
                'content': 'The Mid-Term theory examinations for 3rd and 5th-semester students commence from October 12, 2026. Detailed seating arrangement will be posted on student dashboards.',
                'category': 'exam',
                'target_role': 'student',
                'is_pinned': True,
                'posted_by': fac_profile
            }
        )
        Notice.objects.get_or_create(
            title='Annual Tech Fest - HackInfinity 2026 Registrations Open',
            defaults={
                'content': 'Teams of up to 4 students can register for the 36-hour flagship hackathon with cash prizes worth INR 2,00,000. Check the portal for tracks & rules.',
                'category': 'event',
                'target_role': 'all',
                'is_pinned': True,
                'posted_by': fac_profile
            }
        )
        Notice.objects.get_or_create(
            title='Google & Microsoft On-Campus Placement Drive for Final & Pre-Final Batches',
            defaults={
                'content': 'Eligible students with CGPA >= 7.5 and no active backlogs must upload their updated resume before Friday, 5 PM.',
                'category': 'placement',
                'target_role': 'student',
                'is_pinned': False,
                'posted_by': fac_profile
            }
        )
        Notice.objects.get_or_create(
            title='Notice Regarding 75% Minimum Attendance Requirement for End-Sem Exam',
            defaults={
                'content': 'Students falling below 75% aggregate attendance without verified medical or on-duty approval will not be issued Hall Tickets as per University statutory norms.',
                'category': 'urgent',
                'target_role': 'student',
                'is_pinned': False,
                'posted_by': fac_profile
            }
        )

        # 9. Assignments
        asg1, _ = Assignment.objects.get_or_create(
            course=created_courses[0],
            title='ER Diagram & Relational Schema Normalization (3NF/BCNF)',
            defaults={
                'description': 'Design a normalized database schema for a Healthcare Hospital Management System with sample SQL queries.',
                'due_date': today + datetime.timedelta(days=3),
                'max_marks': 20,
                'created_by': fac_profile
            }
        )
        asg2, _ = Assignment.objects.get_or_create(
            course=created_courses[3],
            title='Predictive Model using Linear Regression and Random Forests',
            defaults={
                'description': 'Implement regression analysis on the Housing Price Dataset. Include feature correlation heatmaps and evaluate MSE & R2 score.',
                'due_date': today + datetime.timedelta(days=7),
                'max_marks': 25,
                'created_by': fac_profile
            }
        )

        # 10. Leave Applications
        LeaveApplication.objects.get_or_create(
            student=std_profile,
            leave_type='duty',
            start_date=today - datetime.timedelta(days=8),
            end_date=today - datetime.timedelta(days=7),
            defaults={
                'reason': 'Represented College in Inter-Collegiate State Level Coding Marathon (First Place).',
                'status': 'approved',
                'decision_reason': 'Verified by Department Faculty Coordinator.'
            }
        )

        self.stdout.write(self.style.SUCCESS("Successfully seeded comprehensive dynamic College ERP data!"))
