import React, { useState } from 'react';
import erpApi from '../api/client';

export default function AttendanceView({ attendanceList = [], onRefresh }) {
  const [updatingId, setUpdatingId] = useState(null);

  const overallAttended = attendanceList.reduce((acc, c) => acc + c.attended, 0);
  const overallTotal = attendanceList.reduce((acc, c) => acc + c.total, 0);
  const overallPercentage =
    overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 1000) / 10 : 0;
  const shortfallCount = attendanceList.filter((c) => c.percentage < 75).length;

  const handleSimulate = async (courseId, status) => {
    try {
      setUpdatingId(courseId);
      const todayStr = new Date().toISOString().split('T')[0];
      await erpApi.toggleAttendance(courseId, status, todayStr);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Error logging attendance record:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Statutory Compliance Engine
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Mandate: 75.0% Minimum Aggregate for ESE Eligibility
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
            Curricular Attendance &amp; Eligibility Register
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-on-surface">Office of the Academic Registrar</span>
            <span className="text-outline-variant">•</span>
            <span>Real-time Lecture Telemetry</span>
            <span className="text-outline-variant">•</span>
            <span className="font-medium text-secondary">
              {overallAttended} of {overallTotal} Sessions Logged
            </span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap shrink-0">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-lg text-label-lg rounded-lg shadow-sm transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            <span>Export Register</span>
          </button>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg rounded-lg shadow-md transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">sync</span>
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Aggregate Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">analytics</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              {overallPercentage}%
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {overallPercentage >= 75 ? (
                <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-xs mr-0.5">verified</span> Exam Eligible
                </span>
              ) : (
                <span className="inline-flex items-center text-error bg-error/10 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-xs mr-0.5">warning</span> Shortfall Alert
                </span>
              )}
              <span className="font-body-sm text-body-sm text-on-surface-variant">vs 75% Mandate</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Statutory Threshold</span>
            <span className="font-semibold text-on-surface">75.0% Required</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Sessions Attended
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">check_circle</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              {overallAttended}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-secondary bg-surface-container px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                {overallTotal} Scheduled
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Active Term</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Missed Sessions</span>
            <span className="font-semibold text-on-surface">
              {Math.max(0, overallTotal - overallAttended)} Absences
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Enrolled Subjects
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">menu_book</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              {attendanceList.length}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                CBCS Core
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Credit Courses</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Compliant Subjects</span>
            <span className="font-semibold text-secondary">
              {attendanceList.length - shortfallCount} of {attendanceList.length}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Shortfall Sentinel
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">notification_important</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              {shortfallCount}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                  shortfallCount > 0
                    ? 'text-error bg-error/10'
                    : 'text-on-tertiary-container bg-surface-container-low'
                }`}
              >
                {shortfallCount > 0 ? 'Action Needed' : 'Zero Flags'}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Course Alerts
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Hall Ticket Lock</span>
            <span className={`font-semibold ${shortfallCount > 0 ? 'text-error' : 'text-on-tertiary-container'}`}>
              {shortfallCount > 0 ? 'Condonation Req.' : 'Cleared'}
            </span>
          </div>
        </div>
      </div>

      {/* Subject-by-Subject Interactive Register */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {attendanceList.map((course) => {
          const isDanger = course.percentage < 75;
          const isWarning = course.percentage >= 75 && course.percentage < 82;

          return (
            <div
              key={course.course_id}
              className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-space-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold uppercase">
                        {course.course_code} • {course.credits} Credits
                      </span>
                      {isDanger ? (
                        <span className="px-2 py-0.5 rounded-full bg-error/10 text-error font-label-sm text-label-sm font-semibold uppercase">
                          Shortfall
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-on-tertiary-container font-label-sm text-label-sm font-semibold uppercase">
                          Optimal
                        </span>
                      )}
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      {course.course_name}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Instructor: <strong className="text-on-surface">{course.faculty}</strong>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`font-stat-metric text-2xl font-bold ${
                        isDanger
                          ? 'text-error'
                          : isWarning
                          ? 'text-secondary'
                          : 'text-on-tertiary-container'
                      }`}
                    >
                      {course.percentage}%
                    </div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">
                      {course.attended} / {course.total} Sessions
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden my-space-md">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isDanger
                        ? 'bg-error'
                        : isWarning
                        ? 'bg-secondary'
                        : 'bg-on-tertiary-container'
                    }`}
                    style={{ width: `${Math.min(course.percentage, 100)}%` }}
                  />
                </div>

                {/* Forecast Callout */}
                <div
                  className={`p-space-sm rounded-lg flex items-center gap-2 font-body-sm text-body-sm ${
                    isDanger
                      ? 'bg-error/10 text-error'
                      : 'bg-surface text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {isDanger ? 'warning' : 'trending_up'}
                  </span>
                  {isDanger ? (
                    <span>
                      Attend next <strong>{course.needed_for_75}</strong> consecutive lectures to
                      restore 75.0% statutory compliance.
                    </span>
                  ) : (
                    <span>
                      Compliance Buffer: <strong>{course.safe_bunks}</strong> lecture
                      {course.safe_bunks !== 1 ? 's' : ''} surplus above the 75.0% statutory floor.
                    </span>
                  )}
                </div>
              </div>

              {/* Simulation Actions */}
              <div className="flex items-center gap-space-sm pt-space-xs border-t border-surface-container">
                <button
                  type="button"
                  disabled={updatingId === course.course_id}
                  onClick={() => handleSimulate(course.course_id, 'present')}
                  className="flex-1 py-2 px-3 rounded-lg bg-surface-container hover:bg-secondary hover:text-on-secondary text-on-surface font-label-md text-label-md font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  <span>Simulate Present</span>
                </button>
                <button
                  type="button"
                  disabled={updatingId === course.course_id}
                  onClick={() => handleSimulate(course.course_id, 'absent')}
                  className="flex-1 py-2 px-3 rounded-lg bg-surface-container hover:bg-error hover:text-on-error text-on-surface font-label-md text-label-md font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">do_not_disturb_on</span>
                  <span>Simulate Absent</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
