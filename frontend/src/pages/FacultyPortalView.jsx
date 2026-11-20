import React, { useState, useEffect } from 'react';
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

  const handleMarkAttendance = async (statusVal) => {
    if (!selectedCourse || !selectedStudent) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await erpApi.markFacultyAttendance(
        selectedCourse,
        selectedStudent,
        statusVal,
        todayStr
      );
      showMsg(res.message);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      showMsg('Failed to record attendance', 'error');
    }
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !selectedStudent) return;

    const numericMarks = parseFloat(marks);
    const numericMax = parseFloat(maxMarks);
    if (Number.isNaN(numericMarks) || Number.isNaN(numericMax) || numericMax <= 0) {
      showMsg('Marks and Max Marks must be valid numbers (Max Marks > 0).', 'error');
      return;
    }
    if (numericMarks < 0 || numericMarks > numericMax) {
      showMsg(`Marks scored must be between 0 and ${numericMax}.`, 'error');
      return;
    }

    const courseObj = data?.courses?.find((c) => String(c.id) === String(selectedCourse));
    const targetSemester = courseObj?.semester || 5;

    try {
      const res = await erpApi.submitFacultyGrade(
        selectedStudent,
        selectedCourse,
        targetSemester,
        examType,
        numericMarks,
        numericMax
      );
      showMsg(res.message);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      showMsg(err.response?.data?.error || 'Failed to submit grade', 'error');
    }
  };

  const handlePublishNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;
    try {
      await erpApi.createNotice({
        title: noticeTitle,
        category: noticeCategory,
        content: noticeContent,
        target_role: 'all',
        is_pinned: noticeCategory === 'urgent',
      });
      showMsg('Institutional circular published to student noticeboard.');
      setNoticeTitle('');
      setNoticeContent('');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      showMsg('Failed to post announcement', 'error');
    }
  };

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
    return (
      <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm text-center font-body-lg text-on-surface-variant">
        Loading Faculty Instructional Console...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Faculty Instructional Console
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Department of Computer Science &amp; Engineering
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
            Welcome back, Dr. Alok Sharma
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-on-surface">
              Associate Professor &amp; Senior Academic Advisor
            </span>
            <span className="text-outline-variant">•</span>
            <span>Fall 2025 Academic Cycle</span>
            <span className="text-outline-variant">•</span>
            <span className="font-medium text-secondary">
              {data?.courses?.length || 0} Assigned Courses • {data?.students?.length || 0} Advisees
            </span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap shrink-0">
          <button
            onClick={fetchFacultyData}
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg rounded-lg shadow-md transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">sync</span>
            <span>Sync Roster</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-space-md rounded-xl border flex items-center justify-between shadow-sm ${
            notification.type === 'error'
              ? 'bg-error/10 border-error/30 text-error'
              : 'bg-surface-container-low border-secondary/30 text-on-tertiary-container'
          }`}
        >
          <div className="flex items-center gap-2 font-label-lg text-label-lg font-semibold">
            <span className="material-symbols-outlined">
              {notification.type === 'error' ? 'error' : 'verified'}
            </span>
            <span>{notification.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* 8-col / 4-col Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left 8 Columns: Attendance Register & Grade Entry */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Mark Daily Class Attendance */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">how_to_reg</span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Daily Lecture Attendance Register
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold">
                Real-Time SIS Sync
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="form-group mb-0">
                <label>Select Course Section</label>
                <select
                  className="form-control"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {data?.courses?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-0">
                <label>Select Enrolled Student</label>
                <select
                  className="form-control"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  {data?.students?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.roll_number}) — Sem {s.semester}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-space-sm pt-space-xs">
              <button
                type="button"
                onClick={() => handleMarkAttendance('present')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-on-tertiary-container hover:opacity-95 text-on-primary font-label-lg text-label-lg font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span>Certify PRESENT</span>
              </button>
              <button
                type="button"
                onClick={() => handleMarkAttendance('absent')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-error/10 hover:bg-error hover:text-on-error text-error font-label-lg text-label-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">cancel</span>
                <span>Mark ABSENT</span>
              </button>
            </div>
          </div>

          {/* CBCS Grade & Assessment Entry */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">workspace_premium</span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  CBCS Grade &amp; Marks Submission
                </h2>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Controller of Examinations Direct Feed
              </span>
            </div>

            <form onSubmit={handleSubmitGrade} className="flex flex-col gap-space-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="form-group mb-0">
                  <label>Course Code</label>
                  <select
                    className="form-control"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    {data?.courses?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-0">
                  <label>Assessment Category</label>
                  <select
                    className="form-control"
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                  >
                    <option value="End Semester">End Semester Final Examination</option>
                    <option value="Internal 1">Continuous Internal Assessment 1</option>
                    <option value="Internal 2">Continuous Internal Assessment 2</option>
                    <option value="Practical">Laboratory Practical Evaluation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="form-group mb-0">
                  <label>Marks Awarded</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    placeholder="e.g. 92"
                  />
                </div>
                <div className="form-group mb-0">
                  <label>Maximum Marks</label>
                  <input
                    type="number"
                    className="form-control"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    placeholder="100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg font-semibold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">publish</span>
                <span>Commit Marks to Student Transcript</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right 5 Columns: Leave Approval Queue & Circular Broadcast */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Student Leave Approval Queue */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error">event_busy</span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Leave &amp; OD Adjudication Queue
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded font-label-sm text-label-sm font-bold bg-error/10 text-error">
                {data?.pending_leaves?.length || 0} Pending
              </span>
            </div>

            <div className="space-y-space-sm">
              {data?.pending_leaves?.length > 0 ? (
                data.pending_leaves.map((l) => (
                  <div
                    key={l.id}
                    className="p-space-md rounded-xl bg-surface hover:bg-surface-container-low transition-colors flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm uppercase font-semibold">
                        {l.leave_type} Petition
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {l.start_date} → {l.end_date}
                      </span>
                    </div>
                    <div className="font-label-lg text-label-lg font-bold text-on-surface">
                      {l.student_name}{' '}
                      <span className="text-on-surface-variant font-normal">
                        ({l.student_roll})
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{l.reason}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDecideLeave(l.id, 'approved')}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-label-sm text-label-sm font-semibold transition-all"
                      >
                        Approve Exemption
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecideLeave(l.id, 'rejected')}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-surface-container hover:bg-error hover:text-on-error text-error font-label-sm text-label-sm font-semibold transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-space-md rounded-xl bg-surface text-center font-body-sm text-on-surface-variant">
                  All student leave petitions have been adjudicated.
                </div>
              )}
            </div>
          </div>

          {/* Institutional Circular Broadcast */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">campaign</span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Broadcast Institutional Circular
                </h2>
              </div>
            </div>

            <form onSubmit={handlePublishNotice} className="flex flex-col gap-space-md">
              <div className="form-group mb-0">
                <label>Circular Subject Headline *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. End-Semester Practical Examination Schedule"
                />
              </div>

              <div className="form-group mb-0">
                <label>Classification</label>
                <select
                  className="form-control"
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value)}
                >
                  <option value="urgent">Urgent Priority Alert (Pinned)</option>
                  <option value="academic">Academic &amp; Curriculum Directive</option>
                  <option value="exam">Controller of Examinations Notice</option>
                  <option value="event">University Symposium / Event</option>
                </select>
              </div>

              <div className="form-group mb-0">
                <label>Directive Body *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  required
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Enter official circular instructions for students and faculty..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-on-surface text-on-primary font-label-lg text-label-lg font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">send</span>
                <span>Publish Official Circular</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
