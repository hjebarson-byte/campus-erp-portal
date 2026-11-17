import React, { useState, useEffect } from 'react';
import erpApi from '../api/client';

export default function TimetableView() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedule(selectedDay);
  }, [selectedDay]);

  const fetchSchedule = async (day) => {
    try {
      setLoading(true);
      const data = await erpApi.getTimetable(day);
      setSchedule(data);
    } catch (err) {
      console.error('Error fetching timetable:', err);
    } finally {
      setLoading(false);
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
              Classroom Allocation Matrix
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Fall Semester 2025 • Master Schedule
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
            Academic Timetable &amp; Instructional Roster
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-on-surface">
              Department of Computer Science &amp; Engineering
            </span>
            <span className="text-outline-variant">•</span>
            <span>Semester 5 (Section A)</span>
            <span className="text-outline-variant">•</span>
            <span className="font-medium text-secondary">
              {schedule.length} Scheduled Sessions on {selectedDay}
            </span>
          </p>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center gap-1 p-1.5 bg-surface-container rounded-xl overflow-x-auto shrink-0">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                selectedDay === day
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Matrix */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">schedule</span>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {selectedDay} Instructional Blocks
            </h2>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Standard 60-Minute Credit Contact Hours
          </span>
        </div>

        {loading ? (
          <div className="p-space-xl text-center font-body-md text-on-surface-variant">
            Loading classroom allocation matrix...
          </div>
        ) : schedule.length > 0 ? (
          <div className="flex flex-col gap-space-sm">
            {schedule.map((slot, idx) => (
              <div
                key={slot.id || idx}
                className="p-space-md rounded-xl bg-surface hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-space-md"
              >
                <div className="flex items-center gap-space-md">
                  <div className="px-3.5 py-2 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold text-center leading-tight shrink-0 min-w-[110px]">
                    {slot.start_time.substring(0, 5)} – {slot.end_time.substring(0, 5)}
                    <div className="text-[10px] font-normal opacity-85 uppercase tracking-wider mt-0.5">
                      Slot #{idx + 1}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold uppercase">
                        {slot.course_code}
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">
                        Lecture &amp; Tutorial
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      {slot.course_name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-space-md flex-wrap self-end sm:self-center">
                  <div className="flex items-center gap-1.5 font-body-md text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-base text-secondary">
                      co_present
                    </span>
                    <span className="font-medium text-on-surface">{slot.faculty_name}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-secondary font-label-md text-label-md font-semibold">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    <span>{slot.room_number}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-space-xl text-center font-body-md text-on-surface-variant bg-surface rounded-xl">
            No lectures scheduled for {selectedDay}.
          </div>
        )}
      </div>
    </div>
  );
}
