import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import DigitalIdModal from './components/DigitalIdModal';
import ExecutiveOverviewView from './pages/ExecutiveOverviewView';
import DashboardView from './pages/DashboardView';
import AttendanceView from './pages/AttendanceView';
import TimetableView from './pages/TimetableView';
import ExamsView from './pages/ExamsView';
import FeesView from './pages/FeesView';
import AssignmentsView from './pages/AssignmentsView';
import LeavesView from './pages/LeavesView';
import FacultyPortalView from './pages/FacultyPortalView';
import AdminPortalView from './pages/AdminPortalView';
import erpApi, { setActiveStudentId } from './api/client';

export default function App() {
  const [currentRole, setCurrentRole] = useState('admin'); // 'admin' | 'student' | 'faculty'
  const [activeTab, setActiveTab] = useState('executive_overview');
  const [showIdCard, setShowIdCard] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    if (newRole === 'faculty') {
      setActiveTab('faculty_workspace');
    } else if (newRole === 'student') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('executive_overview');
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    try {
      const allStd = await erpApi.getStudents();
      setStudentsList(allStd);

      const defaultStd =
        allStd.find((s) => s.full_name?.toLowerCase().includes('jebarson')) || allStd[0];
      const targetId = defaultStd ? defaultStd.id : null;
      if (targetId) {
        setSelectedStudentId(targetId);
        setActiveStudentId(targetId);
      }
      await loadStudentData(targetId);
    } catch (err) {
      console.error('Initial load error:', err);
      await loadStudentData(null);
    }
  };

  const loadStudentData = async (studentId) => {
    try {
      setIsRefreshing(true);
      setApiError(null);
      if (studentId) {
        setActiveStudentId(studentId);
      }
      const [dash, att] = await Promise.all([
        erpApi.getDashboardOverview(studentId),
        erpApi.getAttendance(),
      ]);
      setDashboardData(dash);
      setAttendanceList(att);
    } catch (err) {
      console.error('API connection error:', err);
      setApiError(
        'Unable to connect to Django API server. Please ensure backend is running at http://127.0.0.1:8000'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSelectStudent = async (newId) => {
    const idNum = parseInt(newId, 10);
    setSelectedStudentId(idNum);
    setActiveStudentId(idNum);
    await loadStudentData(idNum);
  };

  const handleSimulateAttendance = async () => {
    if (attendanceList.length > 0) {
      const firstCourse = attendanceList[0];
      const todayStr = new Date().toISOString().split('T')[0];
      await erpApi.toggleAttendance(firstCourse.course_id, 'present', todayStr);
      await loadStudentData(selectedStudentId);
    }
  };

  const handleDataChanged = async () => {
    const allStd = await erpApi.getStudents();
    setStudentsList(allStd);
    await loadStudentData(selectedStudentId);
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased">
      {/* Mobile Sidebar Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Fixed Sidebar Navigation */}
      <Sidebar
        currentRole={currentRole}
        setCurrentRole={handleRoleChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenIdCard={() => setShowIdCard(true)}
        student={dashboardData?.student}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Shell */}
      <div className="lg:pl-72">
        <TopNavbar
          currentRole={currentRole}
          setCurrentRole={handleRoleChange}
          student={dashboardData?.student}
          onRefresh={() => loadStudentData(selectedStudentId)}
          isRefreshing={isRefreshing}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          allStudents={studentsList}
          selectedStudentId={selectedStudentId}
          onSelectStudentId={handleSelectStudent}
          onOpenIdCard={() => setShowIdCard(true)}
          recentNotices={dashboardData?.recent_notices || []}
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
        />

        <main className="w-full pt-16 bg-surface min-h-screen">
          <div className="flex flex-col w-full">
            <div className="w-full px-margin-mobile lg:px-margin py-space-lg flex flex-col gap-space-lg">
              {apiError && (
                <div className="p-space-md rounded-xl bg-error/10 border border-error/30 text-error font-label-md text-label-md flex items-center gap-2">
                  <span className="material-symbols-outlined">error</span>
                  <span>
                    <strong>Server Telemetry Alert:</strong> {apiError}
                  </span>
                </div>
              )}

              {/* Executive Overview Dashboard (Sample UI Landing) */}
              {activeTab === 'executive_overview' && (
                <ExecutiveOverviewView
                  dashboardData={dashboardData}
                  studentsList={studentsList}
                  setActiveTab={setActiveTab}
                  onNavigateRole={handleRoleChange}
                />
              )}

              {/* Student Academic Hub */}
              {activeTab === 'dashboard' && (
                <DashboardView
                  dashboardData={dashboardData}
                  attendanceList={attendanceList}
                  setActiveTab={setActiveTab}
                  onPayFeeClick={() => setActiveTab('fees')}
                  onSubmitAssignmentClick={() => setActiveTab('assignments')}
                  onSimulateAttendance={handleSimulateAttendance}
                  onOpenIdCard={() => setShowIdCard(true)}
                />
              )}

              {/* Attendance Register */}
              {activeTab === 'attendance' && (
                <AttendanceView
                  attendanceList={attendanceList}
                  onRefresh={() => loadStudentData(selectedStudentId)}
                />
              )}

              {/* Timetable */}
              {activeTab === 'timetable' && <TimetableView />}

              {/* Grades & Transcripts */}
              {activeTab === 'exams' && <ExamsView student={dashboardData?.student} />}

              {/* Financial Operations & Fees */}
              {activeTab === 'fees' && (
                <FeesView onRefreshParent={() => loadStudentData(selectedStudentId)} />
              )}

              {/* Coursework & CIA */}
              {activeTab === 'assignments' && (
                <AssignmentsView onRefreshParent={() => loadStudentData(selectedStudentId)} />
              )}

              {/* Leave & OD Portal */}
              {activeTab === 'leaves' && <LeavesView />}

              {/* Faculty & Staff Workspace */}
              {activeTab === 'faculty_workspace' && (
                <FacultyPortalView onDataChanged={handleDataChanged} />
              )}

              {/* Admissions, Enrollment & Registry */}
              {activeTab === 'admin_console' && (
                <AdminPortalView onDataChanged={handleDataChanged} />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Digital Student ID Modal */}
      {showIdCard && (
        <DigitalIdModal
          student={dashboardData?.student}
          onClose={() => setShowIdCard(false)}
        />
      )}
    </div>
  );
}
