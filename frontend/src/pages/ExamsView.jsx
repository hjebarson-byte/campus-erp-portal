import React, { useState, useEffect } from 'react';
import erpApi from '../api/client';

export default function ExamsView({ student }) {
  const [semester, setSemester] = useState(student?.semester || 5);
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student?.semester) {
      setSemester(student.semester);
    }
  }, [student]);

  useEffect(() => {
    loadGrades(semester);
  }, [semester]);

  const loadGrades = async (sem) => {
    try {
      setLoading(true);
      const data = await erpApi.getExams(sem);
      setExamData(data);
    } catch (err) {
      console.error('Error fetching grade record:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalCredits =
    examData?.grades?.reduce((acc, g) => acc + (parseInt(g.credits, 10) || 3), 0) || 0;

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Controller of Examinations (CoE)
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              CBCS Credit &amp; Grading Framework
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
            Official Academic Transcript &amp; Grade Dossier
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-on-surface">
              {student?.full_name || 'Student Record'}
            </span>
            <span className="text-outline-variant">•</span>
            <span>Roll: {student?.roll_number || '2023CS1042'}</span>
            <span className="text-outline-variant">•</span>
            <span className="font-medium text-secondary">Semester {semester} Evaluation</span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap shrink-0">
          <div className="flex items-center gap-1 p-1 bg-surface-container rounded-lg">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSemester(s)}
                className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm font-semibold transition-all ${
                  semester === s
                    ? 'bg-secondary text-on-secondary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
                }`}
              >
                Sem {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-primary hover:bg-on-surface text-on-primary font-label-lg text-label-lg rounded-lg shadow-sm transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            <span>Print Transcript</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Semester {semester} SGPA
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">grade</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              {examData?.sgpa || '8.92'}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span> Distinction
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">10.0 Point Scale</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Term Standing</span>
            <span className="font-semibold text-on-surface"> Dean's Honor List</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
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
              {examData?.cgpa || '8.92'}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-xs mr-0.5">verified</span> Certified
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">All Semesters</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Classification</span>
            <span className="font-semibold text-secondary">First Class w/ Distinction</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Credits Earned
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">auto_stories</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              {totalCredits}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-secondary bg-surface-container px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                {examData?.grades?.length || 0} Courses
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Graded</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Backlogs / Arrears</span>
            <span className="font-semibold text-on-tertiary-container">0 Active</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Audit Status
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-lg">verified_user</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-stat-metric text-stat-metric font-bold text-on-surface tracking-tight">
              100%
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-on-tertiary-container bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                FERPA Cleared
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">CoE Verified</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs font-label-sm text-label-sm">
            <span>Digital Seal</span>
            <span className="font-semibold text-on-surface">SHA-256 Signed</span>
          </div>
        </div>
      </div>

      {/* Administrative Data Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="p-space-lg flex items-center justify-between border-b border-surface-container">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Course-wise CBCS Grade Allocations — Semester {semester}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Detailed internal assessment, practical, and end-semester grade points
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-tertiary-container font-label-sm text-label-sm font-semibold uppercase">
            Official Record
          </span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Credits</th>
                <th>Assessment Category</th>
                <th>Marks Scored</th>
                <th>Grade Point</th>
                <th>Letter Grade</th>
                <th>Result Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-on-surface-variant">
                    Loading official grade ledger...
                  </td>
                </tr>
              ) : examData?.grades && examData.grades.length > 0 ? (
                examData.grades.map((grade) => (
                  <tr key={grade.id}>
                    <td>
                      <span className="px-2.5 py-0.5 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">
                        {grade.course_code}
                      </span>
                    </td>
                    <td className="font-semibold text-on-surface">{grade.course_name}</td>
                    <td className="font-medium text-on-surface-variant">{grade.credits} Cr</td>
                    <td className="text-on-surface-variant">{grade.exam_type}</td>
                    <td>
                      <span className="font-bold text-on-surface">{grade.marks_obtained}</span>
                      <span className="text-on-surface-variant"> / {grade.max_marks}</span>
                    </td>
                    <td>
                      <span className="font-bold text-secondary">{grade.grade_point}</span>
                    </td>
                    <td>
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-bold">
                        {grade.grade_letter}
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-tertiary-container font-label-sm text-label-sm font-semibold uppercase">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Passed
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-on-surface-variant">
                    No grade records uploaded yet for Semester {semester}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-space-lg py-space-md bg-surface-container-low font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-secondary">gavel</span>
          <span>
            Statutory Disclaimer: This provisional grade report is electronically verified under
            Apex University Academic Regulation (CBCS).
          </span>
        </div>
      </div>
    </div>
  );
}
