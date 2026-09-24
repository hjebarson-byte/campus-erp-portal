import React, { useState } from 'react';
import { 
  CalendarCheck2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Sparkles 
} from 'lucide-react';
import erpApi from '../api/client';

export default function AttendanceView({ attendanceList = [], onRefresh }) {
  const [updatingId, setUpdatingId] = useState(null);

  const overallAttended = attendanceList.reduce((acc, c) => acc + c.attended, 0);
  const overallTotal = attendanceList.reduce((acc, c) => acc + c.total, 0);
  const overallPercentage = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 1000) / 10 : 0;

  const handleSimulate = async (courseId, status) => {
    try {
      setUpdatingId(courseId);
      const todayStr = new Date().toISOString().split('T')[0];
      await erpApi.toggleAttendance(courseId, status, todayStr);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Error logging attendance record:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex-col gap-6">
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div className="flex-between wrap gap-4">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <CalendarCheck2 size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>
                Aggregate Curricular Attendance Register
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Statutory Regulation: Minimum <strong style={{ color: 'var(--text-primary)' }}>75.0%</strong> aggregate attendance mandatory to appear in End-Semester Examinations (ESE).
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '2.2rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                color: overallPercentage >= 75 ? '#34d399' : '#f87171',
                lineHeight: 1
              }}>
                {overallPercentage}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {overallAttended} attended of {overallTotal} scheduled lectures
              </div>
            </div>

            <div>
              {overallPercentage >= 75 ? (
                <span className="badge badge-success" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} /> Exam Eligible
                </span>
              ) : (
                <span className="badge badge-danger" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  <AlertTriangle size={16} /> Attendance Shortfall
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="progress-track" style={{ marginTop: 20, height: 10 }}>
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(overallPercentage, 100)}%`,
              background: overallPercentage >= 75 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #ef4444, #dc2626)'
            }}
          />
        </div>
      </div>

      <div className="info-banner">
        <Sparkles size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Attendance Forecasting:</strong> Log projected lecture attendance or excused absences below to evaluate end-semester examination compliance thresholds.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {attendanceList.map((course) => {
          const isDanger = course.percentage < 75;
          const isWarning = course.percentage >= 75 && course.percentage < 82;

          return (
            <div
              key={course.course_id}
              className="card flex-col gap-4"
              style={{
                borderLeft: isDanger ? '4px solid #ef4444' : isWarning ? '4px solid #f59e0b' : '4px solid #10b981'
              }}
            >
              <div>
                <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: 6 }}>
                      {course.course_code} • {course.credits} Credits
                    </span>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: 0 }}>
                      {course.course_name}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Faculty: {course.faculty}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '1.6rem',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 800,
                      color: isDanger ? '#f87171' : isWarning ? '#fbbf24' : '#34d399'
                    }}>
                      {course.percentage}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {course.attended}/{course.total} classes
                    </div>
                  </div>
                </div>

                <div className="progress-track" style={{ margin: '14px 0' }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(course.percentage, 100)}%`,
                      background: isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981'
                    }}
                  />
                </div>

                <div style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: isDanger ? 'var(--danger-bg)' : 'var(--bg-subtle)',
                  border: isDanger ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  {isDanger ? (
                    <>
                      <AlertTriangle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                      <span style={{ color: '#fca5a5' }}>
                        Shortfall: Attend <strong>{course.needed_for_75}</strong> consecutive lectures to attain statutory 75.0%.
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingUp size={15} color="#10b981" style={{ flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Compliance Margin: <strong>{course.safe_bunks}</strong> lecture{course.safe_bunks !== 1 ? 's' : ''} surplus above statutory 75.0% threshold.
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
                <button
                  className="btn btn-outline"
                  style={{ flex: 1, fontSize: '0.78rem', padding: '6px 10px' }}
                  disabled={updatingId === course.course_id}
                  onClick={() => handleSimulate(course.course_id, 'present')}
                >
                  <Plus size={14} color="#34d399" />
                  <span>+ Mark Present</span>
                </button>

                <button
                  className="btn btn-outline"
                  style={{ flex: 1, fontSize: '0.78rem', padding: '6px 10px' }}
                  disabled={updatingId === course.course_id}
                  onClick={() => handleSimulate(course.course_id, 'absent')}
                >
                  <Minus size={14} color="#f87171" />
                  <span>- Mark Absent</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
