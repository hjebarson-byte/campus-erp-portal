import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import DigitalIdModal from './components/DigitalIdModal';
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
  const [currentRole, setCurrentRole] = useState('student'); // 'student' | 'faculty' | 'admin'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showIdCard, setShowIdCard] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Theme & Accent State
  const [theme, setTheme] = useState(() => localStorage.getItem('portal_theme') || 'dark');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('portal_accent') || 'indigo');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portal_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor);
    localStorage.setItem('portal_accent', accentColor);
  }, [accentColor]);

  // Switch default tab when role switches
  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    if (newRole === 'faculty') {
      setActiveTab('faculty_workspace');
    } else if (newRole === 'admin') {
      setActiveTab('admin_console');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Initial load
  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    try {
      const allStd = await erpApi.getStudents();
      setStudentsList(allStd);
      
      // If Jebarson exists, default or pick first
      const defaultStd = allStd.find(s => s.full_name?.toLowerCase().includes('jebarson')) || allStd[0];
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
        erpApi.getAttendance()
      ]);
      setDashboardData(dash);
      setAttendanceList(att);
    } catch (err) {
      console.error('API connection error:', err);
      setApiError('Unable to connect to Django API server. Please ensure backend is running at http://127.0.0.1:8000');
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

  const tabTitles = {
    dashboard: 'Academic Dashboard',
    attendance: 'Attendance Register & Eligibility Forecast',
    timetable: 'Academic Timetable & Schedule',
    exams: 'Office of the Controller of Examinations',
    fees: 'Student Accounts & Bursar Fee Ledger',
    assignments: 'Continuous Internal Assessment (CIA)',
    leaves: 'Academic Leave & Duty Leave (OD) Portal',
    faculty_workspace: 'Faculty Teaching & Evaluation Console',
    admin_console: 'Office of the Registrar: Academic Administration',
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        currentRole={currentRole}
        setCurrentRole={handleRoleChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenIdCard={() => setShowIdCard(true)}
        student={dashboardData?.student}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <TopNavbar
          currentRole={currentRole}
          setCurrentRole={handleRoleChange}
          student={dashboardData?.student}
          onRefresh={() => loadStudentData(selectedStudentId)}
          isRefreshing={isRefreshing}
          activeTabName={tabTitles[activeTab] || 'CampusPulse ERP'}
          allStudents={studentsList}
          selectedStudentId={selectedStudentId}
          onSelectStudentId={handleSelectStudent}
          theme={theme}
          setTheme={setTheme}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
        />

        <div className="page-body">
          {apiError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '14px 20px',
              color: '#fca5a5',
              fontSize: '0.88rem'
            }}>
              <strong>Server Alert:</strong> {apiError}
            </div>
          )}

          {/* Student Views */}
          {activeTab === 'dashboard' && (
            <DashboardView
              dashboardData={dashboardData}
              setActiveTab={setActiveTab}
              onPayFeeClick={() => setActiveTab('fees')}
              onSubmitAssignmentClick={() => setActiveTab('assignments')}
              onSimulateAttendance={handleSimulateAttendance}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              attendanceList={attendanceList}
              onRefresh={() => loadStudentData(selectedStudentId)}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetableView />
          )}

          {activeTab === 'exams' && (
            <ExamsView student={dashboardData?.student} />
          )}

          {activeTab === 'fees' && (
            <FeesView onRefreshParent={() => loadStudentData(selectedStudentId)} />
          )}

          {activeTab === 'assignments' && (
            <AssignmentsView onRefreshParent={() => loadStudentData(selectedStudentId)} />
          )}

          {activeTab === 'leaves' && (
            <LeavesView />
          )}

          {/* Faculty View */}
          {activeTab === 'faculty_workspace' && (
            <FacultyPortalView onDataChanged={handleDataChanged} />
          )}

          {/* Admin View */}
          {activeTab === 'admin_console' && (
            <AdminPortalView onDataChanged={handleDataChanged} />
          )}
        </div>
      </main>

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
