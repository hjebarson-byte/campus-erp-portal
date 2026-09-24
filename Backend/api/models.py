from django.db import models
from django.contrib.auth.models import User
from django.db.models import Avg, Sum, Count, Q

class Department(models.Model):
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.name} ({self.code})"


class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('faculty', 'Faculty'),
        ('admin', 'Administrator'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    roll_number = models.CharField(max_length=50, blank=True, null=True, unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    semester = models.IntegerField(default=1, blank=True, null=True)
    section = models.CharField(max_length=10, default='A', blank=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    blood_group = models.CharField(max_length=10, blank=True, default='')
    guardian_name = models.CharField(max_length=120, blank=True, default='')
    guardian_phone = models.CharField(max_length=20, blank=True, default='')
    avatar_url = models.CharField(max_length=255, blank=True, default='')
    admission_year = models.IntegerField(default=2023, blank=True, null=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.role.upper()} - {self.roll_number or 'N/A'})"


class Course(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=150)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='courses')
    semester = models.IntegerField(default=1)
    credits = models.IntegerField(default=3)
    faculty = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': 'faculty'})

    def __str__(self):
        return f"{self.code} - {self.name} (Sem {self.semester})"


class TimetableEntry(models.Model):
    DAY_CHOICES = (
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
    )

    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    semester = models.IntegerField(default=1)
    section = models.CharField(max_length=10, default='A')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    day = models.CharField(max_length=20, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room_number = models.CharField(max_length=50)
    faculty = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.day} {self.start_time}-{self.end_time}: {self.course.name} ({self.room_number})"


class AttendanceRecord(models.Model):
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('on_leave', 'On Leave'),
    )

    student = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='attendance_records', limit_choices_to={'role': 'student'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendance_logs')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present')
    marked_by = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='marked_attendances')

    class Meta:
        unique_together = ('student', 'course', 'date')

    def __str__(self):
        return f"{self.student.roll_number} - {self.course.code} - {self.date}: {self.status}"


class ExamGrade(models.Model):
    EXAM_TYPE_CHOICES = (
        ('Internal 1', 'Internal Assessment 1'),
        ('Internal 2', 'Internal Assessment 2'),
        ('Practical', 'Practical Lab Exam'),
        ('End Semester', 'End Semester Final Exam'),
    )

    student = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='grades', limit_choices_to={'role': 'student'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    semester = models.IntegerField(default=1)
    exam_type = models.CharField(max_length=50, choices=EXAM_TYPE_CHOICES, default='End Semester')
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    max_marks = models.DecimalField(max_digits=5, decimal_places=2, default=100.0)
    grade_point = models.DecimalField(max_digits=4, decimal_places=2, default=8.0)
    grade_letter = models.CharField(max_length=5, default='A')

    def __str__(self):
        return f"{self.student.roll_number} - {self.course.code} ({self.exam_type}): {self.marks_obtained}/{self.max_marks}"


class FeeRecord(models.Model):
    STATUS_CHOICES = (
        ('paid', 'Paid'),
        ('pending', 'Pending'),
        ('overdue', 'Overdue'),
    )

    student = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='fee_records', limit_choices_to={'role': 'student'})
    title = models.CharField(max_length=150)
    semester = models.IntegerField(default=1)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_date = models.DateField(blank=True, null=True)
    transaction_id = models.CharField(max_length=100, blank=True, default='')
    payment_mode = models.CharField(max_length=50, blank=True, default='Online UPI / NetBanking')

    def __str__(self):
        return f"{self.student.roll_number} - {self.title}: ₹{self.amount} ({self.status})"


class Notice(models.Model):
    CATEGORY_CHOICES = (
        ('urgent', 'Urgent Announcement'),
        ('academic', 'Academic & Exams'),
        ('event', 'Campus Event / Sports'),
        ('placement', 'Placement & Internships'),
        ('general', 'General Notice'),
    )

    TARGET_ROLE_CHOICES = (
        ('all', 'All Campus'),
        ('student', 'Students Only'),
        ('faculty', 'Faculty Only'),
    )

    title = models.CharField(max_length=250)
    content = models.TextField()
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='general')
    target_role = models.CharField(max_length=20, choices=TARGET_ROLE_CHOICES, default='all')
    posted_by = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_pinned = models.BooleanField(default=False)

    class Meta:
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return f"[{self.category.upper()}] {self.title}"


class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    description = models.TextField()
    due_date = models.DateField()
    max_marks = models.IntegerField(default=20)
    created_by = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.course.code} - {self.title} (Due: {self.due_date})"


class AssignmentSubmission(models.Model):
    STATUS_CHOICES = (
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
        ('late', 'Submitted Late'),
    )

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='assignment_submissions')
    submitted_at = models.DateTimeField(auto_now_add=True)
    submission_text = models.TextField(blank=True, default='')
    file_attachment = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True, default='')

    class Meta:
        unique_together = ('assignment', 'student')

    def __str__(self):
        return f"{self.student.roll_number} - {self.assignment.title}"


class LeaveApplication(models.Model):
    TYPE_CHOICES = (
        ('medical', 'Medical Leave'),
        ('duty', 'On-Duty (Hackathon/Symposium)'),
        ('personal', 'Personal Leave'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    student = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='leave_applications')
    leave_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='medical')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    decision_reason = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.student.roll_number} - {self.leave_type} ({self.status})"
