import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarCheck2, 
  Award, 
  Megaphone, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  BookOpen,
  Send,
  AlertCircle
} from 'lucide-react';
import erpApi from '../api/client';

export default function FacultyPortalView({ onDataChanged }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [examType, setExamType] = useState('End Semester');
  const [marks, setMarks] = useState('92');
  const [maxMarks, setMaxMarks] = useState('100');
  
  // Notice form
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState('urgent');
  const [noticeContent, setNoticeContent] = useState('');

  // Status message
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      const res = await erpApi.getFacultyOverview();
      setData(res);
      if (res.courses?.length > 0) {
        setSelectedCourse(res.courses[0].id);
      }
      if (res.students?.length > 0) {
        setSelectedStudent(res.students[0].id);
      }
    } catch (err) {
      console.error('Error fetching faculty data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Record attendance
  const handleMarkAttendance = async (statusVal) => {
    if (!selectedCourse || !selectedStudent) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await erpApi.markFacultyAttendance(selectedCourse, selectedStudent, statusVal, todayStr);
      showMsg(res.message);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      showMsg('Failed to record attendance', 'error');
    }
  };

  // Submit course grade
  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !selectedStudent) return;
    try {
      const res = await erpApi.submitFacultyGrade(
        selectedStudent,
        selectedCourse,
        5,
        examType,
        parseFloat(marks),
        parseFloat(maxMarks)
      );
      showMsg(res.message);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      showMsg('Failed to submit grade', 'error');
    }
  };

  // Publish circular
  const handlePublishNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;
    try {
      await erpApi.createNotice({
        title: noticeTitle,
        category: noticeCategory,
        content: noticeContent,
        target_role: 'all',
        is_pinned: noticeCategory === 'urgent'
      });
      showMsg('Circular published successfully.');
      setNoticeTitle('');
      setNoticeContent('');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      showMsg('Failed to post announcement', 'error');
    }
  };

  // Review leave application
  const handleDecideLeave = async (leaveId, decision) => {
    try {
      const res = await erpApi.decideFacultyLeave(leaveId, decision);
      showMsg(res.message);
      await fetchFacultyData();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      showMsg('Failed to update leave', 'error');
    }
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Faculty Workspace...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Faculty Header */}
      <div className="welcome-banner">
        <div>
          <span className="badge badge-primary">Department of Computer Science & Engineering</span>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '6px 0 2px 0' }}>
            Faculty Workspace: Dr. Alok Sharma
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Associate Professor & Academic Advisor • Department In-Charge
          </p>
        </div>

        <div className="flex gap-2" style={{ alignItems: 'center', background: 'var(--bg-subtle)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <BookOpen size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Academic Session: <strong style={{ color: 'var(--text-primary)' }}>Odd Semester 2025–26</strong>
          </span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          padding: '14px 20px',
          borderRadius: '12px',
          background: notification.type === 'error' ? 'var(--danger-bg)' : 'var(--success-bg)',
          border: notification.type === 'error' ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(16,185,129,0.4)',
          color: notification.type === 'error' ? '#fca5a5' : '#6ee7b7',
          fontWeight: '600',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Module: Daily Attendance Marker */}
        <div className="card">
          <div className="flex gap-2" style={{ alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <CalendarCheck2 size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Mark Class Attendance</h3>
          </div>

          <div className="form-group">
            <label>Select Course</label>
            <select className="form-control" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              {data?.courses?.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Student</label>
            <select className="form-control" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
              {data?.students?.map(s => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.roll_number}) - Sem {s.semester}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2" style={{ marginTop: '20px' }}>
            <button
              className="btn btn-success"
              style={{ flex: 1, padding: '12px' }}
              onClick={() => handleMarkAttendance('present')}
            >
              <CheckCircle2 size={16} />
              <span>Mark as PRESENT</span>
            </button>
            <button
              className="btn"
              style={{ flex: 1, padding: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}
              onClick={() => handleMarkAttendance('absent')}
            >
              <XCircle size={16} />
              <span>Mark as ABSENT</span>
            </button>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' }}>
            Attendance updates reflect immediately across student transcripts and shortfall calculations.
          </div>
        </div>

        {/* Module: Grade Submission */}
        <div className="card">
          <div className="flex gap-2" style={{ alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Award size={20} color="#fbbf24" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Enter / Update Marks & Grades</h3>
          </div>

          <form onSubmit={handleSubmitGrade}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Course</label>
                <select className="form-control" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                  {data?.courses?.map(c => (
                    <option key={c.id} value={c.id}>{c.code}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Exam Assessment</label>
                <select className="form-control" value={examType} onChange={(e) => setExamType(e.target.value)}>
                  <option value="End Semester">End Semester Final</option>
                  <option value="Internal 1">Internal Assessment 1</option>
                  <option value="Internal 2">Internal Assessment 2</option>
                  <option value="Practical">Practical Lab</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Marks Scored</label>
                <input
                  type="number"
                  className="form-control"
                  required
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="e.g. 88"
                />
              </div>
              <div className="form-group">
                <label>Max Marks</label>
                <input
                  type="number"
                  className="form-control"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              <Send size={15} />
              <span>Save Marks</span>
            </button>
          </form>
        </div>

        {/* Module: Post Announcement */}
        <div className="card">
          <div className="flex gap-2" style={{ alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Megaphone size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Publish Circular / Notice</h3>
          </div>

          <form onSubmit={handlePublishNotice}>
            <div className="form-group">
              <label>Notice Headline</label>
              <input
                type="text"
                className="form-control"
                required
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="e.g. Practical Exam Seating Matrix"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={noticeCategory} onChange={(e) => setNoticeCategory(e.target.value)}>
                <option value="urgent">Urgent Alert (Pinned)</option>
                <option value="academic">Academic & Schedule</option>
                <option value="exam">Examination Circular</option>
                <option value="event">Campus Event</option>
              </select>
            </div>

            <div className="form-group">
              <label>Full Content Details</label>
              <textarea
                className="form-control"
                rows="3"
                required
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                placeholder="Detailed instructions for students..."
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              <Send size={15} />
              <span>Publish Circular</span>
            </button>
          </form>
        </div>

        {/* Module: Pending Leave Review */}
        <div className="card">
          <div className="flex gap-2" style={{ alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Users size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Review Student Leave Requests</h3>
          </div>

          <div className="flex flex-col gap-2">
            {data?.pending_leaves?.length > 0 ? (
              data.pending_leaves.map(l => (
                <div key={l.id} style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div className="flex-between" style={{ alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>{l.leave_type} Leave</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{l.start_date} to {l.end_date}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {l.student_name} ({l.student_roll})
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    {l.reason}
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-success"
                      style={{ flex: 1, padding: '6px 12px', fontSize: '0.78rem' }}
                      onClick={() => handleDecideLeave(l.id, 'approved')}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1, padding: '6px 12px', fontSize: '0.78rem', color: '#f87171' }}
                      onClick={() => handleDecideLeave(l.id, 'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No pending leave applications to review.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
