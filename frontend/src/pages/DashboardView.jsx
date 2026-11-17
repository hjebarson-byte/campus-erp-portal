import React, { useState } from 'react';

export default function DashboardView({
  dashboardData,
  attendanceList = [],
  setActiveTab,
  onPayFeeClick,
  onSubmitAssignmentClick,
  onSimulateAttendance,
  onOpenIdCard
}) {
  const [noticeFilter, setNoticeFilter] = useState('all');

  if (!dashboardData) {
    return (
      <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm text-center font-body-lg text-on-surface-variant">
        Synchronizing student academic telemetry...
      </div>
    );
  }

  const { student, metrics, today_classes, today_day, pending_assignments, recent_notices } = dashboardData;

  const filteredNotices =
    recent_notices?.filter((n) => {
      if (noticeFilter === 'all') return true;
      return n.category === noticeFilter;
    }) || [];

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Header: Student Executive Context & Quick Operational Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Apex Academic Intelligence
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Roll ID: {student?.roll_number || '2023CS1042'} • Semester {student?.semester || 5}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
            Welcome back, {student?.full_name || 'Student'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-on-surface">
              {student?.department_details?.name || 'Computer Science & Engineering'}
            </span>
            <span className="text-outline-variant">•</span>
            <span>Section {student?.section || 'A'}</span>
            <span className="text-outline-variant">•</span>
            <span>Schedule Day: {today_day}</span>
            <span className="text-outline-variant">•</span>
            <span className="font-medium text-secondary">Good Academic Standing</span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap shrink-0">
          {onOpenIdCard && (
            <button
              onClick={onOpenIdCard}
              className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-lg text-label-lg rounded-lg shadow-sm transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">badge</span>
              <span>Digital ID</span>
            </button>
          )}
          <button
            onClick={onSimulateAttendance}
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-lg text-label-lg rounded-lg shadow-sm transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">auto_graph</span>
            <span>Forecast +1 Lecture</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg rounded-lg shadow-md hover:shadow-lg transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">fact_check</span>
            <span>Attendance Register</span>
          </button>
        </div>
      </div>

      {/* 4 High-Authority KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Aggregate Attendance */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Aggregate Attendance
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">how_to_reg</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              {metrics?.overall_attendance || 0}%
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {metrics?.is_shortfall ? (
                <span className="inline-flex items-center text-error bg-error/10 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-xs mr-0.5">warning</span> Below 75%
                </span>
              ) : (
                <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-xs mr-0.5">verified</span> Compliant
                </span>
              )}
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Statutory Min: 75.0%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Attended: {metrics?.classes_attended || 0}</span>
            <span className="font-semibold text-on-surface">
              Total: {metrics?.total_classes || 0} Sessions
            </span>
          </div>
        </div>

        {/* Cumulative CGPA */}
        <div
          onClick={() => setActiveTab('exams')}
          className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Cumulative CGPA
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">workspace_premium</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              {metrics?.cgpa || '8.50'}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span> First Class
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">CBCS 10.0 Scale</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Standing: Distinction</span>
            <span className="font-semibold text-secondary">Top Decile</span>
          </div>
        </div>

        {/* Tuition & Fee Ledger */}
        <div
          onClick={() => setActiveTab('fees')}
          className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Tuition &amp; Term Dues
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">payments</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              ₹{metrics?.total_dues?.toLocaleString() || 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {metrics?.total_dues > 0 ? (
                <span className="inline-flex items-center text-error bg-error/10 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-xs mr-0.5">schedule</span> Balance Due
                </span>
              ) : (
                <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-xs mr-0.5">check_circle</span> Cleared
                </span>
              )}
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Paid: ₹{metrics?.total_paid?.toLocaleString() || 0}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Bursar Status</span>
            <span className="font-semibold text-secondary">
              {metrics?.total_dues > 0 ? 'Settle Online →' : 'No Hold Active'}
            </span>
          </div>
        </div>

        {/* Today's Lectures */}
        <div
          onClick={() => setActiveTab('timetable')}
          className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Scheduled Lectures
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">calendar_today</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              {today_classes?.length || 0}{' '}
              <span className="font-headline-sm text-headline-sm font-normal text-on-surface-variant">
                Slots
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-secondary bg-surface-container px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                {today_day}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Active Timetable
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Pending CIA Tasks</span>
            <span className="font-semibold text-error">
              {pending_assignments?.length || 0} Due Soon
            </span>
          </div>
        </div>
      </div>

      {/* Main Operational Workspace Grid (8 cols / 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Primary Left Column (8 of 12) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Subject Attendance Density & Statutory Index */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex flex-col">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Subject Attendance &amp; Statutory Eligibility Index
                </h2>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Course-wise lecture participation benchmarked against 75.0% university mandate
                </span>
              </div>
              <button
                onClick={() => setActiveTab('attendance')}
                className="text-secondary font-label-md text-label-md hover:underline font-semibold flex items-center gap-1"
                type="button"
              >
                <span>Open Attendance Register</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>

            <div className="space-y-space-md">
              {attendanceList && attendanceList.length > 0 ? (
                attendanceList.map((course) => {
                  const isShortfall = course.percentage < 75;
                  const isBorderline = course.percentage >= 75 && course.percentage < 82;
                  return (
                    <div key={course.course_id} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-body-md font-body-md flex-wrap gap-2">
                        <span className="font-semibold text-on-surface flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isShortfall
                                ? 'bg-error'
                                : isBorderline
                                ? 'bg-secondary-container'
                                : 'bg-on-tertiary-container'
                            }`}
                          ></span>
                          {course.course_code} — {course.course_name}
                        </span>
                        <div className="flex items-center gap-3 font-label-md text-label-md">
                          <span className="text-on-surface-variant">
                            {course.attended} / {course.total} Lectures
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-semibold ${
                              isShortfall
                                ? 'bg-error/10 text-error'
                                : isBorderline
                                ? 'bg-secondary/10 text-secondary'
                                : 'bg-surface-container-low text-on-tertiary-container'
                            }`}
                          >
                            {course.percentage}%{' '}
                            {isShortfall
                              ? `(Need ${course.needed_for_75})`
                              : `(+${course.safe_bunks} Safe Margin)`}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isShortfall
                              ? 'bg-error'
                              : isBorderline
                              ? 'bg-secondary'
                              : 'bg-on-tertiary-container'
                          }`}
                          style={{ width: `${Math.min(course.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-space-md text-center font-body-md text-on-surface-variant">
                  No subject attendance logs recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Continuous Internal Assessments (CIA) Queue */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-space-sm">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Continuous Internal Assessment (CIA) Queue
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-error/10 text-error font-label-sm text-label-sm font-semibold">
                  {pending_assignments?.length || 0} Pending Submissions
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('assignments')}
                className="font-label-sm text-label-sm text-secondary font-semibold hover:underline"
              >
                View All Coursework →
              </button>
            </div>

            <div className="flex flex-col gap-space-xs">
              {pending_assignments && pending_assignments.length > 0 ? (
                pending_assignments.map((asg, i) => (
                  <div
                    key={asg.id}
                    className="p-space-md rounded-xl bg-surface hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm"
                  >
                    <div className="flex items-start gap-space-md">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          i === 0 ? 'bg-error/10 text-error' : 'bg-surface-container text-secondary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">assignment_late</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-headline-sm text-label-lg font-bold text-on-surface">
                            {asg.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-label-sm text-label-sm uppercase font-semibold ${
                              i === 0
                                ? 'bg-error text-on-error'
                                : 'bg-surface-container text-secondary'
                            }`}
                          >
                            {asg.course_code}
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          {asg.description || 'Mandatory semester coursework evaluation and lab dossier.'}
                        </p>
                        <span className="font-label-sm text-label-sm text-outline">
                          Submission Deadline: {asg.due_date} • Maximum Weightage: {asg.max_marks} Marks
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => onSubmitAssignmentClick(asg)}
                        className="px-3 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded-lg font-label-sm text-label-sm font-semibold shadow-sm transition-all flex items-center gap-1"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-sm">upload_file</span>
                        <span>Submit Now</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-space-md rounded-xl bg-surface text-center font-body-md text-on-surface-variant">
                  All coursework assignments have been submitted for this cycle.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Governance & Schedule Column (4 of 12) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Today's Lecture Schedule */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">calendar_month</span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Lecture Schedule
                </h2>
              </div>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">
                {today_day}
              </span>
            </div>

            <div className="space-y-space-sm">
              {today_classes && today_classes.length > 0 ? (
                today_classes.map((cls, idx) => (
                  <div
                    key={idx}
                    className={`p-space-sm rounded-lg flex items-start gap-3 ${
                      idx === 0 ? 'bg-secondary/10' : 'bg-surface'
                    }`}
                  >
                    <div
                      className={`px-2.5 py-1.5 rounded-lg font-label-md text-label-md font-bold text-center leading-tight shrink-0 ${
                        idx === 0
                          ? 'bg-secondary text-on-secondary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {cls.start_time.substring(0, 5)}
                      <br />
                      <span className="text-xs font-normal opacity-80">
                        {cls.end_time.substring(0, 5)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-label-lg text-label-lg font-bold text-on-surface truncate">
                        {cls.course_name}
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">
                        {cls.course_code} • {cls.room_number}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-secondary font-semibold">
                        <span className="material-symbols-outlined text-xs">person</span>{' '}
                        {cls.faculty_name}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-space-md rounded-lg bg-surface text-center font-body-sm text-on-surface-variant">
                  No lectures scheduled for {today_day}.
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab('timetable')}
              className="w-full py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface font-label-sm text-label-sm font-semibold text-center transition-all"
              type="button"
            >
              Open Full Weekly Timetable
            </button>
          </div>

          {/* Institutional Circulars & Broadcasts */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error">campaign</span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Institutional Circulars
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded font-label-sm text-label-sm font-bold bg-secondary/10 text-secondary">
                {filteredNotices.length} Bulletins
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-surface-container rounded-lg overflow-x-auto">
              {['all', 'urgent', 'exam', 'event'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNoticeFilter(cat)}
                  className={`px-2.5 py-1 rounded-md font-label-sm text-label-sm uppercase font-semibold transition-all ${
                    noticeFilter === cat
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-space-sm">
              {filteredNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-space-sm rounded-lg bg-surface hover:bg-surface-container transition-colors flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-label-sm text-label-sm uppercase font-bold ${
                        notice.category === 'urgent'
                          ? 'bg-error/10 text-error'
                          : 'bg-secondary/10 text-secondary'
                      }`}
                    >
                      {notice.category}
                    </span>
                    <span className="text-xs text-outline">
                      {new Date(notice.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-label-lg text-label-lg font-bold text-on-surface mt-0.5">
                    {notice.title}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {notice.content}
                  </p>
                  <div className="text-xs text-outline mt-0.5">
                    Issued by: <strong className="text-on-surface">{notice.posted_by_name}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
