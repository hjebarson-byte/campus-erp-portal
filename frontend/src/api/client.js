import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

let activeStudentId = null;

export const setActiveStudentId = (id) => {
  activeStudentId = id;
};

export const getActiveStudentId = () => activeStudentId;

api.interceptors.request.use((config) => {
  if (activeStudentId) {
    config.params = config.params || {};
    config.params.student_id = activeStudentId;
  }
  return config;
});

export const erpApi = {
  setActiveStudentId,
  // Student Dashboard overview
  getDashboardOverview: async (studentId = null) => {
    const params = studentId ? { student_id: studentId } : {};
    const res = await api.get('/dashboard/overview/', { params });
    return res.data;
  },

  // Attendance
  getAttendance: async () => {
    const res = await api.get('/attendance/');
    return res.data;
  },
  toggleAttendance: async (courseId, status, date) => {
    const res = await api.post('/attendance/toggle/', { course_id: courseId, status, date });
    return res.data;
  },

  // Timetable
  getTimetable: async (day = null, semester = null) => {
    const params = {};
    if (day) params.day = day;
    if (semester) params.semester = semester;
    const res = await api.get('/timetable/', { params });
    return res.data;
  },

  // Examination & Grades
  getExams: async (semester = null) => {
    const params = {};
    if (semester) params.semester = semester;
    const res = await api.get('/exams/', { params });
    return res.data;
  },

  // Fees
  getFees: async () => {
    const res = await api.get('/fees/');
    return res.data;
  },
  payFee: async (feeId, paymentMode = 'UPI (Instant NetBanking)') => {
    const res = await api.post('/fees/pay/', { fee_id: feeId, payment_mode: paymentMode });
    return res.data;
  },

  // Notices
  getNotices: async (category = 'all') => {
    const params = category !== 'all' ? { category } : {};
    const res = await api.get('/notices/', { params });
    return res.data;
  },
  createNotice: async (data) => {
    const res = await api.post('/notices/', data);
    return res.data;
  },

  // Assignments
  getAssignments: async () => {
    const res = await api.get('/assignments/');
    return res.data;
  },
  submitAssignment: async (assignmentId, submissionText, fileAttachment = 'project_report.pdf') => {
    const res = await api.post('/assignments/submit/', {
      assignment_id: assignmentId,
      submission_text: submissionText,
      file_attachment: fileAttachment
    });
    return res.data;
  },

  // Leaves
  getLeaves: async () => {
    const res = await api.get('/leaves/');
    return res.data;
  },
  applyLeave: async (data) => {
    const res = await api.post('/leaves/', data);
    return res.data;
  },

  // Faculty APIs
  getFacultyOverview: async () => {
    const res = await api.get('/faculty/overview/');
    return res.data;
  },
  markFacultyAttendance: async (courseId, studentId, status, date) => {
    const res = await api.post('/faculty/attendance/', {
      course_id: courseId,
      student_id: studentId,
      status,
      date
    });
    return res.data;
  },
  submitFacultyGrade: async (studentId, courseId, semester, examType, marks, maxMarks = 100) => {
    const res = await api.post('/faculty/grades/', {
      student_id: studentId,
      course_id: courseId,
      semester,
      exam_type: examType,
      marks,
      max_marks: maxMarks
    });
    return res.data;
  },
  decideFacultyLeave: async (leaveId, status, decisionReason = 'Approved by Faculty') => {
    const res = await api.post('/faculty/leaves/decide/', {
      leave_id: leaveId,
      status,
      decision_reason: decisionReason
    });
    return res.data;
  },

  // Admin APIs
  getAdminAnalytics: async () => {
    const res = await api.get('/admin/analytics/');
    return res.data;
  },
  getStudents: async () => {
    const res = await api.get('/admin/students/');
    return res.data;
  },
  createStudent: async (studentData) => {
    const res = await api.post('/admin/students/create/', studentData);
    return res.data;
  },
  deleteStudent: async (studentId) => {
    const res = await api.delete(`/admin/students/${studentId}/delete/`);
    return res.data;
  }
};

export default erpApi;
