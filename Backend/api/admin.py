from django.contrib import admin
from .models import (
    Department, UserProfile, Course, TimetableEntry,
    AttendanceRecord, ExamGrade, FeeRecord, Notice,
    Assignment, AssignmentSubmission, LeaveApplication
)

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'roll_number', 'department', 'semester', 'phone')
    list_filter = ('role', 'department', 'semester')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'roll_number')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'department', 'semester', 'credits', 'faculty')
    list_filter = ('department', 'semester')
    search_fields = ('code', 'name')

@admin.register(TimetableEntry)
class TimetableEntryAdmin(admin.ModelAdmin):
    list_display = ('day', 'start_time', 'end_time', 'course', 'room_number', 'department', 'semester')
    list_filter = ('day', 'department', 'semester')

@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'date', 'status', 'marked_by')
    list_filter = ('status', 'date', 'course')
    search_fields = ('student__roll_number', 'course__name')

@admin.register(ExamGrade)
class ExamGradeAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'semester', 'exam_type', 'marks_obtained', 'grade_letter', 'grade_point')
    list_filter = ('semester', 'exam_type', 'grade_letter')
    search_fields = ('student__roll_number', 'course__name')

@admin.register(FeeRecord)
class FeeRecordAdmin(admin.ModelAdmin):
    list_display = ('student', 'title', 'semester', 'amount', 'due_date', 'status', 'payment_date')
    list_filter = ('status', 'semester')
    search_fields = ('student__roll_number', 'title', 'transaction_id')

@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'target_role', 'is_pinned', 'created_at', 'posted_by')
    list_filter = ('category', 'target_role', 'is_pinned')
    search_fields = ('title', 'content')

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'due_date', 'max_marks', 'created_by')
    list_filter = ('course', 'due_date')
    search_fields = ('title',)

@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'student', 'submitted_at', 'status', 'score')
    list_filter = ('status',)
    search_fields = ('student__roll_number', 'assignment__title')

@admin.register(LeaveApplication)
class LeaveApplicationAdmin(admin.ModelAdmin):
    list_display = ('student', 'leave_type', 'start_date', 'end_date', 'status', 'applied_at')
    list_filter = ('status', 'leave_type')
    search_fields = ('student__roll_number', 'reason')
