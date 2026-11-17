import React from 'react';

export default function DigitalIdModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="p-space-lg border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">verified_user</span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Official University Smart ID
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-space-lg flex flex-col gap-space-md">
          {/* Collegiate Executive ID Card */}
          <div className="rounded-xl overflow-hidden border border-surface-dim shadow-md bg-surface-container-lowest">
            {/* Top Collegiate Royal Blue Banner */}
            <div className="bg-secondary text-on-secondary px-space-lg py-space-md flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-surface-container-lowest/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-secondary text-xl">
                    school
                  </span>
                </div>
                <div>
                  <div className="font-headline-sm text-label-lg font-bold tracking-tight leading-none">
                    APEX UNIVERSITY
                  </div>
                  <div className="text-[10px] uppercase tracking-wider opacity-85 mt-0.5 font-semibold">
                    Office of the Registrar • Verified Credential
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-lowest/20 text-[10px] font-bold uppercase tracking-wider">
                Active
              </span>
            </div>

            {/* Body */}
            <div className="p-space-lg flex gap-space-md items-start bg-surface">
              <div className="w-24 h-28 rounded-xl bg-secondary/10 border-2 border-secondary/20 flex flex-col items-center justify-center shrink-0 text-secondary">
                <span className="font-display-lg text-3xl font-bold">
                  {student.full_name?.charAt(0) || 'A'}
                </span>
                <span className="font-label-sm text-[10px] uppercase tracking-wider mt-1 font-semibold">
                  Scholar
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">
                  {student.full_name || 'Aravind Krishna'}
                </div>
                <div className="font-label-md text-label-md text-secondary font-semibold mt-0.5">
                  ID: {student.roll_number || '2023CS1042'}
                </div>

                <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 mt-3 font-body-sm text-body-sm text-on-surface-variant">
                  <div>
                    <span className="text-outline block text-[10px] uppercase font-semibold">
                      Division
                    </span>
                    <strong className="text-on-surface">
                      {student.department_details?.code || 'CSE'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-outline block text-[10px] uppercase font-semibold">
                      Term / Sec
                    </span>
                    <strong className="text-on-surface">
                      Sem {student.semester || 5} ({student.section || 'A'})
                    </strong>
                  </div>
                  <div>
                    <span className="text-outline block text-[10px] uppercase font-semibold">
                      Blood Group
                    </span>
                    <strong className="text-on-surface">{student.blood_group || 'O+'}</strong>
                  </div>
                  <div>
                    <span className="text-outline block text-[10px] uppercase font-semibold">
                      Valid Thru
                    </span>
                    <strong className="text-on-tertiary-container">May 2027</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with QR & Emergency Contact */}
            <div className="px-space-lg py-space-md bg-surface-container-low border-t border-surface-container flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Emergency Guardian Contact
                </div>
                <div className="font-label-md text-label-md text-on-surface font-bold">
                  {student.guardian_phone || '+91 98401 23456'}
                </div>
              </div>
              <div className="p-1.5 bg-surface-container-lowest rounded-lg border border-surface-dim flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-on-surface">qr_code_2</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-2 px-4 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-lg text-label-lg font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              <span>Print Credential</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg font-semibold transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
