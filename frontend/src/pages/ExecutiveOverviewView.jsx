import React, { useState } from 'react';

export default function ExecutiveOverviewView({
  dashboardData,
  studentsList = [],
  setActiveTab,
  onNavigateRole
}) {
  const [activeDivision, setActiveDivision] = useState('All');
  const [queueSigned, setQueueSigned] = useState({});
  const [triagedIds, setTriagedIds] = useState({});
  const [toastMsg, setToastMsg] = useState(null);

  const triggerToast = (message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Division-specific data for the interactive Enrollment Dynamics SVG chart
  const divisionData = {
    All: {
      ug: '9,410',
      pg: '4,120',
      exec: '1,290',
      yieldRate: '43.8%',
      yieldDelta: '+3.1%',
      globalRate: '31.2%',
      globalCount: '4,624',
      fte: '14,110',
      ftePct: '95.2%',
      ugPath: 'M 0,130 C 120,110 220,95 380,80 C 520,68 640,42 760,25',
      ugArea: 'M 0,130 C 120,110 220,95 380,80 C 520,68 640,42 760,25 L 760,155 L 0,155 Z',
      pgPath: 'M 0,145 C 130,138 240,125 380,118 C 500,110 650,96 760,86',
      execPath: 'M 0,152 C 140,150 250,146 380,142 C 510,138 640,130 760,126',
      nodes: [
        { cx: 0, cy: 130 },
        { cx: 190, cy: 100 },
        { cx: 380, cy: 80 },
        { cx: 570, cy: 55 },
        { cx: 760, cy: 25, r: 5 },
      ],
    },
    STEM: {
      ug: '3,980',
      pg: '1,840',
      exec: '420',
      yieldRate: '49.2%',
      yieldDelta: '+4.6%',
      globalRate: '38.4%',
      globalCount: '2,396',
      fte: '6,090',
      ftePct: '97.6%',
      ugPath: 'M 0,136 C 120,115 220,92 380,72 C 520,54 640,34 760,18',
      ugArea: 'M 0,136 C 120,115 220,92 380,72 C 520,54 640,34 760,18 L 760,155 L 0,155 Z',
      pgPath: 'M 0,144 C 130,132 240,118 380,108 C 500,98 650,82 760,72',
      execPath: 'M 0,152 C 140,149 250,145 380,140 C 510,135 640,128 760,122',
      nodes: [
        { cx: 0, cy: 136 },
        { cx: 190, cy: 98 },
        { cx: 380, cy: 72 },
        { cx: 570, cy: 45 },
        { cx: 760, cy: 18, r: 5 },
      ],
    },
    'Health Sci': {
      ug: '1,820',
      pg: '1,140',
      exec: '310',
      yieldRate: '52.4%',
      yieldDelta: '+2.8%',
      globalRate: '24.5%',
      globalCount: '801',
      fte: '3,210',
      ftePct: '98.1%',
      ugPath: 'M 0,125 C 120,108 220,96 380,84 C 520,70 640,50 760,32',
      ugArea: 'M 0,125 C 120,108 220,96 380,84 C 520,70 640,50 760,32 L 760,155 L 0,155 Z',
      pgPath: 'M 0,140 C 130,134 240,122 380,112 C 500,102 650,90 760,80',
      execPath: 'M 0,150 C 140,148 250,144 380,139 C 510,134 640,129 760,124',
      nodes: [
        { cx: 0, cy: 125 },
        { cx: 190, cy: 100 },
        { cx: 380, cy: 84 },
        { cx: 570, cy: 59 },
        { cx: 760, cy: 32, r: 5 },
      ],
    },
    Business: {
      ug: '2,140',
      pg: '780',
      exec: '450',
      yieldRate: '41.0%',
      yieldDelta: '+1.9%',
      globalRate: '34.8%',
      globalCount: '1,172',
      fte: '3,190',
      ftePct: '94.6%',
      ugPath: 'M 0,132 C 120,118 220,104 380,90 C 520,76 640,56 760,38',
      ugArea: 'M 0,132 C 120,118 220,104 380,90 C 520,76 640,56 760,38 L 760,155 L 0,155 Z',
      pgPath: 'M 0,146 C 130,140 240,130 380,122 C 500,115 650,104 760,94',
      execPath: 'M 0,149 C 140,145 250,140 380,134 C 510,128 640,118 760,112',
      nodes: [
        { cx: 0, cy: 132 },
        { cx: 190, cy: 109 },
        { cx: 380, cy: 90 },
        { cx: 570, cy: 66 },
        { cx: 760, cy: 38, r: 5 },
      ],
    },
    Humanities: {
      ug: '1,470',
      pg: '360',
      exec: '110',
      yieldRate: '38.4%',
      yieldDelta: '+1.2%',
      globalRate: '18.2%',
      globalCount: '353',
      fte: '1,620',
      ftePct: '88.5%',
      ugPath: 'M 0,138 C 120,126 220,114 380,102 C 520,90 640,74 760,58',
      ugArea: 'M 0,138 C 120,126 220,114 380,102 C 520,90 640,74 760,58 L 760,155 L 0,155 Z',
      pgPath: 'M 0,148 C 130,144 240,138 380,132 C 500,126 650,118 760,110',
      execPath: 'M 0,153 C 140,152 250,150 380,148 C 510,145 640,142 760,138',
      nodes: [
        { cx: 0, cy: 138 },
        { cx: 190, cy: 118 },
        { cx: 380, cy: 102 },
        { cx: 570, cy: 82 },
        { cx: 760, cy: 58, r: 5 },
      ],
    },
  };

  const currentChart = divisionData[activeDivision] || divisionData.All;

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Feedback Toast */}
      {toastMsg && (
        <div className="bg-surface-container-lowest border border-secondary/30 rounded-xl px-space-md py-space-sm shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-tertiary-container">verified</span>
            <span className="font-label-lg text-label-lg text-on-surface font-semibold">{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Header: Executive Context & Quick Operational Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Apex Central Intelligence
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Census Milestone: 8 Days Remaining
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
            Welcome back, Dr. Vance
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-on-surface">
              Vice Chancellor of Academic &amp; Student Affairs
            </span>
            <span className="text-outline-variant">•</span>
            <span>Fall 2025 Academic Cycle</span>
            <span className="text-outline-variant">•</span>
            <span>Campus Census Date: Oct 15</span>
            <span className="text-outline-variant">•</span>
            <span className="font-medium text-secondary">
              14,820 Active Enrollees ({studentsList.length} Live SIS Profiles)
            </span>
          </p>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap shrink-0">
          <button
            onClick={() => {
              window.print();
            }}
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-lg text-label-lg rounded-lg shadow-sm transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">description</span>
            <span>Export Census</span>
          </button>
          <button
            onClick={() => setActiveTab('faculty_workspace')}
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-lg text-label-lg rounded-lg shadow-sm transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">campaign</span>
            <span>Broadcast</span>
          </button>
          <button
            onClick={() => setActiveTab('admin_console')}
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg rounded-lg shadow-md hover:shadow-lg transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            <span>Register Student</span>
          </button>
        </div>
      </div>

      {/* 4 High-Authority KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Total Active Enrollment */}
        <div
          onClick={() => setActiveTab('admin_console')}
          className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Active Enrollment
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">groups</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              14,820
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span> +4.2% YoY
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">vs Fall 2024</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Target: 15,000</span>
            <span className="font-semibold text-on-surface">98.8% to Target</span>
          </div>
        </div>

        {/* Retention & Persistence */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Retention &amp; Persistence
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">verified</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              92.4%
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-xs mr-0.5">arrow_upward</span> +1.8%
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                vs National Avg (84.6%)
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Benchmarked: AAU Tier 1</span>
            <span className="font-semibold text-secondary">Top Decile</span>
          </div>
        </div>

        {/* Tuition Revenue & Collections */}
        <div
          onClick={() => setActiveTab('fees')}
          className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Tuition Realized
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">payments</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              $48.6M
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-xs mr-0.5">check_circle</span> 96.2%
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                of $50.5M Term Plan
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Pending Bursar Release</span>
            <span className="font-semibold text-on-surface">+$2.1M Ahead</span>
          </div>
        </div>

        {/* Faculty Allocation & Staffing */}
        <div
          onClick={() => setActiveTab('faculty_workspace')}
          className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer"
        >
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
              842{' '}
              <span className="font-headline-sm text-headline-sm font-normal text-on-surface-variant">
                FTE
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-secondary bg-surface-container px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                17:1 Student/Faculty
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Ratio balanced</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Active Tenure Track</span>
            <span className="font-semibold text-error">14 Open Searches</span>
          </div>
        </div>
      </div>

      {/* Main Operational Workspace Grid (8 cols / 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Primary Left Column (8 of 12) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Interactive Enrollment Trends Chart Card */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    Institutional Enrollment Dynamics
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-secondary font-semibold">
                    AY 2024–2026
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Comparative demographic volume across academic divisions
                </p>
              </div>
              {/* Discipline Filter Pills */}
              <div className="flex items-center gap-1 p-1 bg-surface-container rounded-lg overflow-x-auto max-w-full">
                {['All', 'STEM', 'Health Sci', 'Business', 'Humanities'].map((div) => (
                  <button
                    key={div}
                    onClick={() => setActiveDivision(div)}
                    className={`px-3 py-1 rounded-lg font-label-sm text-label-sm font-semibold transition-all ${
                      activeDivision === div
                        ? 'text-on-secondary bg-secondary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
                    }`}
                    type="button"
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Area with Detailed SVG and Floating Legend */}
            <div className="relative w-full h-72 bg-surface rounded-xl p-space-md flex flex-col justify-between overflow-hidden">
              {/* Legend Indicators */}
              <div
                className="flex flex-wrap items-center justify-between border-b pb-2 gap-2"
                style={{ borderColor: 'rgba(11,28,48,0.06)' }}
              >
                <div className="flex flex-wrap items-center gap-space-md text-label-sm font-label-sm">
                  <span className="flex items-center gap-1.5 font-medium text-on-surface">
                    <span className="w-3 h-3 rounded bg-secondary inline-block"></span> Undergraduate ({currentChart.ug})
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-on-surface">
                    <span className="w-3 h-3 rounded bg-primary inline-block"></span> Postgraduate / Doctoral ({currentChart.pg})
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-on-surface">
                    <span className="w-3 h-3 rounded bg-secondary-fixed-dim inline-block"></span> Continuing &amp; Executive ({currentChart.exec})
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Units: Headcount
                </span>
              </div>

              {/* Vector Line Graph */}
              <div className="relative w-full flex-1 pt-4">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 760 180">
                  {/* Background Gridlines */}
                  <line stroke="#dce9ff" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="760" y1="20" y2="20" />
                  <line stroke="#dce9ff" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="760" y1="65" y2="65" />
                  <line stroke="#dce9ff" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="760" y1="110" y2="110" />
                  <line stroke="#dce9ff" strokeWidth="1" x1="0" x2="760" y1="155" y2="155" />

                  {/* Undergraduate Trend (Royal Blue) */}
                  <path
                    d={currentChart.ugPath}
                    fill="none"
                    stroke="#0051d5"
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                  {/* Area Under Curve subtle gradient */}
                  <path d={currentChart.ugArea} fill="#0051d5" fillOpacity="0.06" />

                  {/* Postgraduate Trend (Midnight Primary) */}
                  <path
                    d={currentChart.pgPath}
                    fill="none"
                    stroke="#131b2e"
                    strokeDasharray="4 2"
                    strokeWidth="2.5"
                  />

                  {/* Continuing Ed (Lighter accent) */}
                  <path
                    d={currentChart.execPath}
                    fill="none"
                    stroke="#76777d"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />

                  {/* Key Data Nodes on Undergraduate Curve */}
                  {currentChart.nodes.map((node, i) => (
                    <circle
                      key={i}
                      cx={node.cx}
                      cy={node.cy}
                      fill="#0051d5"
                      r={node.r || 4}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              </div>

              {/* X-Axis Labels */}
              <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-2">
                <span>Fall '23 (Census)</span>
                <span>Spring '24</span>
                <span>Summer '24</span>
                <span>Fall '24 (Census)</span>
                <span className="font-bold text-secondary">Fall '25 (Current)</span>
              </div>
            </div>

            {/* Bottom Micro Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
              <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between">
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">
                    Yield Rate (Admit-to-Enroll)
                  </div>
                  <div className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {currentChart.yieldRate}{' '}
                    <span className="font-label-sm text-label-sm text-on-tertiary-container font-semibold">
                      {currentChart.yieldDelta}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">how_to_reg</span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between">
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">
                    Out-of-State / Global
                  </div>
                  <div className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {currentChart.globalRate}{' '}
                    <span className="font-label-sm text-label-sm text-secondary font-semibold">
                      {currentChart.globalCount}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">public</span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between">
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">
                    Full-Time Equivalency (FTE)
                  </div>
                  <div className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {currentChart.fte}{' '}
                    <span className="font-label-sm text-label-sm text-on-tertiary-container font-semibold">
                      {currentChart.ftePct}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">speed</span>
              </div>
            </div>
          </div>

          {/* Departmental Health & Seat Occupancy Index */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Faculty Seat Capacity &amp; Section Density
                </h2>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Lecture, laboratory, and clinical instructional capacity benchmarks
                </span>
              </div>
              <button
                onClick={() => setActiveTab('timetable')}
                className="text-secondary font-label-md text-label-md hover:underline font-semibold flex items-center gap-1"
                type="button"
              >
                <span>Classroom Allocation Matrix</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>

            <div className="space-y-space-md">
              {/* College of Medicine */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-body-md font-body-md flex-wrap gap-2">
                  <span className="font-semibold text-on-surface flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                    College of Medicine &amp; Biomedical Sciences
                  </span>
                  <div className="flex items-center gap-3 font-label-md text-label-md">
                    <span className="text-on-surface-variant">1,240 / 1,240 Enrolled</span>
                    <span className="px-2 py-0.5 rounded font-semibold bg-error/10 text-error">
                      100% (Waitlist Active: 84)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div className="bg-error h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* College of Engineering & Computing */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-body-md font-body-md flex-wrap gap-2">
                  <span className="font-semibold text-on-surface flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    College of Engineering, AI &amp; Applied Sciences
                  </span>
                  <div className="flex items-center gap-3 font-label-md text-label-md">
                    <span className="text-on-surface-variant">4,120 / 4,200 Enrolled</span>
                    <span className="px-2 py-0.5 rounded font-semibold bg-secondary/10 text-secondary">
                      98.1% Capacity
                    </span>
                  </div>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '98.1%' }}></div>
                </div>
              </div>

              {/* College of Business */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-body-md font-body-md flex-wrap gap-2">
                  <span className="font-semibold text-on-surface flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
                    School of Global Management &amp; Finance
                  </span>
                  <div className="flex items-center gap-3 font-label-md text-label-md">
                    <span className="text-on-surface-variant">3,680 / 3,900 Enrolled</span>
                    <span className="px-2 py-0.5 rounded font-semibold bg-secondary/10 text-secondary">
                      94.3% Capacity
                    </span>
                  </div>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div className="bg-secondary-container h-full rounded-full" style={{ width: '94.3%' }}></div>
                </div>
              </div>

              {/* School of Law */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-body-md font-body-md flex-wrap gap-2">
                  <span className="font-semibold text-on-surface flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-on-tertiary-container"></span>
                    School of Law &amp; Jurisprudence
                  </span>
                  <div className="flex items-center gap-3 font-label-md text-label-md">
                    <span className="text-on-surface-variant">910 / 1,000 Enrolled</span>
                    <span className="px-2 py-0.5 rounded font-semibold bg-surface-container-low text-on-tertiary-container">
                      91.0% Optimal
                    </span>
                  </div>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div className="bg-on-tertiary-container h-full rounded-full" style={{ width: '91%' }}></div>
                </div>
              </div>

              {/* College of Arts & Humanities */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-body-md font-body-md flex-wrap gap-2">
                  <span className="font-semibold text-on-surface flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-outline"></span>
                    College of Arts, Humanities &amp; Social Sciences
                  </span>
                  <div className="flex items-center gap-3 font-label-md text-label-md">
                    <span className="text-on-surface-variant">4,870 / 5,500 Enrolled</span>
                    <span className="px-2 py-0.5 rounded font-semibold bg-surface-container text-on-surface-variant">
                      88.5% (630 open seats)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div className="bg-surface-tint h-full rounded-full" style={{ width: '88.5%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Urgent Action Items & Approval Queue */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-space-sm">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Urgent Provost &amp; Chancellor Queue
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-error/10 text-error font-label-sm text-label-sm font-semibold">
                  {4 - Object.keys(queueSigned).length} Critical Pending
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                All signatures cryptographically audited
              </span>
            </div>

            <div className="flex flex-col gap-space-xs">
              {/* Item 1: High Priority */}
              <div className="p-space-md rounded-xl bg-surface hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div className="flex items-start gap-space-md">
                  <div className="w-9 h-9 rounded-lg bg-error/10 text-error flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-xl">award_star</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-headline-sm text-label-lg font-bold text-on-surface">
                        4 Faculty Tenure Dossiers
                      </span>
                      <span className="px-2 py-0.5 rounded font-label-sm text-label-sm uppercase bg-error text-on-error font-semibold">
                        High Priority
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Final Vice Chancellor executive endorsement for College of Engineering &amp; Bio-Health candidates.
                    </p>
                    <span className="font-label-sm text-label-sm text-outline">
                      Deadline: Today at 5:00 PM EST • Dossier IDs: TN-9021 through TN-9024
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setActiveTab('faculty_workspace')}
                    className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface font-label-sm text-label-sm font-semibold transition-all"
                    type="button"
                  >
                    Examine
                  </button>
                  <button
                    onClick={() => {
                      setQueueSigned({ ...queueSigned, q1: true });
                      triggerToast('4 Faculty Tenure Dossiers cryptographically signed and archived.');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold shadow-sm transition-all ${
                      queueSigned.q1
                        ? 'bg-on-tertiary-container text-on-primary'
                        : 'bg-primary hover:bg-on-surface text-on-primary'
                    }`}
                    type="button"
                  >
                    {queueSigned.q1 ? 'Signed ✓' : 'Sign All'}
                  </button>
                </div>
              </div>

              {/* Item 2: Medium Priority */}
              <div className="p-space-md rounded-xl bg-surface hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div className="flex items-start gap-space-md">
                  <div className="w-9 h-9 rounded-lg bg-surface-container text-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-headline-sm text-label-lg font-bold text-on-surface">
                        12 Deferred Tuition Payment Overrides
                      </span>
                      <span className="px-2 py-0.5 rounded font-label-sm text-label-sm uppercase bg-surface-container text-secondary font-semibold">
                        Medium
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Emergency bursar hardship deferral plans approved by Financial Aid Committee.
                    </p>
                    <span className="font-label-sm text-label-sm text-outline">
                      Total Aggregate: $44,890.00 • Census hold releases
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setQueueSigned({ ...queueSigned, q2: true });
                      triggerToast('12 Deferred Tuition Payment Overrides authorized for Bursar release.');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold shadow-sm transition-all ${
                      queueSigned.q2
                        ? 'bg-on-tertiary-container text-on-primary'
                        : 'bg-secondary hover:bg-secondary-container text-on-secondary'
                    }`}
                    type="button"
                  >
                    {queueSigned.q2 ? 'Authorized ✓' : 'Authorize Plan'}
                  </button>
                </div>
              </div>

              {/* Item 3: Normal Priority */}
              <div className="p-space-md rounded-xl bg-surface hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div className="flex items-start gap-space-md">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-xl">auto_stories</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-headline-sm text-label-lg font-bold text-on-surface">
                        Curriculum Committee Syllabus Revisions
                      </span>
                      <span className="px-2 py-0.5 rounded font-label-sm text-label-sm uppercase bg-surface-container-low text-on-surface-variant font-semibold">
                        Normal
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      New accelerated credit guidelines for Biomedical AI &amp; Applied Data Sciences (CS-409/509).
                    </p>
                    <span className="font-label-sm text-label-sm text-outline">
                      Submitted by Dean Marcus Sterling • 3 courses pending catalog insertion
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setActiveTab('admin_console')}
                    className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface font-label-sm text-label-sm font-semibold transition-all"
                    type="button"
                  >
                    Review Diff
                  </button>
                </div>
              </div>

              {/* Item 4: Safety / Compliance */}
              <div className="p-space-md rounded-xl bg-surface hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div className="flex items-start gap-space-md">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-xl">security</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-headline-sm text-label-lg font-bold text-on-surface">
                        Winter Campus Severe Weather Operational Protocol
                      </span>
                      <span className="px-2 py-0.5 rounded font-label-sm text-label-sm uppercase bg-surface-container-low text-on-surface-variant font-semibold">
                        Normal
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Annual disaster preparedness compliance submission to Higher Learning Commission.
                    </p>
                    <span className="font-label-sm text-label-sm text-outline">
                      Co-signed with Campus Public Safety &amp; Chief Risk Officer
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setQueueSigned({ ...queueSigned, q4: true });
                      triggerToast('Winter Campus Operational Protocol signed and submitted.');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold transition-all ${
                      queueSigned.q4
                        ? 'bg-on-tertiary-container text-on-primary'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                    }`}
                    type="button"
                  >
                    {queueSigned.q4 ? 'Protocol Signed ✓' : 'Sign Protocol'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Governance & Sentinel Column (4 of 12) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Real-Time Academic Governance Schedule */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">calendar_month</span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Executive Schedule
                </h2>
              </div>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">
                Today: Oct 07
              </span>
            </div>
            <div className="space-y-space-sm">
              {/* Event 1: Active soon */}
              <div className="p-space-sm rounded-lg bg-secondary/10 flex items-start gap-3">
                <div className="px-2.5 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-bold text-center leading-tight shrink-0">
                  14:00
                  <br />
                  <span className="text-xs font-normal opacity-80">EST</span>
                </div>
                <div className="min-w-0">
                  <div className="font-label-lg text-label-lg font-bold text-on-surface truncate">
                    Board of Regents Quarterly
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    Council Chambers • Room 402B
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-secondary font-semibold">
                    <span className="material-symbols-outlined text-xs">videocam</span> Presentation deck loaded
                  </div>
                </div>
              </div>
              {/* Event 2 */}
              <div className="p-space-sm rounded-lg bg-surface flex items-start gap-3">
                <div className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md font-bold text-center leading-tight shrink-0">
                  16:30
                  <br />
                  <span className="text-xs font-normal opacity-80">EST</span>
                </div>
                <div className="min-w-0">
                  <div className="font-label-lg text-label-lg font-bold text-on-surface truncate">
                    Provost Academic Cabinet
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    Vance Executive Suite &amp; Virtual
                  </div>
                  <div className="mt-1 text-xs text-on-surface-variant">
                    Item: 2026 Faculty Allocation Strategy
                  </div>
                </div>
              </div>
              {/* Event 3: Forward deadline */}
              <div className="p-space-sm rounded-lg bg-surface flex items-start gap-3">
                <div className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md font-bold text-center leading-tight shrink-0">
                  THU
                  <br />
                  <span className="text-xs font-normal opacity-80">OCT 09</span>
                </div>
                <div className="min-w-0">
                  <div className="font-label-lg text-label-lg font-bold text-on-surface truncate">
                    Midterm Grade Roster Closes
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    Systemwide Automated Registrar Lock
                  </div>
                  <div className="mt-1 text-xs text-on-surface-variant">74% of sections submitted</div>
                </div>
              </div>
            </div>
          </div>

          {/* At-Risk Student Early Alert Center */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error">notification_important</span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Early Alert Sentinel
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded font-label-sm text-label-sm font-bold bg-error/10 text-error">
                3 Critical
              </span>
            </div>
            <div className="space-y-space-sm">
              {/* Student 1 */}
              <div className="p-space-sm rounded-lg bg-surface hover:bg-surface-container transition-colors flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-lg text-label-lg font-bold text-on-surface truncate">
                      Mateo R. Alvarez
                    </span>
                    <span className="text-xs text-on-surface-variant">ID: 2023-M41</span>
                  </div>
                  <div className="font-body-sm text-body-sm text-error flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-xs">warning</span>
                    <span>Absent 4 Consec. Lectures (BioChem 301)</span>
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Assigned: Dr. Aris Thorne (Pre-Med Advisor)
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTriagedIds({ ...triagedIds, s1: true });
                    triggerToast('Case escalated to Dr. Aris Thorne (Pre-Med Advisor).');
                  }}
                  className={`px-2.5 py-1 rounded font-label-sm text-label-sm font-semibold shrink-0 transition-all ${
                    triagedIds.s1
                      ? 'bg-on-tertiary-container text-on-primary'
                      : 'bg-surface-container-high hover:bg-secondary hover:text-on-secondary text-on-surface'
                  }`}
                  title="Notify College Advisor"
                  type="button"
                >
                  {triagedIds.s1 ? 'Triaged' : 'Triage'}
                </button>
              </div>

              {/* Student 2 */}
              <div className="p-space-sm rounded-lg bg-surface hover:bg-surface-container transition-colors flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-lg text-label-lg font-bold text-on-surface truncate">
                      Seraphina Chen
                    </span>
                    <span className="text-xs text-on-surface-variant">ID: 2024-C19</span>
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-xs text-secondary">trending_down</span>
                    <span>GPA Shift (3.8 → 2.12) Fall Term</span>
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Assigned: Academic Recovery Hub
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTriagedIds({ ...triagedIds, s2: true });
                    triggerToast('Academic Recovery Hub advisor notified for Seraphina Chen.');
                  }}
                  className={`px-2.5 py-1 rounded font-label-sm text-label-sm font-semibold shrink-0 transition-all ${
                    triagedIds.s2
                      ? 'bg-on-tertiary-container text-on-primary'
                      : 'bg-surface-container-high hover:bg-secondary hover:text-on-secondary text-on-surface'
                  }`}
                  title="Notify College Advisor"
                  type="button"
                >
                  {triagedIds.s2 ? 'Triaged' : 'Triage'}
                </button>
              </div>

              {/* Student 3 */}
              <div className="p-space-sm rounded-lg bg-surface hover:bg-surface-container transition-colors flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-lg text-label-lg font-bold text-on-surface truncate">
                      Jamal K. Davies
                    </span>
                    <span className="text-xs text-on-surface-variant">ID: 2022-D90</span>
                  </div>
                  <div className="font-body-sm text-body-sm text-secondary flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-xs">lock_clock</span>
                    <span>Bursar Registration Hold Active</span>
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Senior Degree Audit: 114 / 120 Credits
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTriagedIds({ ...triagedIds, s3: true });
                    triggerToast('Bursar hold released for Jamal K. Davies (ID: 2022-D90).');
                  }}
                  className={`px-2.5 py-1 rounded font-label-sm text-label-sm font-semibold shrink-0 transition-all ${
                    triagedIds.s3
                      ? 'bg-on-tertiary-container text-on-primary'
                      : 'bg-secondary text-on-secondary hover:bg-secondary-container'
                  }`}
                  title="Release Hold"
                  type="button"
                >
                  {triagedIds.s3 ? 'Released' : 'Release'}
                </button>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('attendance')}
              className="w-full py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface font-label-sm text-label-sm font-semibold text-center transition-all"
              type="button"
            >
              Open Student Success Case Manager (47 Flagged)
            </button>
          </div>

          {/* SIS Audit & Security Log */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant">policy</span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  SIS Audit &amp; Compliance
                </h2>
              </div>
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
            </div>
            <div className="space-y-space-sm font-label-sm text-label-sm">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-base text-secondary shrink-0 mt-0.5">
                  edit_note
                </span>
                <div className="min-w-0">
                  <span className="font-semibold text-on-surface">Grade Modification Logged</span>
                  <p className="text-on-surface-variant text-xs truncate">
                    Dr. Miller altered CS-301 Section 2 (B+ to A)
                  </p>
                  <span className="text-xs text-outline">12 min ago • Terminal #10.14.8.192</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-base text-on-tertiary-container shrink-0 mt-0.5">
                  cloud_done
                </span>
                <div className="min-w-0">
                  <span className="font-semibold text-on-surface">
                    Certified Official Transcript Issued
                  </span>
                  <p className="text-on-surface-variant text-xs truncate">
                    FERPA-cleared electronic delivery to Oxford University
                  </p>
                  <span className="text-xs text-outline">38 min ago • Registrar Dispatch</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-base text-on-surface-variant shrink-0 mt-0.5">
                  vpn_key
                </span>
                <div className="min-w-0">
                  <span className="font-semibold text-on-surface">Faculty Privilege Escalation</span>
                  <p className="text-on-surface-variant text-xs truncate">
                    Adjunct permissions granted for Lab 404 (Chemistry)
                  </p>
                  <span className="text-xs text-outline">2 hrs ago • IT Security Gateway</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
