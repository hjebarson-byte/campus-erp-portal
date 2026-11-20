import datetime
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import (
    Department,
    UserProfile,
    Course,
    TimetableEntry,
    AttendanceRecord,
    ExamGrade,
    FeeRecord,
    Notice,
    Assignment,
    LeaveApplication,
)


class CampusERPApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.dept = Department.objects.create(
            name="Computer Science & Engineering",
            code="CSE",
            description="CSE Department",
        )

        # Faculty
        self.faculty_user = User.objects.create_user(
            username="dr_alok",
            password="password123",
            first_name="Alok",
            last_name="Sharma",
        )
        self.faculty = UserProfile.objects.create(
            user=self.faculty_user,
            role="faculty",
            department=self.dept,
        )

        # Student
        self.student_user = User.objects.create_user(
            username="2023cs1001",
            password="password123",
            first_name="Aravind",
            last_name="Krishna",
        )
        self.student = UserProfile.objects.create(
            user=self.student_user,
            role="student",
            roll_number="2023CS1001",
            department=self.dept,
            semester=5,
            section="A",
        )

        # Course
        self.course = Course.objects.create(
            code="CS501",
            name="Operating Systems",
            department=self.dept,
            semester=5,
            credits=4,
            faculty=self.faculty,
        )

        # Timetable
        TimetableEntry.objects.create(
            department=self.dept,
            semester=5,
            section="A",
            course=self.course,
            day="Monday",
            start_time=datetime.time(9, 0),
            end_time=datetime.time(10, 0),
            room_number="LH-301",
            faculty=self.faculty,
        )

        # Attendance
        AttendanceRecord.objects.create(
            student=self.student,
            course=self.course,
            date=datetime.date(2025, 10, 1),
            status="present",
            marked_by=self.faculty,
        )

        # Exam Grade
        ExamGrade.objects.create(
            student=self.student,
            course=self.course,
            semester=5,
            exam_type="End Semester",
            marks_obtained=92,
            max_marks=100,
            grade_point=10.0,
            grade_letter="O",
        )

        # Fee Record
        self.fee = FeeRecord.objects.create(
            student=self.student,
            title="Semester 5 Tuition Fee",
            semester=5,
            amount=45000.00,
            due_date=datetime.date(2025, 12, 1),
            status="pending",
        )

        # Assignment
        self.assignment = Assignment.objects.create(
            course=self.course,
            title="Kernel Scheduler Lab",
            description="Implement Round Robin scheduler",
            due_date=datetime.date(2025, 11, 20),
            max_marks=20,
        )

        # Notice
        Notice.objects.create(
            title="Midterm Exams Schedule",
            content="Midterms begin next Monday.",
            category="exam",
            posted_by=self.faculty,
            is_pinned=True,
        )

    def test_dashboard_and_profile(self):
        res = self.client.get(f"/api/dashboard/overview/?student_id={self.student.id}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["student"]["roll_number"], "2023CS1001")
        self.assertEqual(res.data["metrics"]["overall_attendance"], 100.0)
        self.assertEqual(res.data["metrics"]["total_dues"], 45000.0)

        profile_res = self.client.get(f"/api/profile/?student_id={self.student.id}")
        self.assertEqual(profile_res.status_code, 200)
        self.assertEqual(profile_res.data["roll_number"], "2023CS1001")

    def test_attendance_get_and_toggle_validation(self):
        res = self.client.get(f"/api/attendance/?student_id={self.student.id}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["percentage"], 100.0)

        # Valid toggle
        res_ok = self.client.post(
            f"/api/attendance/toggle/?student_id={self.student.id}",
            {"course_id": self.course.id, "status": "absent", "date": "2025-10-02"},
            format="json",
        )
        self.assertEqual(res_ok.status_code, 200)

        # Invalid status
        res_bad_status = self.client.post(
            f"/api/attendance/toggle/?student_id={self.student.id}",
            {"course_id": self.course.id, "status": "invalid_status", "date": "2025-10-02"},
            format="json",
        )
        self.assertEqual(res_bad_status.status_code, 400)

        # Invalid date
        res_bad_date = self.client.post(
            f"/api/attendance/toggle/?student_id={self.student.id}",
            {"course_id": self.course.id, "status": "present", "date": "not-a-date"},
            format="json",
        )
        self.assertEqual(res_bad_date.status_code, 400)

    def test_timetable_and_exams_validation(self):
        res_tt = self.client.get(f"/api/timetable/?student_id={self.student.id}&day=Monday")
        self.assertEqual(res_tt.status_code, 200)
        self.assertEqual(len(res_tt.data), 1)

        res_tt_bad = self.client.get("/api/timetable/?semester=abc")
        self.assertEqual(res_tt_bad.status_code, 400)

        res_ex = self.client.get(f"/api/exams/?student_id={self.student.id}&semester=5")
        self.assertEqual(res_ex.status_code, 200)
        self.assertEqual(res_ex.data["sgpa"], 10.0)

        res_ex_bad = self.client.get("/api/exams/?semester=xyz")
        self.assertEqual(res_ex_bad.status_code, 400)

    def test_fee_payment_and_double_pay_protection(self):
        # First payment succeeds
        res1 = self.client.post(
            "/api/fees/pay/",
            {"fee_id": self.fee.id, "payment_mode": "Institutional NetBanking"},
            format="json",
        )
        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res1.data["fee"]["status"], "paid")
        self.assertEqual(res1.data["fee"]["payment_mode"], "Institutional NetBanking")

        # Second payment on same voucher rejected
        res2 = self.client.post(
            "/api/fees/pay/",
            {"fee_id": self.fee.id, "payment_mode": "UPI"},
            format="json",
        )
        self.assertEqual(res2.status_code, 400)

        # Missing fee_id rejected
        res3 = self.client.post("/api/fees/pay/", {}, format="json")
        self.assertEqual(res3.status_code, 400)

    def test_assignment_submission_reflects_in_my_submission(self):
        # Before submission
        res_before = self.client.get(f"/api/assignments/?student_id={self.student.id}")
        self.assertEqual(res_before.status_code, 200)
        self.assertIsNone(res_before.data[0]["my_submission"])

        # Submit
        res_sub = self.client.post(
            f"/api/assignments/submit/?student_id={self.student.id}",
            {
                "assignment_id": self.assignment.id,
                "submission_text": "Done",
                "file_attachment": "scheduler.pdf",
            },
            format="json",
        )
        self.assertEqual(res_sub.status_code, 200)

        # After submission -> my_submission MUST be populated!
        res_after = self.client.get(f"/api/assignments/?student_id={self.student.id}")
        self.assertEqual(res_after.status_code, 200)
        self.assertIsNotNone(res_after.data[0]["my_submission"])
        self.assertEqual(res_after.data[0]["my_submission"]["file_attachment"], "scheduler.pdf")

    def test_leave_application_and_validation(self):
        # Missing fields -> 400
        res_missing = self.client.post(
            f"/api/leaves/?student_id={self.student.id}",
            {"leave_type": "medical", "reason": ""},
            format="json",
        )
        self.assertEqual(res_missing.status_code, 400)

        # End date before start date -> 400
        res_backwards = self.client.post(
            f"/api/leaves/?student_id={self.student.id}",
            {
                "leave_type": "medical",
                "start_date": "2025-10-15",
                "end_date": "2025-10-10",
                "reason": "Fever",
            },
            format="json",
        )
        self.assertEqual(res_backwards.status_code, 400)

        # Invalid leave_type -> 400
        res_bad_type = self.client.post(
            f"/api/leaves/?student_id={self.student.id}",
            {
                "leave_type": "vacation",
                "start_date": "2025-10-10",
                "end_date": "2025-10-12",
                "reason": "Trip",
            },
            format="json",
        )
        self.assertEqual(res_bad_type.status_code, 400)

        # Valid leave
        res_ok = self.client.post(
            f"/api/leaves/?student_id={self.student.id}",
            {
                "leave_type": "duty",
                "start_date": "2025-10-10",
                "end_date": "2025-10-12",
                "reason": "National Hackathon",
            },
            format="json",
        )
        self.assertEqual(res_ok.status_code, 201)
        leave_id = res_ok.data["leave"]["id"]

        # Faculty invalid decision -> 400
        res_bad_dec = self.client.post(
            "/api/faculty/leaves/decide/",
            {"leave_id": leave_id, "status": "maybe"},
            format="json",
        )
        self.assertEqual(res_bad_dec.status_code, 400)

        # Faculty approve -> 200
        res_app = self.client.post(
            "/api/faculty/leaves/decide/",
            {"leave_id": leave_id, "status": "approved"},
            format="json",
        )
        self.assertEqual(res_app.status_code, 200)
        self.assertEqual(res_app.data["leave"]["status"], "approved")

    def test_faculty_grade_validation(self):
        # Division by zero (max_marks=0) -> 400
        res_zero = self.client.post(
            "/api/faculty/grades/",
            {
                "student_id": self.student.id,
                "course_id": self.course.id,
                "marks": 50,
                "max_marks": 0,
            },
            format="json",
        )
        self.assertEqual(res_zero.status_code, 400)

        # Marks > max_marks -> 400
        res_over = self.client.post(
            "/api/faculty/grades/",
            {
                "student_id": self.student.id,
                "course_id": self.course.id,
                "marks": 120,
                "max_marks": 100,
            },
            format="json",
        )
        self.assertEqual(res_over.status_code, 400)

        # Valid grade
        res_ok = self.client.post(
            "/api/faculty/grades/",
            {
                "student_id": self.student.id,
                "course_id": self.course.id,
                "semester": 5,
                "exam_type": "Internal 1",
                "marks": 84,
                "max_marks": 100,
            },
            format="json",
        )
        self.assertEqual(res_ok.status_code, 200)
        self.assertEqual(res_ok.data["grade"]["grade_letter"], "A+")

    def test_admin_student_crud_and_validation(self):
        # Invalid semester -> 400
        res_bad_sem = self.client.post(
            "/api/admin/students/create/",
            {"first_name": "Test", "roll_number": "2025CS9999", "semester": 12},
            format="json",
        )
        self.assertEqual(res_bad_sem.status_code, 400)

        # Valid create -> 201
        res_create = self.client.post(
            "/api/admin/students/create/",
            {
                "first_name": "Priya",
                "last_name": "Nair",
                "roll_number": "2025CS2001",
                "department_id": self.dept.id,
                "semester": 3,
                "section": "B",
            },
            format="json",
        )
        self.assertEqual(res_create.status_code, 201)
        new_id = res_create.data["student"]["id"]

        # Duplicate roll number -> 400
        res_dup = self.client.post(
            "/api/admin/students/create/",
            {"first_name": "Duplicate", "roll_number": "2025CS2001", "semester": 3},
            format="json",
        )
        self.assertEqual(res_dup.status_code, 400)

        # Delete -> 200
        res_del = self.client.delete(f"/api/admin/students/{new_id}/delete/")
        self.assertEqual(res_del.status_code, 200)
