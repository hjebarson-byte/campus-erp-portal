import React from 'react';
import { X, ShieldCheck, QrCode, Printer, School } from 'lucide-react';

export default function DigitalIdModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Official Digital Student ID</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Physical ID Card Mockup */}
          <div style={{
            background: 'linear-gradient(145deg, #1e1e38 0%, #111429 100%)',
            border: '2px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '20px',
            padding: '24px',
            color: '#fff',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 20px rgba(99, 102, 241, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Header with emblem */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#6366f1', padding: '6px', borderRadius: '8px' }}>
                  <School size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.04em', color: '#fff' }}>APEX INSTITUTE OF TECHNOLOGY</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Autonomous • Accredited A++ Grade</div>
                </div>
              </div>
            </div>

            {/* Photo & Main Details */}
            <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
              <div style={{
                width: '95px',
                height: '115px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.2)',
                flexShrink: 0
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                  {student.full_name?.charAt(0) || 'A'}
                </div>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>STUDENT</span>
              </div>

              <div style={{ flex: 1, fontSize: '0.82rem' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                  {student.full_name || 'Aravind Krishna'}
                </div>
                <div style={{ color: '#818cf8', fontWeight: '600', marginBottom: '8px' }}>
                  Roll: {student.roll_number || '2023CS1042'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', color: '#cbd5e1', fontSize: '0.75rem' }}>
                  <div><strong>Branch:</strong> {student.department_details?.code || 'CSE'}</div>
                  <div><strong>Sem:</strong> {student.semester || 5} (Sec {student.section || 'A'})</div>
                  <div><strong>Blood Grp:</strong> {student.blood_group || 'O+'}</div>
                  <div><strong>Valid Thru:</strong> 2027</div>
                </div>
              </div>
            </div>

            {/* Bottom Barcode / QR Simulation */}
            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>EMERGENCY CONTACT</div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600' }}>{student.guardian_phone || '+91 98401 23456'}</div>
              </div>
              <div style={{ background: '#fff', padding: '6px', borderRadius: '6px' }}>
                <QrCode size={36} color="#0f172a" />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => window.print()}>
              <Printer size={16} />
              <span>Print ID Card</span>
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
