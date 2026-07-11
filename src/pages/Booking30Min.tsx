import React, { useState, useEffect } from 'react';

const tzOptions = [
  'Asia/Ashgabat GMT +5:00',
  'Asia/Samarkand GMT +5:00',
  'Asia/Tashkent GMT +5:00',
  'Asia/Kolkata GMT +5:30'
];

const rawTimes = [
  '2:30pm', '3:00pm', '3:30pm', '4:00pm', '4:30pm',
  '5:00pm', '5:30pm', '6:00pm', '6:30pm', '7:00pm'
];

export default function Booking30Min() {
  const [activeTimeFormat, setActiveTimeFormat] = useState<'12h' | '24h'>('12h');
  const [selectedDay, setSelectedDay] = useState<number>(11);
  const [selectedTime, setSelectedTime] = useState<string>('2:30pm');
  const [activeTz, setActiveTz] = useState<string>('Asia/Kolkata GMT +5:30');
  const [isOverlayChecked, setIsOverlayChecked] = useState<boolean>(false);
  const [isTzOpen, setIsTzOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  // Form states
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userNotes, setUserNotes] = useState<string>('');

  // Toast states
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  // Trigger Toast Notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Convert 12h representation to 24h
  const convertTo24h = (time12: string) => {
    const pm = time12.endsWith('pm');
    const timeClean = time12.replace('pm', '').replace('am', '');
    const [hrsStr, minsStr] = timeClean.split(':');
    let hrs = parseInt(hrsStr);
    if (pm && hrs !== 12) hrs += 12;
    if (!pm && hrs === 12) hrs = 0;
    return `${hrs.toString().padStart(2, '0')}:${minsStr}`;
  };

  // Get weekday header text for selected July day (start Wednesday offset = 3)
  const getWeekdayLabel = (day: number) => {
    const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const index = (day + 3 - 1) % 7;
    return `${daysArr[index]} ${day}`;
  };

  // Date selection click handler
  const handleDateSelect = (day: number) => {
    setSelectedDay(day);
    triggerToast(`Selected date: July ${day}, 2026`);
  };

  // Time Slot Selection Click Handler
  const handleTimeSlotSelect = (timeStr: string) => {
    setSelectedTime(timeStr);
    
    // Reset form
    setUserName('');
    setUserEmail('');
    setUserNotes('');
    setIsSuccess(false);
    setIsModalOpen(true);
  };

  // Submit Booking Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    triggerToast("Booking request submitted!");
  };

  // Generate July 2026 Days grid (Wed start = 3 empty cells offset)
  const renderCalendarDays = () => {
    const daysList: (number | null)[] = [];
    // 3 offset cells
    for (let i = 0; i < 3; i++) {
      daysList.push(null);
    }
    // 31 days of July
    for (let i = 1; i <= 31; i++) {
      daysList.push(i);
    }

    return daysList.map((day, idx) => {
      if (day === null) {
        return <div key={`empty-${idx}`} className="day-cell empty"></div>;
      }

      const isSelected = day === selectedDay;
      return (
        <button
          key={`day-${day}`}
          className={`day-cell ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateSelect(day)}
        >
          {day}
          {isSelected && <span className="day-dot"></span>}
        </button>
      );
    });
  };

  return (
    <div className="booking-page-container">
      {/* Top Control Bar */}
      <div className="top-bar">
        <div 
          className="toggle-container" 
          onClick={() => {
            const nextVal = !isOverlayChecked;
            setIsOverlayChecked(nextVal);
            triggerToast(nextVal ? "Connected! Syncing overlay with your calendar" : "Calendar overlay removed");
          }}
        >
          <span className="toggle-label">Overlay my calendar</span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={isOverlayChecked}
              onChange={() => {}} // Controlled by container click
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="top-icons">
          <button class="icon-btn" title="Calendar list view">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
          <button class="icon-btn active" title="Grid View">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
          <button class="icon-btn" title="Side-by-side View">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Booking Card */}
      <div className="booking-card">
        
        {/* Column 1: Details */}
        <div className="details-col">
          <div className="logo-container">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>

          <span className="brand-name">Flutter your Way</span>
          <h2 className="event-title">Let's discuss your app idea.</h2>

          <div className="event-info-block">
            <h4 className="event-subtitle">🚀 Mobile App Strategy Session:</h4>
            <ol className="checklist-list">
              <li>Your app idea and target users</li>
              <li>Technical needs and platform choice</li>
              <li>Timeline and budget discussion</li>
              <li>Next steps</li>
            </ol>
          </div>

          {/* Duration */}
          <div className="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>30m</span>
          </div>

          {/* Location */}
          <div className="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z"></path>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            <span>Google Meet</span>
          </div>

          {/* Timezone Dropdown */}
          <div className="tz-picker">
            <button className="tz-btn" onClick={() => setIsTzOpen(!isTzOpen)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>{activeTz.split(' ')[0]}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div className={`tz-dropdown ${isTzOpen ? 'open' : ''}`}>
              {tzOptions.map(tz => (
                <div 
                  key={tz}
                  className={`tz-option ${tz === activeTz ? 'selected' : ''}`}
                  onClick={() => {
                    setActiveTz(tz);
                    setIsTzOpen(false);
                    triggerToast(`Timezone changed to ${tz.split(' ')[0]}`);
                  }}
                >
                  {tz}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Calendar Grid */}
        <div className="calendar-col">
          <div className="calendar-header">
            <span className="month-title">July 2026</span>
            <div className="nav-arrows">
              <button className="arrow-btn" onClick={() => triggerToast("Viewing past calendar periods is locked to July 2026")}>&lt;</button>
              <button className="arrow-btn" onClick={() => triggerToast("Viewing future calendar periods is locked to July 2026")}>&gt;</button>
            </div>
          </div>

          <div className="calendar-grid">
            <span className="weekday-header">Sun</span>
            <span class="weekday-header">Mon</span>
            <span class="weekday-header">Tue</span>
            <span class="weekday-header">Wed</span>
            <span class="weekday-header">Thu</span>
            <span class="weekday-header">Fri</span>
            <span class="weekday-header">Sat</span>

            {renderCalendarDays()}
          </div>
        </div>

        {/* Column 3: Time Slots */}
        <div className="slots-col">
          <div className="slots-header">
            <span className="selected-date-label">{getWeekdayLabel(selectedDay)}</span>
            <div className="format-toggle">
              <button 
                className={`format-btn ${activeTimeFormat === '12h' ? 'active' : ''}`}
                onClick={() => setActiveTimeFormat('12h')}
              >
                12h
              </button>
              <button 
                className={`format-btn ${activeTimeFormat === '24h' ? 'active' : ''}`}
                onClick={() => setActiveTimeFormat('24h')}
              >
                24h
              </button>
            </div>
          </div>

          <div className="slots-container">
            {rawTimes.map(time => {
              const displayTime = activeTimeFormat === '12h' ? time : convertTo24h(time);
              return (
                <button
                  key={time}
                  className="slot-btn"
                  onClick={() => handleTimeSlotSelect(displayTime)}
                >
                  {displayTime}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Booking Form Modal */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
        <div className="modal-card">
          <div className="modal-header">
            <h3 className="modal-title">Confirm Booking</h3>
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
          </div>

          {!isSuccess ? (
            <div className="modal-body">
              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="userName">Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    id="userName" 
                    placeholder="Your Name" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="userEmail">Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    id="userEmail" 
                    placeholder="yourname@example.com" 
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="userNotes">Additional Notes</label>
                  <textarea 
                    className="form-input" 
                    id="userNotes" 
                    rows={3} 
                    placeholder="Tell us about your app concept..."
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                  ></textarea>
                </div>
                <div className="form-group" style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  📅 Date: <strong style={{ color: 'var(--text-primary)' }}>July {selectedDay}, 2026</strong><br />
                  ⏰ Time: <strong style={{ color: 'var(--text-primary)' }}>{selectedTime}</strong>
                </div>
                
                <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Confirm Slot</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="success-panel" style={{ display: 'block' }}>
              <div className="success-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h3 className="success-title">Meeting Confirmed!</h3>
              <p className="success-desc">
                We've sent a calendar invitation and Google Meet connection details to <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{userEmail}</span>.
              </p>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(false)} style={{ width: '100%' }}>Done</button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <svg className="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{toastMessage}</span>
      </div>

      <style>{`
        :root {
          --bg-color: #0c0c0d;
          --card-bg: #18181b;
          --border-color: #27272a;
          --text-primary: #ffffff;
          --text-secondary: #a1a1aa;
          --accent-blue: #3b66f5;
          --accent-blue-hover: #2a52d8;
          --font-sans: 'Plus Jakarta Sans', sans-serif;
        }

        .booking-page-container {
          background-color: var(--bg-color);
          color: var(--text-primary);
          min-height: calc(100vh - 80px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 40px 20px;
        }

        /* Top Control Bar */
        .top-bar {
          width: 100%;
          max-width: 1060px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 20px;
          padding: 0 10px;
          margin-bottom: 10px;
        }

        .toggle-container {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .toggle-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          user-select: none;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 36px;
          height: 20px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #3f3f46;
          transition: .3s;
          border-radius: 20px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: var(--accent-blue);
        }

        input:checked + .slider:before {
          transform: translateX(16px);
        }

        .top-icons {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-btn {
          background: none;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .icon-btn:hover, .icon-btn.active {
          border-color: #52525b;
          color: var(--text-primary);
          background-color: rgba(255, 255, 255, 0.05);
        }

        /* Main Booking Card */
        .booking-card {
          width: 100%;
          max-width: 1060px;
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          display: grid;
          grid-template-columns: 320px 1fr 280px;
          min-height: 560px;
          overflow: hidden;
        }

        /* Column 1: Event Details */
        .details-col {
          padding: 32px;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          overflow-y: auto;
        }

        .logo-container {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .logo-container svg {
          width: 24px;
          height: 24px;
          color: var(--accent-blue);
        }

        .brand-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .event-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          margin-top: 8px;
          margin-bottom: 20px;
          line-height: 1.3;
        }

        .event-info-block {
          margin-bottom: 24px;
        }

        .event-subtitle {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .checklist-list {
          list-style-type: decimal;
          padding-left: 18px;
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .checklist-list li {
          margin-bottom: 6px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .meta-item svg {
          width: 16px;
          height: 16px;
          color: var(--text-secondary);
        }

        /* Timezone Picker Dropdown */
        .tz-picker {
          position: relative;
          margin-top: 8px;
        }

        .tz-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          padding: 4px 0;
          transition: color 0.2s;
        }

        .tz-btn:hover {
          color: var(--text-primary);
        }

        .tz-dropdown {
          position: absolute;
          bottom: 100%;
          left: 0;
          margin-bottom: 8px;
          background-color: #1e1e24;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          width: 240px;
          max-height: 180px;
          overflow-y: auto;
          z-index: 100;
          display: none;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .tz-dropdown.open {
          display: block;
        }

        .tz-option {
          padding: 10px 14px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: background-color 0.15s, color 0.15s;
          text-align: left;
        }

        .tz-option:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .tz-option.selected {
          background-color: rgba(59, 102, 245, 0.15);
          color: var(--text-primary);
          font-weight: 600;
        }

        /* Column 2: Calendar */
        .calendar-col {
          padding: 32px;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .month-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .nav-arrows {
          display: flex;
          gap: 8px;
        }

        .arrow-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .arrow-btn:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }

        .weekday-header {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-secondary);
          text-align: center;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .day-cell {
          aspect-ratio: 1;
          border: none;
          background-color: #202024;
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }

        .day-cell:hover:not(.empty) {
          background-color: #27272a;
          transform: scale(1.03);
        }

        .day-cell.empty {
          background: none;
          cursor: default;
        }

        .day-cell.selected {
          background-color: var(--text-primary);
          color: #000000;
          font-weight: 700;
        }

        .day-cell.selected:hover {
          background-color: var(--text-primary);
          color: #000000;
        }

        .day-dot {
          width: 3.5px;
          height: 3.5px;
          background-color: #000000;
          border-radius: 50%;
          margin-top: 2px;
          position: absolute;
          bottom: 6px;
        }

        /* Column 3: Time Slots */
        .slots-col {
          padding: 32px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .slots-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .selected-date-label {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .format-toggle {
          display: flex;
          background-color: #1f1f24;
          border-radius: 6px;
          padding: 2px;
        }

        .format-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .format-btn.active {
          background-color: var(--card-bg);
          color: var(--text-primary);
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }

        .slots-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          max-height: 400px;
          padding-right: 4px;
        }

        /* Custom Scrollbars */
        .slots-container::-webkit-scrollbar, .details-col::-webkit-scrollbar {
          width: 4px;
        }
        .slots-container::-webkit-scrollbar-thumb, .details-col::-webkit-scrollbar-thumb {
          background-color: var(--border-color);
          border-radius: 4px;
        }

        .slot-btn {
          width: 100%;
          background: none;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          padding: 14px;
          font-size: 13.5px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slot-btn:hover {
          border-color: #52525b;
          background-color: rgba(255, 255, 255, 0.04);
        }

        /* Modal Booking Form */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          padding: 20px;
        }

        .modal-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        .modal-card {
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          max-width: 460px;
          width: 100%;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
          overflow: hidden;
          transform: scale(0.95);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-overlay.open .modal-card {
          transform: scale(1);
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }

        .close-btn:hover {
          color: var(--text-primary);
        }

        .modal-body {
          padding: 24px;
          text-align: left;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          background-color: #111113;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          padding: 11px 14px;
          font-family: var(--font-sans);
          font-size: 13.5px;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent-blue);
        }

        .modal-footer {
          padding: 16px 24px 24px;
          display: flex;
          gap: 12px;
        }

        .btn {
          flex: 1;
          padding: 12px;
          border-radius: 6px;
          font-family: var(--font-sans);
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: none;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .btn-secondary:hover {
          border-color: #52525b;
          color: var(--text-primary);
        }

        .btn-primary {
          background-color: var(--text-primary);
          border: 1px solid var(--text-primary);
          color: #000000;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        /* Confirmation */
        .success-panel {
          text-align: center;
          padding: 40px 20px;
          display: none;
        }

        .success-icon-wrapper {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background-color: rgba(16, 185, 129, 0.1);
          color: #10b981;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .success-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .success-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 24px;
        }

        /* Toast */
        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background-color: #18181b;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 14px 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 2000;
          transform: translateY(120px);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }

        .toast.show {
          transform: translateY(0);
        }

        .toast-icon {
          color: #10b981;
        }

        /* Media Queries */
        @media (max-width: 960px) {
          .booking-card {
            grid-template-columns: 1fr 1fr;
          }
          .slots-col {
            grid-column: span 2;
            border-top: 1px solid var(--border-color);
            max-height: 360px;
          }
        }

        @media (max-width: 660px) {
          .booking-card {
            grid-template-columns: 1fr;
          }
          .details-col {
            border-right: none;
            border-bottom: 1px solid var(--border-color);
          }
          .calendar-col {
            border-right: none;
            border-bottom: 1px solid var(--border-color);
          }
          .slots-col {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}
