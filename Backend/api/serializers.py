from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Department, UserProfile, Course, TimetableEntry,
    AttendanceRecord, ExamGrade, FeeRecord, Notice,
    Assignment, AssignmentSubmission, LeaveApplication
)

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department_details = DepartmentSerializer(source='department', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = '__all__'

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class CourseSerializer(serializers.ModelSerializer):
    department_code = serializers.CharField(source='department.code', read_only=True)
    faculty_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def get_faculty_name(self, obj):
        if obj.faculty and obj.faculty.user:
            return obj.faculty.user.get_full_name() or obj.faculty.user.username
        return 'TBA'


class TimetableEntrySerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    faculty_name = serializers.SerializerMethodField()

    class Meta:
        model = TimetableEntry
        fields = '__all__'

    def get_faculty_name(self, obj):
        if obj.faculty and obj.faculty.user:
            return obj.faculty.user.get_full_name() or obj.faculty.user.username
        return 'TBA'


class AttendanceRecordSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = '__all__'


class ExamGradeSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    credits = serializers.IntegerField(source='course.credits', read_only=True)

    class Meta:
        model = ExamGrade
        fields = '__all__'


class FeeRecordSerializer(serializers.ModelSerializer):
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)

    class Meta:
        model = FeeRecord
        fields = '__all__'


class NoticeSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Notice
        fields = '__all__'

    def get_posted_by_name(self, obj):
        if obj.posted_by and obj.posted_by.user:
            return obj.posted_by.user.get_full_name() or obj.posted_by.user.username
        return 'Dean Office'


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)

    class Meta:
        model = AssignmentSubmission
        fields = '__all__'


class AssignmentSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    submission_count = serializers.SerializerMethodField()
    my_submission = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = '__all__'

    def get_submission_count(self, obj):
        return obj.submissions.count()

    def get_my_submission(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'profile'):
            sub = obj.submissions.filter(student=request.user.profile).first()
            if sub:
                return AssignmentSubmissionSerializer(sub).data
        return None


class LeaveApplicationSerializer(serializers.ModelSerializer):
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)

    class Meta:
        model = LeaveApplication
        fields = '__all__'
