import React from 'react';
import { RefreshCw, GraduationCap, Users, ShieldCheck, UserCheck, Sun, Moon, Palette } from 'lucide-react';

export default function TopNavbar({ 
  currentRole, 
  setCurrentRole, 
  onRefresh, 
  isRefreshing, 
  activeTabName,
  allStudents = [],
  selectedStudentId,
  onSelectStudentId,
  theme = 'dark',
  setTheme,
  accentColor = 'indigo',
  setAccentColor
}) {
  const accents = [
    { id: 'indigo', label: 'Indigo', color: '#6366f1' },
    { id: 'emerald', label: 'Emerald', color: '#10b981' },
    { id: 'violet', label: 'Violet', color: '#8b5cf6' },
  ];

  return (
    <header className="topbar">
      <div className="flex items-center gap-4">
        <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
          {activeTabName}
        </h1>
        <div className="badge badge-success flex items-center gap-2">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          <span>Session 2025–26 • Online</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {currentRole === 'student' && allStudents && allStudents.length > 0 && (
          <div className="flex items-center gap-2" style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            padding: '5px 12px',
            borderRadius: 10
          }}>
            <UserCheck size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Record:</span>
            <select
              value={selectedStudentId || ''}
              onChange={(e) => onSelectStudentId(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {allStudents.map((s) => (
                <option key={s.id} value={s.id} style={{ background: 'var(--bg-sidebar)', color: 'var(--text-primary)' }}>
                  {s.full_name} ({s.roll_number})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="segmented-control">
          <button
            onClick={() => setCurrentRole('student')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: currentRole === 'student' ? 'var(--primary)' : 'transparent',
              color: currentRole === 'student' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            <GraduationCap size={15} />
            <span>Student</span>
          </button>

          <button
            onClick={() => setCurrentRole('faculty')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: currentRole === 'faculty' ? '#059669' : 'transparent',
              color: currentRole === 'faculty' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            <Users size={15} />
            <span>Faculty</span>
          </button>

          <button
            onClick={() => setCurrentRole('admin')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: currentRole === 'admin' ? '#d97706' : 'transparent',
              color: currentRole === 'admin' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            <ShieldCheck size={15} />
            <span>Registrar</span>
          </button>
        </div>

        <button
          className="btn btn-outline"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{ padding: '7px 12px', fontSize: '0.82rem', borderRadius: 10 }}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? (
            <span className="flex items-center gap-2">
              <Sun size={15} color="#fbbf24" />
              <span>Light</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Moon size={15} color="var(--primary)" />
              <span>Dark</span>
            </span>
          )}
        </button>

        <div className="flex items-center gap-1" style={{
          background: 'var(--bg-subtle)',
          padding: '4px 8px',
          borderRadius: 10,
          border: '1px solid var(--border-color)'
        }} title="Theme Accent">
          <Palette size={14} color="var(--text-muted)" style={{ marginRight: 2 }} />
          {accents.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setAccentColor(acc.id)}
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: acc.color,
                border: accentColor === acc.id ? '2px solid #fff' : '2px solid transparent',
                cursor: 'pointer',
                padding: 0
              }}
              title={acc.label}
            />
          ))}
        </div>

        <button 
          className="btn btn-outline flex items-center gap-2" 
          onClick={onRefresh} 
          disabled={isRefreshing}
          style={{ padding: '7px 12px', fontSize: '0.82rem', borderRadius: 10 }}
          title="Refresh Data"
        >
          <RefreshCw size={14} className={isRefreshing ? 'spin-animation' : ''} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
        </button>
      </div>
    </header>
  );
}
