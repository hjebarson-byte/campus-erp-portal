import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Receipt, 
  ExternalLink, 
  ShieldCheck, 
  Database,
  Plus,
  CheckCircle2,
  X,
  UserPlus,
  Trash2
} from 'lucide-react';
import erpApi from '../api/client';

export default function AdminPortalView({ onDataChanged }) {
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

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
        erpApi.getStudents()
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
    try {
      setSubmitting(true);
      const res = await erpApi.createStudent({
        first_name: firstName,
        last_name: lastName,
        roll_number: rollNumber,
        department_id: departmentId,
        semester: parseInt(semester, 10),
        section,
        phone,
        blood_group: bloodGroup,
        guardian_name: guardianName,
        guardian_phone: guardianPhone
      });

      setMsg(res.message);
      setShowModal(false);
      // Reset form
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
      alert(err.response?.data?.error || 'Failed to create student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId, studentName, rollNumber) => {
    const confirmed = window.confirm(`Are you sure you want to permanently delete student "${studentName}" (${rollNumber}) from MySQL database? All their attendance, fee, and grade records will be deleted.`);
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
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Administration Console...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Administrative Header */}
      <div className="welcome-banner">
        <div>
          <span className="badge badge-warning">Office of Academic Affairs & Admissions</span>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '6px 0 2px 0' }}>
            Central Registry & Student Administration
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Student Information System (SIS) • Master Records & Enrolment
          </p>
        </div>

        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <UserPlus size={16} />
            <span>Enrol Student</span>
          </button>

          <a
            href="http://127.0.0.1:8000/admin/"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ textDecoration: 'none' }}
          >
            <Database size={16} />
            <span>System Administration</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Success Notification */}
      {msg && (
        <div style={{
          padding: '14px 20px',
          borderRadius: '12px',
          background: 'var(--success-bg)',
          border: '1px solid rgba(16,185,129,0.4)',
          color: '#6ee7b7',
          fontWeight: '600',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} />
          <span>{msg}</span>
        </div>
      )}

      {/* Institutional Metrics */}
      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-icon primary">
            <Users size={26} />
          </div>
          <div className="stat-info">
            <h4>Total Active Students</h4>
            <div className="stat-value">{analytics?.total_students || 0}</div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Registered Students</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon info">
            <GraduationCap size={26} />
          </div>
          <div className="stat-info">
            <h4>Faculty & Instructors</h4>
            <div className="stat-value">{analytics?.total_faculty || 0}</div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Department Mentors</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon success">
            <Receipt size={26} />
          </div>
          <div className="stat-info">
            <h4>Fee Realization</h4>
            <div className="stat-value" style={{ color: '#34d399' }}>
              ₹{analytics?.total_fee_collected?.toLocaleString() || 0}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Pending: ₹{analytics?.total_fee_pending?.toLocaleString() || 0}
            </span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon warning">
            <BookOpen size={26} />
          </div>
          <div className="stat-info">
            <h4>Courses Offered</h4>
            <div className="stat-value">{analytics?.total_courses || 0}</div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {analytics?.total_departments || 0} Academic Departments
            </span>
          </div>
        </div>
      </div>

      {/* Student Roster */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Registered Students Directory</h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Active student roster
            </div>
          </div>
          <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setShowModal(true)}>
            <Plus size={14} />
            <span>Add Student</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Semester / Sec</th>
                <th>Contact</th>
                <th>Guardian Contact</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="badge badge-primary">{s.roll_number}</span>
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                    {s.full_name}
                  </td>
                  <td>{s.department_details?.name || 'CSE'}</td>
                  <td>Sem {s.semester} ({s.section})</td>
                  <td>{s.phone || 'N/A'}</td>
                  <td>{s.guardian_phone || 'N/A'}</td>
                  <td>
                    <span className="badge badge-success">Enrolled</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.74rem',
                        color: '#f87171',
                        borderColor: 'rgba(239, 68, 68, 0.35)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      onClick={() => handleDeleteStudent(s.id, s.full_name, s.roll_number)}
                      title={`Delete ${s.full_name}`}
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Academic Curriculum */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Curriculum & Course Catalog</h3>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Title</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Credits</th>
                <th>Faculty In-Charge</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.courses?.map((c) => (
                <tr key={c.id}>
                  <td><span className="badge badge-primary">{c.code}</span></td>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{c.name}</td>
                  <td>{c.department_code || 'CSE'}</td>
                  <td>Sem {c.semester}</td>
                  <td>{c.credits} Credits</td>
                  <td>{c.faculty_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrolment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex gap-2" style={{ alignItems: 'center' }}>
                <UserPlus size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Student Enrolment</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
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
                <div className="form-group">
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

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Roll Number * (Unique)</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 2023CS1055"
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    className="form-control"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    {analytics?.departments?.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Semester</label>
                  <select className="form-control" value={semester} onChange={(e) => setSemester(e.target.value)}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <input
                    type="text"
                    className="form-control"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="A"
                  />
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select className="form-control" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Student Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                  />
                </div>
                <div className="form-group">
                  <label>Guardian Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="+91 98765 11111"
                  />
                </div>
              </div>

              <div className="info-banner" style={{ marginBottom: '18px' }}>
                Initial account credentials are generated from the student roll number and default password. Semester fee record will be created automatically.
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                disabled={submitting}
              >
                {submitting ? 'Registering Student...' : 'Register Student'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
