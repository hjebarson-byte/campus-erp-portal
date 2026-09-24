import React, { useState, useEffect } from 'react';
import { Award, Printer, CheckCircle } from 'lucide-react';
import erpApi from '../api/client';

export default function ExamsView({ student }) {
  const [semester, setSemester] = useState(student?.semester || 1);
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student?.semester) {
      setSemester(student.semester);
    }
  }, [student]);

  useEffect(() => {
    loadGrades(semester);
  }, [semester]);

  const loadGrades = async (sem) => {
    try {
      setLoading(true);
      const data = await erpApi.getExams(sem);
      setExamData(data);
    } catch (err) {
      console.error('Error fetching grade record:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-col gap-6">
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(234, 179, 8, 0.1) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.35)'
      }}>
        <div className="flex-between wrap gap-4">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <Award size={22} color="#fbbf24" />
              <h3 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--text-primary)' }}>
                Provisional Grade Report (CBCS)
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Office of the Controller of Examinations (CoE) • Semester Grade Report
            </p>
          </div>

          <div className="flex items-center wrap gap-4">
            <div className="stat-chip">
              <div className="stat-chip-label">Semester {semester} SGPA</div>
              <div className="stat-chip-value" style={{ color: 'var(--primary)' }}>
                {examData?.sgpa || '8.92'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Cumulative CGPA</div>
              <div className="stat-chip-value" style={{ color: '#f59e0b' }}>
                {examData?.cgpa || '8.92'}
              </div>
            </div>

            <button className="btn btn-outline flex items-center gap-2" onClick={() => window.print()} title="Print Official Grade Sheet">
              <Printer size={16} />
              <span>Print Grade Sheet</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-between wrap gap-2">
        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Course-wise Grade Allocations & Marks</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              className={`btn ${semester === s ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              onClick={() => setSemester(s)}
            >
              Semester {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Exam Category</th>
                <th>Marks Obtained</th>
                <th>Grade Point</th>
                <th>Letter Grade</th>
                <th>Result Status</th>
              </tr>
            </thead>
            <tbody>
              {examData?.grades && examData.grades.length > 0 ? (
                examData.grades.map((grade) => (
                  <tr key={grade.id}>
                    <td>
                      <span className="badge badge-primary">{grade.course_code}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {grade.course_name}
                    </td>
                    <td>{grade.credits}</td>
                    <td>{grade.exam_type}</td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{grade.marks_obtained}</strong> / {grade.max_marks}
                    </td>
                    <td>
                      <strong style={{ color: '#818cf8' }}>{grade.grade_point}</strong>
                    </td>
                    <td>
                      <span className={`badge ${grade.grade_letter === 'O' ? 'badge-warning' : 'badge-success'}`}>
                        {grade.grade_letter}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success flex items-center gap-1">
                        <CheckCircle size={12} /> Passed
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                    No grade records uploaded yet for Semester {semester}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', fontSize: '0.76rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}>
          * Statutory Disclaimer: This provisional grade report is electronically verified under University Academic Regulation (CBCS). For official transcripts bearing the university seal, apply via the Office of the Controller of Examinations.
        </div>
      </div>
    </div>
  );
}
