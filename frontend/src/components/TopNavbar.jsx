import React, { useState, useRef, useEffect } from 'react';

export default function TopNavbar({
  currentRole,
  setCurrentRole,
  student,
  onRefresh,
  isRefreshing,
  activeTab,
  setActiveTab,
  allStudents = [],
  selectedStudentId,
  onSelectStudentId,
  onOpenIdCard,
  recentNotices = [],
  onMenuToggle
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const quickRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (quickRef.current && !quickRef.current.contains(e.target)) {
        setShowQuickActions(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchedStudents = searchQuery.trim()
    ? allStudents.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.roll_number?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const profileName =
    currentRole === 'admin'
      ? 'Dr. Eleanor Vance'
      : currentRole === 'faculty'
      ? 'Dr. Alok Sharma'
      : student?.full_name || 'Dr. Eleanor Vance';

  const profileSubtitle =
    currentRole === 'admin'
      ? 'Dean, Office of Academic Affairs'
      : currentRole === 'faculty'
      ? 'Associate Professor • CSE'
      : `${student?.roll_number || '2023CS1042'} • Sem ${student?.semester || 5} (${student?.department_details?.code || 'CSE'})`;

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-margin-mobile lg:px-margin flex items-center justify-between gap-space-md">
        {/* Left: Mobile Menu + Semester Pill + Search */}
        <div className="flex items-center gap-space-md flex-1 max-w-2xl">
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>

          <div className="hidden sm:inline-flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container rounded-full font-label-md text-label-md text-secondary font-semibold shrink-0">
            <span className="material-symbols-outlined text-base">event_note</span>
            <span>Fall Semester 2025 • Week 7</span>
          </div>

          {/* Global Search Input */}
          <div className="relative flex-1" ref={searchRef}>
            <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
              search
            </span>
            <input
              className="w-full h-10 pl-10 pr-space-md bg-surface rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all"
              placeholder="Search students, faculty, or ID numbers (e.g. 2025-A89)..."
              type="text"
              value={searchQuery}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
            />

            {/* Instant Search Results Flyout */}
            {showSearchDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-12 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-dim p-2 z-50">
                <div className="px-2 py-1 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Matching Student Records ({matchedStudents.length})
                </div>
                {matchedStudents.length > 0 ? (
                  matchedStudents.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        onSelectStudentId(s.id);
                        setActiveTab('dashboard');
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-low flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="font-label-lg text-label-lg text-on-surface font-semibold">
                          {s.full_name}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                          Roll: {s.roll_number} • Sem {s.semester}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">
                        View Record
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 font-body-sm text-body-sm text-on-surface-variant">
                    No matching student IDs found for "{searchQuery}".
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Role & Student Selector + Quick Action + Notifications + Profile */}
        <div className="flex items-center gap-space-sm xl:gap-space-md shrink-0">
          {/* Active Student Switcher */}
          {allStudents && allStudents.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 bg-surface-container px-2.5 py-1.5 rounded-lg">
              <span className="material-symbols-outlined text-secondary text-base">person_search</span>
              <select
                value={selectedStudentId || ''}
                onChange={(e) => onSelectStudentId(e.target.value)}
                aria-label="Select Active Student Record"
                className="bg-transparent font-label-md text-label-md text-on-surface font-semibold focus:outline-none cursor-pointer"
              >
                {allStudents.map((s) => (
                  <option key={s.id} value={s.id} className="bg-surface-container-lowest text-on-surface">
                    {s.full_name} ({s.roll_number})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Role Switcher Pills */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-surface-container rounded-lg">
            {[
              { id: 'admin', label: 'Executive' },
              { id: 'student', label: 'Student' },
              { id: 'faculty', label: 'Faculty' },
            ].map((roleObj) => (
              <button
                key={roleObj.id}
                type="button"
                onClick={() => setCurrentRole(roleObj.id)}
                className={`px-2.5 py-1 rounded-md font-label-sm text-label-sm font-semibold transition-all ${
                  currentRole === roleObj.id
                    ? 'bg-secondary text-on-secondary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
                }`}
              >
                {roleObj.label}
              </button>
            ))}
          </div>

          {/* Quick Action Dropdown */}
          <div className="relative" ref={quickRef}>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="flex items-center gap-space-xs bg-primary hover:bg-on-surface text-on-primary font-label-lg text-label-lg px-space-md py-space-xs rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-colors h-9"
              type="button"
            >
              <span className="material-symbols-outlined text-lg leading-none">add</span>
              <span className="hidden sm:inline">Quick Action</span>
            </button>

            {showQuickActions && (
              <div className="absolute right-0 top-11 w-60 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-dim p-2 z-50 flex flex-col gap-1">
                <div className="px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Operational Triggers
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('admin_console');
                    setShowQuickActions(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-low flex items-center gap-2.5 font-label-md text-label-md text-on-surface"
                >
                  <span className="material-symbols-outlined text-secondary text-lg">person_add</span>
                  <span>Register New Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('faculty_workspace');
                    setShowQuickActions(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-low flex items-center gap-2.5 font-label-md text-label-md text-on-surface"
                >
                  <span className="material-symbols-outlined text-secondary text-lg">how_to_reg</span>
                  <span>Mark Class Attendance</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('fees');
                    setShowQuickActions(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-low flex items-center gap-2.5 font-label-md text-label-md text-on-surface"
                >
                  <span className="material-symbols-outlined text-secondary text-lg">payments</span>
                  <span>Fee Ledger &amp; Disbursement</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('leaves');
                    setShowQuickActions(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-low flex items-center gap-2.5 font-label-md text-label-md text-on-surface"
                >
                  <span className="material-symbols-outlined text-secondary text-lg">event_busy</span>
                  <span>File Leave / OD Request</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenIdCard) onOpenIdCard();
                    setShowQuickActions(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-low flex items-center gap-2.5 font-label-md text-label-md text-on-surface"
                >
                  <span className="material-symbols-outlined text-secondary text-lg">badge</span>
                  <span>View Digital Student ID</span>
                </button>
                <div className="border-t border-surface-container my-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    if (onRefresh) onRefresh();
                    setShowQuickActions(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-low flex items-center gap-2.5 font-label-md text-label-md text-on-tertiary-container"
                >
                  <span className={`material-symbols-outlined text-lg ${isRefreshing ? 'spin-animation' : ''}`}>
                    sync
                  </span>
                  <span>{isRefreshing ? 'Synchronizing SIS...' : 'Sync Live Telemetry'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-space-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-11 w-80 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-dim p-3 z-50 flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-surface-container pb-2">
                  <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">
                    Institutional Alerts
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-error/10 text-error font-label-sm text-label-sm font-semibold">
                    {recentNotices?.length || 3} Active
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto flex flex-col gap-2">
                  {recentNotices && recentNotices.length > 0 ? (
                    recentNotices.slice(0, 4).map((n) => (
                      <div key={n.id} className="p-2.5 rounded-lg bg-surface hover:bg-surface-container-low transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                            {n.category}
                          </span>
                          <span className="font-body-sm text-body-sm text-outline">
                            {new Date(n.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="font-label-md text-label-md text-on-surface font-semibold mt-0.5">
                          {n.title}
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-0.5">
                          {n.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center font-body-sm text-body-sm text-on-surface-variant">
                      All institutional notifications reviewed.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Executive / User Profile */}
          <div
            className="flex items-center gap-space-sm pl-space-sm cursor-pointer"
            onClick={onOpenIdCard}
            title="Click to view Digital University ID"
          >
            <div className="text-right hidden xl:flex flex-col">
              <span className="font-label-lg text-label-lg text-on-surface font-semibold leading-tight">
                {profileName}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight">
                {profileSubtitle}
              </span>
            </div>
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-surface-container"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0WcGK3e-dNlOb0HEjW5DvTJX6IcqKsAV9weZUsPtZWRBACpDERCvLO_jyi60A93VzQOIoNOeloEFYhURc1QYdOqKhNquzd-TaK0kjiZ7cm_fif9J_vKztBODbj2neWz3U6MJdf2g2OKX9GhiaLV5iqetCD9wM3SRnA4uAyTwcY5l5gMIwPpY5d0CHngl0a1Foyp_mGewc7ddzT7XEOvMxXnES8HBsxe08si8aL8-O"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
