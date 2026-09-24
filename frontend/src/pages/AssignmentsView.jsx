import React, { useState, useEffect } from 'react';
import { FileText, Send, CheckCircle2, Clock, Upload, X, AlertCircle } from 'lucide-react';
import erpApi from '../api/client';

export default function AssignmentsView({ onRefreshParent }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsg, setSelectedAsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [fileName, setFileName] = useState('assignment_solution_v1.pdf');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await erpApi.getAssignments();
      setAssignments(data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsg) return;
    try {
      setSubmitting(true);
      await erpApi.submitAssignment(selectedAsg.id, remarks, fileName);
      setSelectedAsg(null);
      setRemarks('');
      await fetchAssignments();
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex-between" style={{ alignItems: 'center' }}>
        <div>
          <div className="flex gap-2" style={{ alignItems: 'center', marginBottom: '4px' }}>
            <FileText size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Coursework & Lab Assignments</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Submit coursework and track evaluations
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {assignments.map((asg) => {
          const isSubmitted = !!asg.my_submission;
          return (
            <div key={asg.id} className="card flex flex-col" style={{ justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className="badge badge-primary">{asg.course_code}</span>
                  {isSubmitted ? (
                    <span className="badge badge-success">
                      <CheckCircle2 size={13} /> Submitted
                    </span>
                  ) : (
                    <span className="badge badge-warning">
                      <Clock size={13} /> Due: {asg.due_date}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {asg.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {asg.description}
                </p>
              </div>

              <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Max Marks: <strong>{asg.max_marks} pts</strong>
                </span>

                {isSubmitted ? (
                  <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '600' }}>
                    Status: Received
                  </span>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                    onClick={() => setSelectedAsg(asg)}
                  >
                    <Send size={13} />
                    <span>Upload & Submit</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {selectedAsg && (
        <div className="modal-overlay" onClick={() => setSelectedAsg(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="flex-between" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Submit Coursework</h3>
              <button onClick={() => setSelectedAsg(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Assignment:</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedAsg.title}</div>
              </div>

              <div className="form-group">
                <label>Attached Document / Report</label>
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '10px',
                  padding: '20px',
                  textAlign: 'center',
                  background: 'var(--bg-subtle)'
                }}>
                  <Upload size={28} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>{fileName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>File attached for submission</div>
                </div>
              </div>

              <div className="form-group">
                <label>Submission Notes / Remarks</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Include any project notes, references, or comments..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                disabled={submitting}
              >
                {submitting ? 'Submitting to Portal...' : 'Submit Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
