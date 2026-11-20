import React, { useState, useEffect } from 'react';
import erpApi from '../api/client';

export default function AdminPortalView({ onDataChanged }) {
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [formError, setFormError] = useState(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState(5);
  const [section, setSection] = useState('A');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [anRes, stdRes] = await Promise.all([
        erpApi.getAdminAnalytics(),
        erpApi.getStudents(),
      ]);
      setAnalytics(anRes);
      setStudents(stdRes);
      if (anRes.departments?.length > 0 && !departmentId) {
        setDepartmentId(anRes.departments[0].id);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!firstName.trim() || !rollNumber.trim()) {
      setFormError('First Name and Roll Number are required.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await erpApi.createStudent({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        roll_number: rollNumber.trim(),
        department_id: departmentId,
        semester: parseInt(semester, 10),
        section: section.trim() || 'A',
        phone: phone.trim(),
        blood_group: bloodGroup,
        guardian_name: guardianName.trim(),
        guardian_phone: guardianPhone.trim(),
      });

      setMsg(res.message);
      setShowModal(false);
      setFormError(null);
      setFirstName('');
      setLastName('');
      setRollNumber('');
      setPhone('');
      setGuardianName('');
      setGuardianPhone('');

      await loadData();
      if (onDataChanged) onDataChanged();
      setTimeout(() => setMsg(null), 5000);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to register student.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId, studentName, rollNum) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently expunge student "${studentName}" (${rollNum}) from the SIS database?`
    );
    if (!confirmed) return;
    try {
      const res = await erpApi.deleteStudent(studentId);
      setMsg(res.message);
      await loadData();
      if (onDataChanged) onDataChanged();
      setTimeout(() => setMsg(null), 5000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete student');
    }
  };

  if (loading) {
    return (
      <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm text-center font-body-lg text-on-surface-variant">
        Loading Admissions &amp; Central Registry...
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
              Office of the University Registrar
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Master Student Information System (SIS)
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
            Admissions, Enrollment &amp; Academic Registry
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-on-surface">
              Central Enrollment &amp; Curriculum Control
            </span>
            <span className="text-outline-variant">•</span>
            <span>{students.length} Live Student Records</span>
            <span className="text-outline-variant">•</span>
            <span className="font-medium text-secondary">
              {analytics?.total_courses || 0} Catalog Courses Active
            </span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap shrink-0">
          <a
            href="http://127.0.0.1:8000/admin/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-lg text-label-lg rounded-lg shadow-sm transition-all no-underline"
          >
            <span className="material-symbols-outlined text-lg">database</span>
            <span>Django DB Console</span>
          </a>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg rounded-lg shadow-md hover:shadow-lg transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            <span>Register Student</span>
          </button>
        </div>
      </div>

      {/* Status Toast */}
      {msg && (
        <div className="p-space-md rounded-xl bg-surface-container-low border border-secondary/30 text-on-tertiary-container flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 font-label-lg text-label-lg font-semibold">
            <span className="material-symbols-outlined">verified</span>
            <span>{msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setMsg(null)}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Registered Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">groups</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              {analytics?.total_students || 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-xs mr-0.5">check_circle</span> Active
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                MySQL Verified
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>SIS Roster</span>
            <span className="font-semibold text-on-surface">100% Indexed</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Instructional Faculty
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">co_present</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              {analytics?.total_faculty || 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-secondary bg-surface-container px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                Tenured &amp; Advisors
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">In-Charge</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Departments</span>
            <span className="font-semibold text-secondary">
              {analytics?.total_departments || 0} Divisions
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Tuition Realization
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">payments</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              ₹{analytics?.total_fee_collected?.toLocaleString() || 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                Collected
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Pending: ₹{analytics?.total_fee_pending?.toLocaleString() || 0}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Bursar Ledger</span>
            <span className="font-semibold text-on-surface">Audited</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Catalog Courses
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">menu_book</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              {analytics?.total_courses || 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-secondary bg-surface-container px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                CBCS Accredited
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Active Term</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Curriculum Status</span>
            <span className="font-semibold text-on-tertiary-container">Ratified</span>
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="p-space-lg flex items-center justify-between border-b border-surface-container flex-wrap gap-2">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Master Student Directory &amp; Enrolment Roster
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Official university student records with roll number, division, and guardian telemetry
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-label-sm text-label-sm font-semibold shadow-sm transition-all inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            <span>Add New Enrollee</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Full Legal Name</th>
                <th>Academic Division</th>
                <th>Semester / Sec</th>
                <th>Student Contact</th>
                <th>Guardian Contact</th>
                <th>Standing</th>
                <th>Registry Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="px-2.5 py-0.5 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">
                      {s.roll_number}
                    </span>
                  </td>
                  <td className="font-semibold text-on-surface">{s.full_name}</td>
                  <td className="text-on-surface-variant">
                    {s.department_details?.name || 'Computer Science & Engineering'}
                  </td>
                  <td className="text-on-surface-variant">
                    Sem {s.semester} ({s.section})
                  </td>
                  <td className="text-on-surface-variant">{s.phone || 'N/A'}</td>
                  <td className="text-on-surface-variant">{s.guardian_phone || 'N/A'}</td>
                  <td>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-tertiary-container font-label-sm text-label-sm font-semibold uppercase">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      Enrolled
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDeleteStudent(s.id, s.full_name, s.roll_number)}
                      className="px-2.5 py-1 rounded bg-error/10 hover:bg-error hover:text-on-error text-error font-label-sm text-label-sm font-semibold transition-all inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                      <span>Expunge</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Catalog Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="p-space-lg flex items-center justify-between border-b border-surface-container">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Institutional Curriculum &amp; Course Catalog
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Accredited courses, credit weightages, and assigned instructional faculty
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold uppercase">
            CBCS Matrix
          </span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Credit Weight</th>
                <th>Faculty In-Charge</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.courses?.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="px-2.5 py-0.5 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">
                      {c.code}
                    </span>
                  </td>
                  <td className="font-semibold text-on-surface">{c.name}</td>
                  <td className="text-on-surface-variant">{c.department_code || 'CSE'}</td>
                  <td className="text-on-surface-variant">Sem {c.semester}</td>
                  <td className="font-medium text-on-surface">{c.credits} Credits</td>
                  <td className="text-on-surface-variant">{c.faculty_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Enrolment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="p-space-lg border-b border-surface-container flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">person_add</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Matriculate New Student Record
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

            <form onSubmit={handleCreateStudent} className="p-space-lg flex flex-col gap-space-md">
              {formError && (
                <div className="p-space-sm rounded-lg bg-error/10 border border-error/30 text-error font-label-md text-label-md">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="form-group mb-0">
                  <label>First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Rahul"
                  />
                </div>
                <div className="form-group mb-0">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Verma"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="form-group mb-0">
                  <label>University Roll ID * (Unique)</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 2023CS1055"
                  />
                </div>
                <div className="form-group mb-0">
                  <label>Academic Department</label>
                  <select
                    className="form-control"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    {analytics?.departments?.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                <div className="form-group mb-0">
                  <label>Semester</label>
                  <select
                    className="form-control"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label>Section</label>
                  <input
                    type="text"
                    className="form-control"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="A"
                  />
                </div>
                <div className="form-group mb-0">
                  <label>Blood Group</label>
                  <select
                    className="form-control"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="form-group mb-0">
                  <label>Student Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                  />
                </div>
                <div className="form-group mb-0">
                  <label>Guardian Emergency Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="+91 98765 11111"
                  />
                </div>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">info</span>
                <span>
                  Initial SIS credentials and semester tuition vouchers are provisioned
                  automatically upon registration.
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg font-semibold shadow-md transition-all"
              >
                {submitting ? 'Provisioning SIS Record...' : 'Certify & Register Student'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
