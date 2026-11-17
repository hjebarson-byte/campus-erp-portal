import React from 'react';

export default function Sidebar({
  currentRole,
  setCurrentRole,
  activeTab,
  setActiveTab,
  onOpenIdCard,
  student,
  mobileOpen = false,
  setMobileOpen
}) {
  // Primary Operational Navigation matching the Apex University SIS & ERP design
  // while exposing every module of the College Portal
  const navGroups = [
    {
      title: 'Operational Navigation',
      items: [
        { id: 'executive_overview', label: 'Overview / Dashboard', icon: 'dashboard', roles: ['student', 'faculty', 'admin'] },
        { id: 'dashboard', label: 'Student Academic Hub', icon: 'school', roles: ['student', 'admin'] },
        { id: 'admin_console', label: 'Admissions & Enrollment', icon: 'how_to_reg', roles: ['admin', 'faculty', 'student'] },
        { id: 'attendance', label: 'Attendance & Records', icon: 'fact_check', roles: ['student', 'faculty', 'admin'] },
        { id: 'faculty_workspace', label: 'Faculty & Staff', icon: 'badge', roles: ['faculty', 'admin', 'student'] },
        { id: 'timetable', label: 'Academics & Timetable', icon: 'menu_book', roles: ['student', 'faculty', 'admin'] },
        { id: 'exams', label: 'Grades & Transcripts', icon: 'workspace_premium', roles: ['student', 'faculty', 'admin'] },
        { id: 'fees', label: 'Financial Operations', icon: 'account_balance', roles: ['student', 'admin', 'faculty'] },
        { id: 'assignments', label: 'Coursework & CIA', icon: 'assignment', roles: ['student', 'faculty', 'admin'] },
        { id: 'leaves', label: 'Leaves & Compliance', icon: 'event_busy', roles: ['student', 'faculty', 'admin'] },
      ]
    }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-72 bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-200 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* University Crest & Title */}
        <div className="h-16 px-space-lg flex items-center gap-space-sm bg-surface-container-low shrink-0">
          <img
            alt="Apex University Crest"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/ALJJyrBfDBwWXsNXOxmQwUyv0JggiVKnCLCO1SVu6cav9Amtr35TIKymnzLzOjlRiwe7yBz2NDMfgLSU4A_hqd-N8lmLI84HB1ZCsXBmf2q5KSxy1RyZfkLBxk12vzrowsst8VJ2mNhoVVGB__GseMftDlruxXYoV1B79mau8t5AiaX92mJVMBAm9Ud5CJBnn5_avOPcGbKNL7FY5SkckpIDaL8spe2lyDMClTsc-bGisglYVg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight leading-none">
              Apex University
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider mt-space-xs">
              SIS &amp; ERP Portal
            </span>
          </div>
        </div>

        {/* Navigation Groups */}
        {navGroups.map((group, gIdx) => (
          <React.Fragment key={gIdx}>
            <div className="px-space-md py-space-sm">
              <div className="px-space-sm py-space-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                {group.title}
              </div>
            </div>
            <nav className="px-space-md flex flex-col gap-space-xs">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left flex items-center gap-space-sm px-space-md py-space-sm rounded-xl transition-all duration-150 ${
                      isActive
                        ? 'bg-secondary text-on-secondary font-semibold shadow-[0_1px_3px_rgba(0,81,213,0.2)] font-label-lg text-label-lg'
                        : 'font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}

              {/* Digital Student ID Trigger */}
              <button
                type="button"
                onClick={onOpenIdCard}
                className="w-full text-left flex items-center justify-between gap-space-sm px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-150 mt-1"
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-xl">id_card</span>
                  <span>Digital Student ID</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  ID
                </span>
              </button>
            </nav>
          </React.Fragment>
        ))}
      </div>

      {/* Bottom System Status & Active Context */}
      <div className="p-space-md bg-surface-container-low flex flex-col gap-space-sm">
        <div className="bg-surface-container p-space-md rounded-xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              System Status
            </span>
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              All Services Active
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-secondary ring-4 ring-secondary/20"></span>
        </div>
      </div>
    </aside>
  );
}
