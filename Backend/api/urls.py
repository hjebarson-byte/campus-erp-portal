from django.urls import path
from . import views

urlpatterns = [
    # Auth & Student
    path('auth/login/', views.api_login, name='api_login'),
    path('profile/', views.get_user_profile, name='get_user_profile'),
    path('dashboard/overview/', views.dashboard_overview, name='dashboard_overview'),
    path('attendance/', views.student_attendance_detail, name='student_attendance_detail'),
    path('attendance/toggle/', views.toggle_attendance_record, name='toggle_attendance_record'),
    path('timetable/', views.timetable_schedule, name='timetable_schedule'),
    path('exams/', views.exam_results, name='exam_results'),
    path('fees/', views.fee_history, name='fee_history'),
    path('fees/pay/', views.pay_fee_mock, name='pay_fee_mock'),
    path('notices/', views.notices_list_create, name='notices_list_create'),
    path('assignments/', views.assignments_list, name='assignments_list'),
    path('assignments/submit/', views.submit_assignment, name='submit_assignment'),
    path('leaves/', views.leave_applications, name='leave_applications'),

    # Faculty Endpoints
    path('faculty/overview/', views.faculty_overview, name='faculty_overview'),
    path('faculty/attendance/', views.faculty_mark_attendance, name='faculty_mark_attendance'),
    path('faculty/grades/', views.faculty_submit_grade, name='faculty_submit_grade'),
    path('faculty/leaves/decide/', views.faculty_decide_leave, name='faculty_decide_leave'),

    # Admin Endpoints
    path('admin/analytics/', views.admin_analytics, name='admin_analytics'),
    path('admin/students/', views.admin_list_students, name='admin_list_students'),
    path('admin/students/create/', views.admin_create_student, name='admin_create_student'),
    path('admin/students/<int:student_id>/delete/', views.admin_delete_student, name='admin_delete_student'),
]
