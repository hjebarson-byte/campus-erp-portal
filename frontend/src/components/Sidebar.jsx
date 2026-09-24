import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck2, 
  CalendarDays, 
  GraduationCap, 
  Receipt, 
  FileText, 
  CalendarOff, 
  Contact2,
  School,
  Users,
  Award,
  Megaphone,
  Database,
  Building2
} from 'lucide-react';

export default function Sidebar({ 
  currentRole, 
  setCurrentRole, 
  activeTab, 
  setActiveTab, 
  onOpenIdCard, 
  student 
}) {
  const studentItems = [
    { id: 'dashboard', label: 'Academic Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance Register', icon: CalendarCheck2 },
    { id: 'timetable', label: 'Academic Timetable', icon: CalendarDays },
    { id: 'exams', label: 'Grades & Transcripts', icon: GraduationCap },
    { id: 'fees', label: 'Fee Invoices & Receipts', icon: Receipt },
    { id: 'assignments', label: 'Continuous Assessment', icon: FileText },
    { id: 'leaves', label: 'Leave & OD Requests', icon: CalendarOff },
  ];

  const facultyItems = [
    { id: 'faculty_workspace', label: 'Faculty Teaching Console', icon: Users },
    { id: 'attendance', label: 'Attendance Management', icon: CalendarCheck2 },
    { id: 'timetable', label: 'Weekly Schedule', icon: CalendarDays },
    { id: 'exams', label: 'Grade & Mark Entry', icon: Award },
    { id: 'leaves', label: 'Student Leave Approvals', icon: CalendarOff },
  ];

  const adminItems = [
    { id: 'admin_console', label: 'Registry & Admissions', icon: Building2 },
    { id: 'fees', label: 'Bursar & Accounts', icon: Receipt },
    { id: 'timetable', label: 'Institutional Timetable', icon: CalendarDays },
  ];

  const menuItems = currentRole === 'faculty' ? facultyItems : currentRole === 'admin' ? adminItems : studentItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge" style={{
          background: currentRole === 'faculty' ? 'linear-gradient(135deg, #059669, #10b981)' : currentRole === 'admin' ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'linear-gradient(135deg, #6366f1, #3b82f6)'
        }}>
          <School size={24} />
        </div>
        <div className="logo-text">
          <h2>Apex Portal</h2>
          <span style={{
            color: currentRole === 'faculty' ? '#34d399' : currentRole === 'admin' ? '#fbbf24' : 'var(--secondary)'
          }}>
            {currentRole === 'faculty' ? 'Faculty Portal' : currentRole === 'admin' ? 'Registrar Console' : 'Student SIS'}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div style={{ padding: '0 8px 8px 8px', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
          {currentRole.toUpperCase()} SERVICES
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon />
              <span>{item.label}</span>
            </div>
          );
        })}

        {currentRole === 'student' && (
          <>
            <div style={{ marginTop: '20px', padding: '0 8px 8px 8px', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
              Student Identity
            </div>
            <div className="nav-item" onClick={onOpenIdCard}>
              <Contact2 />
              <span>Student ID Card</span>
              <span className="badge badge-primary" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>Verified</span>
            </div>
          </>
        )}

        {currentRole === 'admin' && (
          <>
            <div style={{ marginTop: '20px', padding: '0 8px 8px 8px', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
              Database Control
            </div>
            <a
              href="http://127.0.0.1:8000/admin/"
              target="_blank"
              rel="noreferrer"
              className="nav-item"
              style={{ color: '#fbbf24', border: '1px dashed rgba(245, 158, 11, 0.4)' }}
            >
              <Database />
              <span>Raw Django Admin</span>
            </a>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: currentRole === 'faculty' ? 'linear-gradient(135deg, #059669, #10b981)' : currentRole === 'admin' ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#fff',
            fontSize: '0.9rem'
          }}>
            {currentRole === 'faculty' ? 'D' : currentRole === 'admin' ? 'A' : (student?.full_name ? student.full_name.charAt(0) : 'S')}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentRole === 'faculty' ? 'Dr. Alok Sharma' : currentRole === 'admin' ? 'Administrator (Dean)' : (student?.full_name || 'Aravind Krishna')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {currentRole === 'faculty' ? 'Dept of CSE • Faculty' : currentRole === 'admin' ? 'System Administrator' : `${student?.roll_number || '2023CS1042'} • Sem ${student?.semester || 5}`}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
