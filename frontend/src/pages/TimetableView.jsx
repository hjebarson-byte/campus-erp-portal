import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin, User, BookOpen } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <CalendarDays size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Weekly Class Timetable</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Semester 5 • Computer Science & Engineering (Section A)
          </p>
        </div>

        {/* Day selector tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`btn ${selectedDay === day ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading timetable...
        </div>
      ) : schedule.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {schedule.map((slot, idx) => (
            <div key={slot.id || idx} className="card" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              padding: '20px 24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#a5b4fc',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Clock size={16} />
                  <span>{slot.start_time.substring(0, 5)} – {slot.end_time.substring(0, 5)}</span>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-primary">{slot.course_code}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Slot #{idx + 1}</span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>
                    {slot.course_name}
                  </h4>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <User size={15} color="var(--primary)" />
                  <span>{slot.faculty_name}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#67e8f9', fontSize: '0.85rem', background: 'rgba(6, 182, 212, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                  <MapPin size={15} />
                  <strong>{slot.room_number}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No lectures scheduled for {selectedDay}.
        </div>
      )}
    </div>
  );
}
