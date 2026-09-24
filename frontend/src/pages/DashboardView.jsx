import React, { useState } from 'react';
import { 
  CalendarCheck2, 
  GraduationCap, 
  Receipt, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Megaphone, 
  ChevronRight,
  Send,
  Sparkles
} from 'lucide-react';

export default function DashboardView({ 
  dashboardData, 
  setActiveTab, 
  onPayFeeClick, 
  onSubmitAssignmentClick,
  onSimulateAttendance
}) {
  const [noticeFilter, setNoticeFilter] = useState('all');

  if (!dashboardData) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading dynamic ERP metrics...
      </div>
    );
  }

  const { student, metrics, today_classes, today_day, pending_assignments, recent_notices } = dashboardData;

  const filteredNotices = recent_notices?.filter(n => {
    if (noticeFilter === 'all') return true;
    return n.category === noticeFilter;
  }) || [];

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <div className="flex gap-2" style={{ alignItems: 'center', marginBottom: '8px' }}>
            <span className="badge badge-primary">Semester {student?.semester || 5} • {student?.department_details?.code || 'CSE'}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Roll: {student?.roll_number}</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', margin: '4px 0', color: 'var(--text-primary)' }}>
            Welcome, {student?.full_name || 'Student'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Academic record overview for <strong style={{ color: 'var(--text-primary)' }}>{today_day}</strong> • Session 2025–26
          </p>
        </div>

        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={onSimulateAttendance} title="Project attendance based on upcoming sessions">
            <Sparkles size={16} color="var(--primary)" />
            <span>Attendance Forecast</span>
          </button>
          <button className="btn btn-primary" onClick={() => setActiveTab('attendance')}>
            <span>Attendance Register</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="stat-grid">
        {/* Attendance Card */}
        <div className="card stat-card" onClick={() => setActiveTab('attendance')} style={{ cursor: 'pointer' }}>
          <div className={`stat-icon ${metrics?.is_shortfall ? 'warning' : 'success'}`}>
            <CalendarCheck2 size={26} />
          </div>
          <div className="stat-info" style={{ flex: 1 }}>
            <h4>Aggregate Attendance</h4>
            <div className="stat-value">{metrics?.overall_attendance || 0}%</div>
            <div className="flex-between">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {metrics?.classes_attended} / {metrics?.total_classes} Sessions
              </span>
              {metrics?.is_shortfall ? (
                <span className="badge badge-danger">
                  <AlertTriangle size={12} /> Shortfall Alert
                </span>
              ) : (
                <span className="badge badge-success">
                  <CheckCircle2 size={12} /> Statutory Compliance
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CGPA Card */}
        <div className="card stat-card" onClick={() => setActiveTab('exams')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon primary">
            <GraduationCap size={26} />
          </div>
          <div className="stat-info" style={{ flex: 1 }}>
            <h4>Cumulative CGPA</h4>
            <div className="stat-value">{metrics?.cgpa || '8.50'}</div>
            <div className="flex-between">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Scale of 10.0</span>
              <span className="badge badge-primary">First Class with Distinction</span>
            </div>
          </div>
        </div>

        {/* Fee Dues Card */}
        <div className="card stat-card" onClick={() => setActiveTab('fees')} style={{ cursor: 'pointer' }}>
          <div className={`stat-icon ${metrics?.total_dues > 0 ? 'warning' : 'success'}`}>
            <Receipt size={26} />
          </div>
          <div className="stat-info" style={{ flex: 1 }}>
            <h4>Tuition & Term Dues</h4>
            <div className="stat-value">₹{metrics?.total_dues?.toLocaleString() || 0}</div>
            <div className="flex-between">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Paid: ₹{metrics?.total_paid?.toLocaleString() || 0}
              </span>
              {metrics?.total_dues > 0 ? (
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '3px 10px', fontSize: '0.72rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('fees');
                  }}
                >
                  Pay Now
                </button>
              ) : (
                <span className="badge badge-success">Settled</span>
              )}
            </div>
          </div>
        </div>

        {/* Today's Schedule Card */}
        <div className="card stat-card" onClick={() => setActiveTab('timetable')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon info">
            <Clock size={26} />
          </div>
          <div className="stat-info" style={{ flex: 1 }}>
            <h4>Today's Lectures</h4>
            <div className="stat-value">{today_classes?.length || 0} Sessions</div>
            <div className="flex-between">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Day: {today_day}</span>
              <span className="badge badge-info">View Matrix</span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule and Assessments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Today's Classes */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '18px' }}>
            <div className="flex gap-2" style={{ alignItems: 'center' }}>
              <Clock size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Class Schedule ({today_day})</h3>
            </div>
            <button 
              className="btn btn-outline" 
              style={{ padding: '4px 10px', fontSize: '0.75rem' }} 
              onClick={() => setActiveTab('timetable')}
            >
              Full Timetable
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {today_classes && today_classes.length > 0 ? (
              today_classes.map((cls, idx) => (
                <div key={idx} className="list-item-row">
                  <div className="flex gap-4" style={{ alignItems: 'center' }}>
                    <div style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--primary)',
                      fontSize: '0.78rem',
                      fontWeight: '700'
                    }}>
                      {cls.start_time.substring(0, 5)} - {cls.end_time.substring(0, 5)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {cls.course_name}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {cls.course_code} • {cls.faculty_name}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                    {cls.room_number}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No lectures scheduled for today.
              </div>
            )}
          </div>
        </div>

        {/* Continuous Assessments */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '18px' }}>
            <div className="flex gap-2" style={{ alignItems: 'center' }}>
              <FileText size={18} color="#06b6d4" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Continuous Assessments</h3>
            </div>
            <button 
              className="btn btn-outline" 
              style={{ padding: '4px 10px', fontSize: '0.75rem' }} 
              onClick={() => setActiveTab('assignments')}
            >
              All Assignments
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {pending_assignments && pending_assignments.length > 0 ? (
              pending_assignments.map((asg) => (
                <div key={asg.id} className="list-item-row">
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <div className="flex gap-2" style={{ alignItems: 'center', marginBottom: '4px' }}>
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                        Due: {asg.due_date}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {asg.course_code} • Max {asg.max_marks} pts
                      </span>
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {asg.title}
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    onClick={() => onSubmitAssignmentClick(asg)}
                  >
                    <Send size={13} />
                    <span>Submit</span>
                  </button>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No pending assessments recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Circulars */}
      <div className="card">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div className="flex gap-2" style={{ alignItems: 'center' }}>
            <Megaphone size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Institutional Circulars</h3>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {['all', 'urgent', 'exam', 'event', 'placement'].map((cat) => (
              <button
                key={cat}
                onClick={() => setNoticeFilter(cat)}
                className={`filter-pill ${noticeFilter === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredNotices.map((notice) => (
            <div key={notice.id} className={`notice-card ${notice.is_pinned ? 'pinned' : ''}`}>
              <div>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <span className={`badge ${notice.category === 'urgent' ? 'badge-danger' : notice.category === 'exam' ? 'badge-info' : 'badge-warning'}`}>
                    {notice.category.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {new Date(notice.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.96rem', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.3' }}>
                  {notice.title}
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  {notice.content}
                </p>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                Issued by: <strong style={{ color: 'var(--text-primary)' }}>{notice.posted_by_name}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
