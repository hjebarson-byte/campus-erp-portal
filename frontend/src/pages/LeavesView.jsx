import React, { useState, useEffect } from 'react';
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
        reason: reason,
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

  const approvedCount = leaves.filter((l) => l.status === 'approved').length;
  const pendingCount = leaves.filter((l) => l.status === 'pending').length;

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Dean of Students • Attendance Exemption Registry
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Medical &amp; On-Duty (OD) Authorization
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
            Academic Leave &amp; On-Duty (OD) Portal
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-on-surface">
              Statutory Leave Verification System
            </span>
            <span className="text-outline-variant">•</span>
            <span>{approvedCount} Approved Exemptions</span>
            <span className="text-outline-variant">•</span>
            <span className="font-medium text-secondary">{pendingCount} Awaiting Faculty Review</span>
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg rounded-lg shadow-md hover:shadow-lg transition-all self-start lg:self-center"
          type="button"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>File Leave / OD Petition</span>
        </button>
      </div>

      {/* Leave Applications Data Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="p-space-lg flex items-center justify-between border-b border-surface-container">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Submitted Leave &amp; On-Duty Petitions
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Chronological audit log of medical, academic duty, and personal leave requests
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold uppercase">
            {leaves.length} Records
          </span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Exemption Category</th>
                <th>Effective Duration</th>
                <th>Statement of Justification</th>
                <th>Filed On</th>
                <th>Adjudication Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>
                      <span className="px-2.5 py-0.5 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold uppercase">
                        {leave.leave_type}
                      </span>
                    </td>
                    <td className="font-semibold text-on-surface">
                      {leave.start_date} <span className="text-outline">→</span> {leave.end_date}
                    </td>
                    <td className="text-on-surface-variant max-w-md">{leave.reason}</td>
                    <td className="text-on-surface-variant">
                      {new Date(leave.applied_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold uppercase ${
                          leave.status === 'approved'
                            ? 'bg-surface-container-low text-on-tertiary-container'
                            : leave.status === 'rejected'
                            ? 'bg-error/10 text-error'
                            : 'bg-secondary/10 text-secondary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {leave.status === 'approved'
                            ? 'check_circle'
                            : leave.status === 'rejected'
                            ? 'cancel'
                            : 'schedule'}
                        </span>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-on-surface-variant">
                    No leave or On-Duty petitions filed for the current semester.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="p-space-lg border-b border-surface-container flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">event_busy</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  File Leave / On-Duty Petition
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleApply} className="p-space-lg flex flex-col gap-space-md">
              <div className="form-group mb-0">
                <label>Exemption Category</label>
                <select
                  className="form-control"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                >
                  <option value="medical">Medical Leave (Clinical Certificate Required)</option>
                  <option value="duty">On-Duty (Symposium / Hackathon / Varsity Representation)</option>
                  <option value="personal">Personal / Emergency Family Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="form-group mb-0">
                  <label>Commencement Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group mb-0">
                  <label>Conclusion Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group mb-0">
                <label>Statement of Justification *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide event details, medical reference, or advisor endorsement..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg font-semibold shadow-md transition-all"
              >
                {submitting ? 'Filing Petition...' : 'Submit Petition to Faculty Advisor'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
