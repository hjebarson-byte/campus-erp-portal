import React, { useState, useEffect } from 'react';
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

  const submittedCount = assignments.filter((a) => !!a.my_submission).length;
  const pendingCount = assignments.length - submittedCount;

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Continuous Internal Assessment (CIA)
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Semester Coursework &amp; Lab Dossiers
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
            Coursework &amp; Evaluation Repository
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-on-surface">
              Academic Evaluation Portal
            </span>
            <span className="text-outline-variant">•</span>
            <span>{submittedCount} Submitted</span>
            <span className="text-outline-variant">•</span>
            <span className="font-medium text-secondary">{pendingCount} Pending Action</span>
          </p>
        </div>

        <button
          onClick={fetchAssignments}
          className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg rounded-lg shadow-md transition-all self-start lg:self-center"
          type="button"
        >
          <span className="material-symbols-outlined text-lg">sync</span>
          <span>Refresh Repository</span>
        </button>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {loading ? (
          <div className="col-span-2 bg-surface-container-lowest p-space-xl rounded-xl text-center text-on-surface-variant">
            Loading coursework assignments...
          </div>
        ) : (
          assignments.map((asg) => {
            const isSubmitted = !!asg.my_submission;
            return (
              <div
                key={asg.id}
                className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-space-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-space-sm">
                    <span className="px-2.5 py-0.5 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold uppercase">
                      {asg.course_code}
                    </span>
                    {isSubmitted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-tertiary-container font-label-sm text-label-sm font-semibold uppercase">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Submitted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error/10 text-error font-label-sm text-label-sm font-semibold uppercase">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        Due: {asg.due_date}
                      </span>
                    )}
                  </div>

                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {asg.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    {asg.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-space-sm border-t border-surface-container">
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    Maximum Weightage: <strong className="text-on-surface">{asg.max_marks} Marks</strong>
                  </span>

                  {isSubmitted ? (
                    <span className="font-label-md text-label-md text-on-tertiary-container font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">task_alt</span>
                      Dossier Logged
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedAsg(asg)}
                      className="px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-label-sm text-label-sm font-semibold shadow-sm transition-all inline-flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">upload_file</span>
                      <span>Upload &amp; Submit</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submission Modal */}
      {selectedAsg && (
        <div className="modal-overlay" onClick={() => setSelectedAsg(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="p-space-lg border-b border-surface-container flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">upload_file</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Submit Coursework Dossier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAsg(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-space-lg flex flex-col gap-space-md">
              <div className="p-space-md rounded-xl bg-surface-container-low">
                <div className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                  {selectedAsg.course_code} • Max {selectedAsg.max_marks} Marks
                </div>
                <div className="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">
                  {selectedAsg.title}
                </div>
              </div>

              <div className="form-group mb-0">
                <label>Attached Document / Repository Artifact</label>
                <div className="border-2 border-dashed border-surface-dim rounded-xl p-space-md text-center bg-surface">
                  <span className="material-symbols-outlined text-3xl text-secondary">
                    cloud_upload
                  </span>
                  <div className="font-label-lg text-label-lg text-on-surface font-semibold mt-1">
                    {fileName}
                  </div>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="form-control mt-2 text-center"
                    placeholder="Enter document filename or URL..."
                  />
                </div>
              </div>

              <div className="form-group mb-0">
                <label>Submission Abstract &amp; Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Include methodology notes, GitHub repository links, or citations..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg font-semibold shadow-md transition-all"
              >
                {submitting ? 'Transmitting to Faculty...' : 'Certify & Submit Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
