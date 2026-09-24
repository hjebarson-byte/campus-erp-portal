import React, { useState, useEffect } from 'react';
import { CalendarOff, Send, CheckCircle2, Clock, XCircle, Plus, X } from 'lucide-react';
import erpApi from '../api/client';

export default function LeavesView() {
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [leaveType, setLeaveType] = useState('medical');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const data = await erpApi.getLeaves();
      setLeaves(data);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await erpApi.applyLeave({
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason
      });
      setShowModal(false);
      setReason('');
      setStartDate('');
      setEndDate('');
      await fetchLeaves();
    } catch (err) {
      console.error('Apply leave error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="flex gap-2" style={{ alignItems: 'center', marginBottom: '4px' }}>
            <CalendarOff size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Leave & On-Duty Requests</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Apply for Medical Leaves, On-Duty authorizations, or Personal leaves
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Apply New Leave</span>
        </button>
      </div>

      {/* History table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Applied On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td>
                    <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                      {leave.leave_type}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                    {leave.start_date} to {leave.end_date}
                  </td>
                  <td style={{ maxWidth: '300px' }}>{leave.reason}</td>
                  <td>{new Date(leave.applied_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${leave.status === 'approved' ? 'badge-success' : leave.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                      {leave.status === 'approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      <span style={{ textTransform: 'capitalize', marginLeft: '4px' }}>{leave.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="flex-between" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Apply for Leave / On-Duty</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApply} style={{ padding: '24px' }}>
              <div className="form-group">
                <label>Leave Category</label>
                <select className="form-control" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                  <option value="medical">Medical Leave (Doctor Certificate)</option>
                  <option value="duty">On-Duty (Hackathon / Seminar / Sports)</option>
                  <option value="personal">Personal / Family Leave</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" className="form-control" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" className="form-control" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Reason & Justification</label>
                <textarea
                  className="form-control"
                  rows="3"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Detail the event, condition, or reason..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                disabled={submitting}
              >
                {submitting ? 'Submitting Application...' : 'Submit to Department'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
