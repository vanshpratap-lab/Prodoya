import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const WEEK_UPPER = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const WEEK_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const TZ_OPTIONS = [
  'Asia/Ashgabat GMT +5:00',
  'Asia/Samarkand GMT +5:00',
  'Asia/Tashkent GMT +5:00',
  'Asia/Kolkata GMT +5:30',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDOW(y: number, m: number)    { return new Date(y, m, 1).getDay(); }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function isToday(d: Date) { return sameDay(d, new Date()); }
function isPastDay(d: Date) {
  const t = new Date(); t.setHours(0, 0, 0, 0); return d < t;
}

function fmt24(h: number, m: number) {
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
function fmt12(h: number, m: number) {
  const p = h < 12 ? 'am' : 'pm';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2,'0')}${p}`;
}
function fmtSlot(slot: string, tf: '12h'|'24h') {
  if (tf === '24h') return slot;
  const [h, m] = slot.split(':').map(Number);
  return fmt12(h, m);
}

const ALL_SLOTS: string[] = [];
for (let h = 0; h < 24; h++)
  for (const m of [0, 30])
    ALL_SLOTS.push(fmt24(h, m));

function getSlotsForDay(d: Date): string[] {
  if (isPastDay(d)) return [];
  if (!isToday(d)) return ALL_SLOTS;
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  return ALL_SLOTS.filter(s => {
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m > mins + 30;
  });
}

function getWeekDays(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
function getWeekLabel(days: Date[]) {
  const f = days[0], l = days[6];
  const fM = MONTH_NAMES[f.getMonth()].slice(0, 3);
  if (f.getMonth() === l.getMonth())
    return `${fM} ${f.getDate()}-${l.getDate()}, ${f.getFullYear()}`;
  return `${fM} ${f.getDate()} - ${MONTH_NAMES[l.getMonth()].slice(0,3)} ${l.getDate()}, ${l.getFullYear()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
type ViewMode = 'calendar' | 'week' | 'timeline';

interface BookingSlot { day: Date; time: string; }

export default function Booking30Min() {
  const todayClean = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
  const today = todayClean();

  // Calendar state
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected,  setSelected]  = useState<Date>(today);
  const [calAnimDir, setCalAnimDir] = useState<'left'|'right'|null>(null);

  // View mode (3 icons top right)
  const [viewMode,    setViewMode]    = useState<ViewMode>('calendar');
  const [viewAnimKey, setViewAnimKey] = useState(0);

  // Week view (for week/timeline modes)
  const [weekStart,     setWeekStart]     = useState<Date>(today);
  const [weekAnimDir,   setWeekAnimDir]   = useState<'left'|'right'|null>(null);
  const [isAnimating,   setIsAnimating]   = useState(false);
  const [selWeekDay,    setSelWeekDay]    = useState<number>(-1); // index 0-6 of selected col

  // Options
  const [timeFormat, setTimeFormat] = useState<'12h'|'24h'>('24h');
  const [overlayOn,  setOverlayOn]  = useState(false);
  const [activeTz,   setActiveTz]   = useState('Asia/Kolkata GMT +5:30');
  const [tzOpen,     setTzOpen]     = useState(false);

  // Live clock (for current-time line + slot filtering)
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Timeline scroll ref
  const tlRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (viewMode === 'timeline' && tlRef.current) {
      const px = now.getHours() * 60 + (now.getMinutes() / 60) * 60;
      tlRef.current.scrollTop = Math.max(0, px - 200);
    }
  }, [viewMode]);

  // Modal
  const [slot,      setSlot]     = useState<BookingSlot|null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uName,     setUName]    = useState('');
  const [uEmail,    setUEmail]   = useState('');
  const [uNotes,    setUNotes]   = useState('');

  // Toast
  const [toastMsg,  setToastMsg]  = useState('');
  const [showToast, setShowToast] = useState(false);
  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(t);
  }, [showToast]);
  const toast = useCallback((msg: string) => { setToastMsg(msg); setShowToast(true); }, []);

  // Close tz on outside click
  useEffect(() => {
    const h = () => setTzOpen(false);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, []);

  // ── Calendar month navigation
  const prevMonth = () => {
    setCalAnimDir('left');
    setTimeout(() => {
      if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
      else setViewMonth(m => m - 1);
      setCalAnimDir(null);
    }, 220);
  };
  const nextMonth = () => {
    setCalAnimDir('right');
    setTimeout(() => {
      if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
      else setViewMonth(m => m + 1);
      setCalAnimDir(null);
    }, 220);
  };

  // ── Week navigation
  const navigateWeek = (dir: 'left'|'right') => {
    if (isAnimating) return;
    setWeekStart(prev => addDays(prev, dir === 'right' ? 7 : -7));
    setWeekAnimDir(dir); setIsAnimating(true);
    setTimeout(() => { setWeekAnimDir(null); setIsAnimating(false); }, 360);
  };

  const goToToday = () => {
    setWeekStart(today);
    setWeekAnimDir('right'); setIsAnimating(true);
    setTimeout(() => { setWeekAnimDir(null); setIsAnimating(false); }, 360);
    toast('Jumped to today');
  };

  // ── Switch view mode
  const switchView = (mode: ViewMode) => {
    if (mode === viewMode) return;
    setViewMode(mode);
    setViewAnimKey(k => k + 1);
    toast(mode === 'calendar' ? 'Month calendar view' : mode === 'week' ? 'Week slot view' : 'Timeline view');
  };

  // ── Open slot modal
  const openSlot = (day: Date, time: string) => {
    setSlot({ day, time });
    setUName(''); setUEmail(''); setUNotes('');
    setIsSuccess(false);
    setModalOpen(true);
  };

  // Computed
  const daysInMonth  = getDaysInMonth(viewYear, viewMonth);
  const firstOffset  = getFirstDOW(viewYear, viewMonth);
  const selectedSlots = getSlotsForDay(selected);
  const weekDays     = getWeekDays(weekStart);
  const weekLabel    = getWeekLabel(weekDays);
  const nowPx        = now.getHours() * 60 + (now.getMinutes() / 60) * 60;

  // Day header for slots panel
  const selectedDayLabel = `${WEEK_SHORT[selected.getDay()]} ${selected.getDate()}`;

  return (
    <div className="bk-root" onClick={() => setTzOpen(false)}>

      {/* ══ LEFT: Info Panel ══════════════════════════════════════════════════ */}
      <aside className="bk-info">
        {/* Flutter logo */}
        <div className="bk-logo">
          <svg viewBox="0 0 48 48" width="34" height="34">
            <circle cx="24" cy="24" r="24" fill="#fff"/>
            <path d="M13 28.5L20.5 21L28 28.5L24.5 32L17 24.5Z" fill="#54C5F8"/>
            <path d="M13 19.5L24.5 8H31.5L17 22.5Z" fill="#01579B"/>
            <path d="M17 22.5L24.5 30H31.5L24 22.5L31.5 15H24.5Z" fill="#29B6F6"/>
            <path d="M24.5 30L28 33.5L31.5 30L28 26.5Z" fill="#0288D1"/>
          </svg>
        </div>

        <p className="bk-brand">Flutter your Way</p>
        <h2 className="bk-event-title">Let's discuss your app idea.</h2>

        <div className="bk-section">
          <p className="bk-sect-lbl">🚀 Mobile App Strategy Session:</p>
          <ol className="bk-ol">
            <li>Your app, Website, CRAZY SOFTWARE idea and target users</li>
            <li>Technical needs and platform choice</li>
            <li>Timeline and budget discussion</li>
            <li>Next steps</li>
          </ol>
        </div>

        <div className="bk-meta-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>30m</span>
        </div>

        <div className="bk-meta-row">
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path d="M29 23.5L37 17V31L29 24.5V23.5Z" fill="#00832D"/>
            <rect x="5" y="14" width="24" height="20" rx="3" fill="#0066DA"/>
            <path d="M5 27h24v4a3 3 0 01-3 3H8a3 3 0 01-3-3v-4Z" fill="#E94235"/>
            <path d="M5 17a3 3 0 013-3h18a3 3 0 013 3v4H5v-4Z" fill="#2684FC"/>
            <path d="M5 21h24v6H5z" fill="#0066DA"/>
          </svg>
          <span>Google Meet</span>
        </div>

        {/* Timezone */}
        <div className="bk-tz-wrap" onClick={e => e.stopPropagation()}>
          <button className="bk-tz-btn" onClick={() => setTzOpen(v => !v)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
            </svg>
            <span>{activeTz.split(' ')[0]}</span>
            <svg className={`bk-caret${tzOpen ? ' open' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div className={`bk-tz-drop${tzOpen ? ' open' : ''}`}>
            {TZ_OPTIONS.map(tz => (
              <div key={tz} className={`bk-tz-opt${tz === activeTz ? ' sel' : ''}`}
                onClick={() => { setActiveTz(tz); setTzOpen(false); toast(`TZ: ${tz.split(' ')[0]}`); }}>
                {tz}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ══ RIGHT: Main Area ══════════════════════════════════════════════════ */}
      <div className="bk-right">

        {/* TOP BAR */}
        <div className="bk-topbar">
          {/* Week nav (visible in week/timeline modes) */}
          {viewMode !== 'calendar' && (
            <div className="bk-week-nav">
              <span className="bk-week-lbl">{weekLabel}</span>
              <button className="bk-nav-arr" onClick={() => navigateWeek('left')} disabled={isAnimating}>‹</button>
              <button className="bk-nav-arr" onClick={() => navigateWeek('right')} disabled={isAnimating}>›</button>
              <button className="bk-today-pill" onClick={goToToday}>Today</button>
            </div>
          )}
          <div className="bk-topbar-spacer" />



          {/* 3 View icons */}
          <div className="bk-view-grp">
            {/* Calendar icon → calendar view */}
            <button
              className={`bk-vbtn${viewMode === 'calendar' ? ' act' : ''}`}
              title="Calendar view"
              onClick={() => switchView('calendar')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </button>
            {/* Grid icon → week slots */}
            <button
              className={`bk-vbtn${viewMode === 'week' ? ' act' : ''}`}
              title="Week slot view"
              onClick={() => switchView('week')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            {/* Columns icon → timeline */}
            <button
              className={`bk-vbtn${viewMode === 'timeline' ? ' act' : ''}`}
              title="Timeline view"
              onClick={() => switchView('timeline')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
                <line x1="15" y1="3" x2="15" y2="21"/>
              </svg>
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div key={viewAnimKey} className="bk-content bk-content-in">

          {/* ─── VIEW 1: CALENDAR + SLOTS ─────────────────────────────── */}
          {viewMode === 'calendar' && (
            <div className="bk-cal-layout">

              {/* Month Calendar */}
              <div className="bk-cal-panel">
                <div className="bk-cal-hdr">
                  <span className="bk-month-lbl">
                    {MONTH_NAMES[viewMonth]} <span className="bk-year">{viewYear}</span>
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="bk-month-nav" onClick={prevMonth}>‹</button>
                    <button className="bk-month-nav" onClick={nextMonth}>›</button>
                  </div>
                </div>

                <div className={`bk-cal-grid${calAnimDir ? ` cal-anim-${calAnimDir}` : ''}`}>
                  {/* Weekday headers */}
                  {WEEK_UPPER.map(d => <div key={d} className="bk-wday-hdr">{d}</div>)}

                  {/* Blank offset */}
                  {Array.from({ length: firstOffset }).map((_, i) => <div key={`b${i}`} />)}

                  {/* Days */}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const d = new Date(viewYear, viewMonth, day);
                    d.setHours(0, 0, 0, 0);
                    const isTod  = isToday(d);
                    const isSel  = sameDay(d, selected);
                    const isPast = isPastDay(d);
                    return (
                      <button
                        key={day}
                        className={`bk-day${isTod ? ' tod' : ''}${isSel ? ' sel' : ''}${isPast && !isTod ? ' past' : ''}`}
                        onClick={() => {
                          if (!isPast || isTod) {
                            setSelected(d);
                            toast(`${WEEK_SHORT[d.getDay()]} ${MONTH_NAMES[viewMonth].slice(0,3)} ${day}`);
                          }
                        }}
                        disabled={isPast && !isTod}
                      >
                        {day}
                        {isSel && <span className="bk-day-dot" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Slots */}
              <div className="bk-slots-panel">
                <div className="bk-slots-hdr">
                  <span className="bk-slots-date">{selectedDayLabel}</span>
                  <div className="bk-fmt-grp">
                    <button className={`bk-fmt${timeFormat === '12h' ? ' act' : ''}`} onClick={() => { setTimeFormat('12h'); toast('12h format'); }}>12h</button>
                    <button className={`bk-fmt${timeFormat === '24h' ? ' act' : ''}`} onClick={() => { setTimeFormat('24h'); toast('24h format'); }}>24h</button>
                  </div>
                </div>
                <div className="bk-slots-list">
                  {selectedSlots.length === 0
                    ? <div className="bk-no-slots">No available slots</div>
                    : selectedSlots.map((s, i) => (
                      <button key={s} className="bk-slot" style={{ '--i': i } as React.CSSProperties}
                        onClick={() => openSlot(selected, fmtSlot(s, timeFormat))}>
                        {fmtSlot(s, timeFormat)}
                      </button>
                    ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* ─── VIEW 2: WEEK SLOT GRID ──────────────────────────────── */}
          {viewMode === 'week' && (
            <div className={`bk-week-wrap${weekAnimDir ? ` wanim-${weekAnimDir}` : ''}`}>
              {/* Column headers */}
              <div className="bk-wcol-hdrs">
                {weekDays.map((d, i) => {
                  const isTod = isToday(d);
                  const isSel = i === selWeekDay;
                  return (
                    <div key={i}
                      className={`bk-wcol-hdr${isTod ? ' tod' : ''}${isSel ? ' sel-col' : ''}`}
                      onClick={() => { setSelWeekDay(i); toast(`${WEEK_SHORT[d.getDay()]} ${d.getDate()}`); }}
                    >
                      <span className="bk-wday-lbl">{WEEK_UPPER[d.getDay()]}</span>
                      <span className={`bk-wday-num${isTod ? ' tod-circle' : ''}`}>{String(d.getDate()).padStart(2,'0')}</span>
                    </div>
                  );
                })}
              </div>

              {/* 12h/24h in week mode */}
              <div className="bk-week-fmt-row">
                <button className={`bk-fmt${timeFormat === '12h' ? ' act' : ''}`} onClick={() => { setTimeFormat('12h'); toast('12h format'); }}>12h</button>
                <button className={`bk-fmt${timeFormat === '24h' ? ' act' : ''}`} onClick={() => { setTimeFormat('24h'); toast('24h format'); }}>24h</button>
              </div>

              {/* Slot columns */}
              <div className="bk-week-grid">
                {weekDays.map((d, ci) => {
                  const slots = getSlotsForDay(d);
                  return (
                    <div key={ci} className="bk-wcol">
                      {slots.length === 0
                        ? <div className="bk-no-slots">—</div>
                        : slots.map((s, si) => (
                          <button key={s} className="bk-wslot" style={{ '--i': si } as React.CSSProperties}
                            onClick={() => openSlot(d, fmtSlot(s, timeFormat))}>
                            {fmtSlot(s, timeFormat)}
                          </button>
                        ))
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── VIEW 3: TIMELINE ─────────────────────────────────────── */}
          {viewMode === 'timeline' && (
            <div className={`bk-tl-wrap${weekAnimDir ? ` wanim-${weekAnimDir}` : ''}`}>
              {/* Column headers */}
              <div className="bk-tl-hdrs">
                <div className="bk-tl-gutter-head" />
                {weekDays.map((d, i) => {
                  const isTod = isToday(d);
                  const isSel = i === selWeekDay;
                  return (
                    <div key={i}
                      className={`bk-wcol-hdr${isTod ? ' tod' : ''}${isSel ? ' sel-col' : ''}`}
                      onClick={() => { setSelWeekDay(i); toast(`${WEEK_SHORT[d.getDay()]} ${d.getDate()}`); }}
                    >
                      <span className="bk-wday-lbl">{WEEK_UPPER[d.getDay()]}</span>
                      <span className={`bk-wday-num${isTod ? ' tod-circle' : ''}`}>{String(d.getDate()).padStart(2,'0')}</span>
                    </div>
                  );
                })}
              </div>

              {/* Scrollable timeline */}
              <div className="bk-tl-scroll" ref={tlRef}>
                <div className="bk-tl-inner">
                  {/* Time gutter */}
                  <div className="bk-tl-gutter">
                    {Array.from({ length: 24 }, (_, h) => (
                      <div key={h} className={`bk-hr-lbl${h === now.getHours() && weekDays.some(d => isToday(d)) ? ' now-hr' : ''}`}>
                        {String(h).padStart(2,'0')}:00
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {weekDays.map((d, ci) => {
                    const isTod  = isToday(d);
                    const isPast = isPastDay(d);
                    return (
                      <div key={ci} className={`bk-tl-col${isTod ? ' tod' : ''}${isPast ? ' past' : ''}`}>
                        {Array.from({ length: 24 }, (_, h) => {
                          const pastHr = isTod && h < now.getHours();
                          return (
                            <div key={h} className={`bk-hr-cell${pastHr ? ' past-hr' : ''}`}
                              onClick={() => {
                                if (!isPast && !pastHr) {
                                  const s = fmt24(h, 0);
                                  openSlot(d, fmtSlot(s, timeFormat));
                                }
                              }}
                            />
                          );
                        })}
                        {/* Current time line */}
                        {isTod && (
                          <div className="bk-now-line" style={{ top: `${nowPx}px` }}>
                            <div className="bk-now-dot" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>{/* end .bk-content */}
      </div>{/* end .bk-right */}

      {/* ══ MODAL ══════════════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="bk-modal-bg" onClick={() => setModalOpen(false)}>
          <div className="bk-modal" onClick={e => e.stopPropagation()}>
            <div className="bk-modal-hd">
              <span className="bk-modal-ttl">Confirm Booking</span>
              <button className="bk-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            {!isSuccess ? (
              <form className="bk-modal-body" onSubmit={e => { e.preventDefault(); setIsSuccess(true); toast('Booking confirmed! 🎉'); }}>
                <label className="bk-lbl">Name
                  <input className="bk-inp" type="text" placeholder="Your name" value={uName} onChange={e => setUName(e.target.value)} required />
                </label>
                <label className="bk-lbl">Email
                  <input className="bk-inp" type="email" placeholder="you@example.com" value={uEmail} onChange={e => setUEmail(e.target.value)} required />
                </label>
                <label className="bk-lbl">Notes (optional)
                  <textarea className="bk-inp" rows={3} placeholder="Tell us about your app idea…" value={uNotes} onChange={e => setUNotes(e.target.value)} />
                </label>
                {slot && (
                  <p className="bk-slot-info">
                    📅 {MONTH_NAMES[slot.day.getMonth()]} {slot.day.getDate()}, {slot.day.getFullYear()} &nbsp;·&nbsp; ⏰ {slot.time}
                  </p>
                )}
                <div className="bk-modal-ft">
                  <button type="button" className="bk-btn-sec" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button type="submit" className="bk-btn-pri">Confirm Slot</button>
                </div>
              </form>
            ) : (
              <div className="bk-success">
                <div className="bk-ok-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3 className="bk-ok-ttl">Meeting Confirmed!</h3>
                <p className="bk-ok-desc">Google Meet invite sent to <strong>{uEmail}</strong>.</p>
                <button className="bk-btn-pri" style={{ width: '100%', marginTop: '10px' }} onClick={() => setModalOpen(false)}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ TOAST ══════════════════════════════════════════════════════════════ */}
      <div className={`bk-toast${showToast ? ' show' : ''}`}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        {toastMsg}
      </div>

      {/* ══ STYLES ═════════════════════════════════════════════════════════════ */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: inherit; cursor: pointer; }

        /* ── Root */
        .bk-root {
          display: flex; width: 100%; height: 100vh; overflow: hidden;
          background: #0c0c0d; color: #e4e4e7;
          font-family: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif;
          animation: bk-fadein .4s ease both;
        }
        @keyframes bk-fadein { from{opacity:0} to{opacity:1} }

        /* ── LEFT info panel */
        .bk-info {
          width: 270px; flex-shrink: 0;
          border-right: 1px solid #1e1e26;
          padding: 22px 18px 20px;
          display: flex; flex-direction: column; gap: 0;
          overflow-y: auto;
          background: #111113;
          animation: bk-slide-in .45s cubic-bezier(.16,1,.3,1) both;
        }
        @keyframes bk-slide-in { from{transform:translateX(-20px);opacity:0} to{transform:translateX(0);opacity:1} }
        .bk-info::-webkit-scrollbar { width: 3px; }
        .bk-info::-webkit-scrollbar-thumb { background:#27272a; border-radius:99px; }

        .bk-logo {
          width: 38px; height: 38px; border-radius: 50%;
          background: #fff; display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,.3);
          transition: transform .3s cubic-bezier(.34,1.56,.64,1);
        }
        .bk-logo:hover { transform: scale(1.1) rotate(5deg); }

        .bk-brand { font-size: 11px; font-weight: 500; color: #71717a; margin-bottom: 5px; }
        .bk-event-title { font-size: 16px; font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 16px; }

        .bk-section { margin-bottom: 16px; }
        .bk-sect-lbl { font-size: 11px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 6px; }
        .bk-ol { list-style: decimal; padding-left: 14px; color: #a1a1aa; font-size: 11.5px; line-height: 1.65; display: flex; flex-direction: column; gap: 2px; }

        .bk-meta-row { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; color: #a1a1aa; margin-bottom: 9px; }

        /* Timezone */
        .bk-tz-wrap { position: relative; margin-top: 2px; }
        .bk-tz-btn { background:none; border:none; color:#a1a1aa; font-size:12px; font-weight:600; display:flex; align-items:center; gap:6px; padding:3px 0; transition:color .18s; }
        .bk-tz-btn:hover { color:#fff; }
        .bk-caret { transition: transform .22s cubic-bezier(.16,1,.3,1); }
        .bk-caret.open { transform: rotate(180deg); }
        .bk-tz-drop {
          position:absolute; top:calc(100% + 5px); left:0;
          background:#1a1a22; border:1px solid #2a2a34; border-radius:8px;
          width:225px; max-height:0; overflow:hidden; z-index:300;
          box-shadow:0 10px 30px rgba(0,0,0,.6);
          transition: max-height .3s cubic-bezier(.16,1,.3,1), opacity .22s;
          opacity:0; pointer-events:none;
        }
        .bk-tz-drop.open { max-height:180px; opacity:1; pointer-events:auto; overflow-y:auto; }
        .bk-tz-opt { padding:9px 13px; font-size:12px; color:#a1a1aa; cursor:pointer; transition:background .15s,color .15s; }
        .bk-tz-opt:hover { background:rgba(255,255,255,.05); color:#fff; }
        .bk-tz-opt.sel { background:rgba(59,102,245,.15); color:#fff; font-weight:700; }

        /* ── Right panel */
        .bk-right {
          flex:1; min-width:0; display:flex; flex-direction:column; overflow:hidden;
          animation: bk-right-in .45s cubic-bezier(.16,1,.3,1) .05s both;
        }
        @keyframes bk-right-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        /* ── Top bar */
        .bk-topbar {
          display:flex; align-items:center; justify-content:flex-end;
          padding: 0 16px; height: 48px;
          border-bottom: 1px solid #1e1e26;
          flex-shrink: 0; gap: 14px;
        }
        .bk-week-nav { display:flex; align-items:center; gap:8px; }
        .bk-week-lbl { font-size:13px; font-weight:700; color:#fff; white-space:nowrap; }
        .bk-topbar-spacer { flex:1; }

        .bk-nav-arr {
          width:24px; height:24px; background:none; border:none;
          color:#71717a; font-size:18px; border-radius:4px;
          display:flex; align-items:center; justify-content:center;
          transition:background .18s, color .18s;
        }
        .bk-nav-arr:hover:not(:disabled) { background:rgba(255,255,255,.06); color:#fff; }
        .bk-nav-arr:disabled { opacity:.3; }
        .bk-today-pill {
          background:none; border:1px solid #3a3a44; color:#e4e4e7;
          font-size:11.5px; font-weight:600; padding:4px 11px; border-radius:5px;
          transition:all .18s;
        }
        .bk-today-pill:hover { border-color:#71717a; color:#fff; background:rgba(255,255,255,.04); }

        /* Overlay */


        /* View icons */
        .bk-view-grp { display:flex; gap:3px; }
        .bk-vbtn {
          width:28px; height:28px; background:none; border:1px solid #27272a; border-radius:6px;
          color:#52525b; display:flex; align-items:center; justify-content:center;
          transition:all .2s;
        }
        .bk-vbtn:hover { border-color:#3f3f46; color:#a1a1aa; background:rgba(255,255,255,.03); }
        .bk-vbtn.act { border-color:#3b66f5; color:#3b66f5; background:rgba(59,102,245,.08); }

        /* 12h/24h */
        .bk-fmt-grp { display:flex; background:#18181e; border:1px solid #27272a; border-radius:6px; padding:2px; }
        .bk-fmt {
          background:none; border:none; color:#52525b;
          font-size:11px; font-weight:700; padding:3px 8px; border-radius:4px;
          transition:all .2s;
        }
        .bk-fmt.act { background:#27272a; color:#fff; }

        /* ── Content wrapper */
        .bk-content { flex:1; overflow-y:auto; display:flex; }
        .bk-content-in { animation: bk-content-in .35s cubic-bezier(.16,1,.3,1) both; }
        @keyframes bk-content-in { from{opacity:0;transform:scale(.98)} to{opacity:1;transform:scale(1)} }

        /* ════ VIEW 1: CALENDAR + SLOTS ══════════════════════════════════════ */
        .bk-cal-layout { display:flex; flex:1; overflow-y:auto; min-height:0; }

        /* Month calendar */
        .bk-cal-panel {
          flex:1; padding:22px 24px; display:flex; flex-direction:column;
          border-right:1px solid #1e1e26; overflow-y:auto;
          scrollbar-width:thin; scrollbar-color:#27272a transparent;
        }
        .bk-cal-panel::-webkit-scrollbar { width:3px; }
        .bk-cal-panel::-webkit-scrollbar-thumb { background:#27272a; border-radius:99px; }
        .bk-cal-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
        .bk-month-lbl { font-size:15px; font-weight:700; color:#fff; }
        .bk-year { color:#71717a; font-weight:500; }
        .bk-month-nav {
          width:24px; height:24px; background:none; border:none; color:#71717a;
          font-size:17px; border-radius:4px;
          display:flex; align-items:center; justify-content:center;
          transition:background .18s,color .18s; line-height:1;
        }
        .bk-month-nav:hover { background:rgba(255,255,255,.06); color:#fff; }

        .bk-cal-grid {
          display:grid; grid-template-columns:repeat(7,1fr);
          gap:6px;
          grid-auto-rows: minmax(72px, auto);
        }
        .bk-cal-grid.cal-anim-right { animation: bk-cal-r .22s ease both; }
        .bk-cal-grid.cal-anim-left  { animation: bk-cal-l .22s ease both; }
        @keyframes bk-cal-r { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes bk-cal-l { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }

        .bk-wday-hdr { font-size:9.5px; font-weight:700; color:#3f3f46; text-align:center; padding-bottom:6px; text-transform:uppercase; }

        .bk-day {
          min-height:72px; background:#1c1c22; border:none; border-radius:8px;
          color:#a1a1aa; font-size:12.5px; font-weight:600;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          position:relative; transition:background .18s, color .18s, transform .18s, box-shadow .18s;
          cursor:pointer; width:100%;
        }
        .bk-day:hover:not(:disabled) { background:#252530; color:#fff; transform:scale(1.06); box-shadow:0 4px 12px rgba(0,0,0,.3); }
        .bk-day:disabled { opacity:.28; cursor:default; }
        .bk-day.past { opacity:.28; }
        .bk-day.tod { background:#1c1c22; border:1px solid #52525b; color:#fff; }
        .bk-day.sel { background:#fff !important; color:#000 !important; font-weight:700; transform:scale(1.05); box-shadow:0 4px 16px rgba(0,0,0,.4); }
        .bk-day-dot { position:absolute; bottom:4px; width:4px; height:4px; border-radius:50%; background:#3b66f5; }
        .bk-day.sel .bk-day-dot { background:#000; }

        /* Slots panel */
        .bk-slots-panel {
          width: 220px; flex-shrink:0;
          display:flex; flex-direction:column;
          padding:18px 12px; overflow:hidden;
        }
        .bk-slots-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; flex-shrink:0; }
        .bk-slots-date { font-size:13px; font-weight:700; color:#fff; }
        .bk-slots-list {
          display:flex; flex-direction:column; gap:7px;
          overflow-y:auto; flex:1;
          scrollbar-width:thin; scrollbar-color:#27272a transparent;
        }
        .bk-slots-list::-webkit-scrollbar { width:3px; }
        .bk-slots-list::-webkit-scrollbar-thumb { background:#27272a; border-radius:99px; }

        .bk-slot {
          width:100%; padding:11px 8px;
          background:#191920; border:1px solid #27272a; border-radius:8px;
          color:#d4d4d8; font-size:12.5px; font-weight:600; text-align:center;
          transition:background .18s, border-color .18s, transform .18s, box-shadow .18s;
          animation: bk-slot-in .32s calc(var(--i)*16ms) cubic-bezier(.16,1,.3,1) both;
        }
        .bk-slot:hover { background:#22222e; border-color:#3f3f46; transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.3); }
        .bk-slot:active { transform:translateY(0); box-shadow:none; }
        @keyframes bk-slot-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .bk-no-slots { text-align:center; padding:24px 0; font-size:13px; color:#3f3f46; }

        /* ════ VIEW 2: WEEK SLOT GRID ═════════════════════════════════════════ */
        .bk-week-wrap {
          flex:1; display:flex; flex-direction:column; overflow:hidden;
        }
        .bk-week-wrap.wanim-right { animation: bk-wanim-r .36s cubic-bezier(.16,1,.3,1) both; }
        .bk-week-wrap.wanim-left  { animation: bk-wanim-l .36s cubic-bezier(.16,1,.3,1) both; }
        @keyframes bk-wanim-r { from{transform:translateX(28px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes bk-wanim-l { from{transform:translateX(-28px);opacity:0} to{transform:translateX(0);opacity:1} }

        .bk-wcol-hdrs { display:grid; grid-template-columns:repeat(7,1fr); border-bottom:2px solid #1e1e26; flex-shrink:0; background:#0f0f12; }
        .bk-wcol-hdr {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:14px 4px 12px; gap:6px;
          border-right:1px solid #1e1e26; cursor:pointer;
          transition: background .18s;
        }
        .bk-wcol-hdr:last-child { border-right:none; }
        .bk-wcol-hdr:hover { background:rgba(255,255,255,.03); }
        .bk-wcol-hdr.tod { background:transparent; }
        .bk-wcol-hdr.sel-col { background:rgba(59,102,245,.06); }
        .bk-wday-lbl {
          font-size:10px; font-weight:800; color:#3f3f46;
          text-transform:uppercase; letter-spacing:.8px;
        }
        .bk-wcol-hdr.tod .bk-wday-lbl { color:#71717a; }
        .bk-wcol-hdr.sel-col .bk-wday-lbl { color:#6b8af5; }
        .bk-wday-num {
          font-size:13px; font-weight:600; color:#52525b;
          width:28px; height:28px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          transition: background .18s, color .18s;
        }
        .bk-wcol-hdr.tod .bk-wday-num { color:#d4d4d8; }
        .bk-wcol-hdr.sel-col .bk-wday-num { color:#6b8af5; }
        .bk-wday-num.tod-circle { background:#fff; color:#000 !important; font-weight:800; box-shadow:0 2px 8px rgba(0,0,0,.4); }

        .bk-week-fmt-row { display:flex; gap:4px; padding:8px 12px; border-bottom:1px solid #1e1e26; }

        .bk-week-grid {
          display:grid; grid-template-columns:repeat(7,1fr);
          flex:1; overflow-y:auto;
          scrollbar-width:thin; scrollbar-color:#27272a transparent;
          align-items:start;
        }
        .bk-week-grid::-webkit-scrollbar { width:4px; }
        .bk-week-grid::-webkit-scrollbar-thumb { background:#27272a; border-radius:99px; }

        .bk-wcol { display:flex; flex-direction:column; gap:6px; padding:10px 5px; border-right:1px solid #1e1e26; }
        .bk-wcol:last-child { border-right:none; }

        .bk-wslot {
          width:100%; padding:10px 4px;
          background:#191920; border:1px solid #27272a; border-radius:7px;
          color:#d4d4d8; font-size:11.5px; font-weight:600; text-align:center;
          transition:background .18s,border-color .18s,transform .18s;
          animation: bk-slot-in .32s calc(var(--i)*15ms) cubic-bezier(.16,1,.3,1) both;
        }
        .bk-wslot:hover { background:#22222e; border-color:#3f3f46; transform:translateY(-1px); }

        /* ════ VIEW 3: TIMELINE ═══════════════════════════════════════════════ */
        .bk-tl-wrap { flex:1; display:flex; flex-direction:column; overflow:hidden; }
        .bk-tl-wrap.wanim-right { animation: bk-wanim-r .36s cubic-bezier(.16,1,.3,1) both; }
        .bk-tl-wrap.wanim-left  { animation: bk-wanim-l .36s cubic-bezier(.16,1,.3,1) both; }

        .bk-tl-hdrs { display:grid; grid-template-columns:56px repeat(7,1fr); border-bottom:1px solid #1e1e26; flex-shrink:0; }
        .bk-tl-gutter-head { border-right:1px solid #1e1e26; }

        .bk-tl-scroll { flex:1; overflow-y:auto; scrollbar-width:thin; scrollbar-color:#27272a transparent; }
        .bk-tl-scroll::-webkit-scrollbar { width:4px; }
        .bk-tl-scroll::-webkit-scrollbar-thumb { background:#27272a; border-radius:99px; }

        .bk-tl-inner {
          display:grid; grid-template-columns:56px repeat(7,1fr);
          min-height:1440px; position:relative;
        }
        .bk-tl-gutter { border-right:1px solid #1e1e26; display:flex; flex-direction:column; }
        .bk-hr-lbl {
          height:60px; display:flex; align-items:flex-start; justify-content:flex-end;
          padding:4px 7px 0 0; font-size:9px; font-weight:600; color:#3f3f46; flex-shrink:0;
          transition:color .18s;
        }
        .bk-hr-lbl.now-hr { color:#f59e0b; }

        .bk-tl-col { border-right:1px solid #1e1e26; position:relative; display:flex; flex-direction:column; }
        .bk-tl-col:last-child { border-right:none; }
        .bk-tl-col.tod {
          background: repeating-linear-gradient(-45deg,transparent,transparent 6px,rgba(255,255,255,.011) 6px,rgba(255,255,255,.011) 12px);
        }
        .bk-tl-col.past { opacity:.5; }

        .bk-hr-cell { height:60px; border-bottom:1px solid #19191f; flex-shrink:0; cursor:pointer; transition:background .14s; }
        .bk-hr-cell:hover { background:rgba(59,102,245,.07); }
        .bk-hr-cell.past-hr {
          background:repeating-linear-gradient(-45deg,transparent,transparent 5px,rgba(255,255,255,.014) 5px,rgba(255,255,255,.014) 10px);
          cursor:default;
        }
        .bk-hr-cell.past-hr:hover { background:repeating-linear-gradient(-45deg,transparent,transparent 5px,rgba(255,255,255,.014) 5px,rgba(255,255,255,.014) 10px); }

        .bk-now-line { position:absolute; left:0; right:0; height:1px; background:#f59e0b; z-index:10; pointer-events:none; animation:bk-pulse 3s ease-in-out infinite; }
        .bk-now-dot { position:absolute; left:-4px; top:-4px; width:9px; height:9px; border-radius:50%; background:#f59e0b; }
        @keyframes bk-pulse { 0%,100%{opacity:1} 50%{opacity:.55} }

        /* ════ MODAL ══════════════════════════════════════════════════════════ */
        .bk-modal-bg {
          position:fixed; inset:0; background:rgba(0,0,0,.78);
          backdrop-filter:blur(5px); z-index:1000;
          display:flex; align-items:center; justify-content:center; padding:20px;
          animation:bk-bg-in .22s ease both;
        }
        @keyframes bk-bg-in { from{opacity:0} to{opacity:1} }
        .bk-modal {
          background:#18181e; border:1px solid #27272a; border-radius:14px;
          max-width:430px; width:100%;
          box-shadow:0 30px 70px rgba(0,0,0,.85);
          animation:bk-modal-pop .32s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes bk-modal-pop { from{transform:scale(.9) translateY(14px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }

        .bk-modal-hd { padding:17px 20px; border-bottom:1px solid #27272a; display:flex; justify-content:space-between; align-items:center; }
        .bk-modal-ttl { font-size:15px; font-weight:700; color:#fff; }
        .bk-close { background:none; border:none; color:#71717a; font-size:18px; line-height:1; transition:color .18s; }
        .bk-close:hover { color:#fff; }

        .bk-modal-body { padding:18px 20px; display:flex; flex-direction:column; gap:12px; }
        .bk-lbl { display:flex; flex-direction:column; gap:5px; font-size:11.5px; font-weight:600; color:#a1a1aa; }
        .bk-inp { background:#111118; border:1px solid #27272a; border-radius:7px; color:#fff; padding:10px 12px; font-size:13px; font-family:inherit; transition:border-color .2s; resize:none; }
        .bk-inp:focus { outline:none; border-color:#3b66f5; box-shadow:0 0 0 3px rgba(59,102,245,.12); }
        .bk-slot-info { font-size:12px; color:#52525b; }
        .bk-modal-ft { display:flex; gap:8px; padding-top:4px; }
        .bk-btn-sec { flex:1; padding:11px; background:none; border:1px solid #27272a; border-radius:7px; color:#a1a1aa; font-size:13px; font-weight:700; transition:all .18s; font-family:inherit; }
        .bk-btn-sec:hover { border-color:#52525b; color:#fff; }
        .bk-btn-pri { flex:1; padding:11px; background:#fff; border:none; border-radius:7px; color:#000; font-size:13px; font-weight:700; transition:opacity .18s, transform .18s; font-family:inherit; }
        .bk-btn-pri:hover { opacity:.88; transform:translateY(-1px); }
        .bk-btn-pri:active { transform:translateY(0); }

        .bk-success { padding:28px 20px; text-align:center; animation:bk-ok-in .35s cubic-bezier(.16,1,.3,1) both; }
        @keyframes bk-ok-in { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
        .bk-ok-icon { width:52px; height:52px; border-radius:50%; background:rgba(16,185,129,.12); color:#10b981; display:inline-flex; align-items:center; justify-content:center; margin-bottom:14px; }
        .bk-ok-ttl { font-size:16px; font-weight:700; color:#fff; margin-bottom:7px; }
        .bk-ok-desc { font-size:13px; color:#a1a1aa; line-height:1.55; }

        /* ════ TOAST ══════════════════════════════════════════════════════════ */
        .bk-toast {
          position:fixed; bottom:20px; right:20px;
          background:#18181e; border:1px solid #27272a; border-radius:9px;
          padding:10px 15px; box-shadow:0 8px 24px rgba(0,0,0,.55);
          font-size:12.5px; font-weight:600; color:#fff;
          display:flex; align-items:center; gap:8px;
          z-index:2000; pointer-events:none;
          transform:translateY(70px); opacity:0;
          transition:transform .32s cubic-bezier(.16,1,.3,1), opacity .26s;
        }
        .bk-toast.show { transform:translateY(0); opacity:1; }

        /* ════ RESPONSIVE ═════════════════════════════════════════════════════ */
        @media (max-width:860px) {
          .bk-info { width:220px; padding:16px 13px; }
          .bk-slots-panel { width:190px; }
          .bk-overlay span { display:none; }
        }
        @media (max-width:640px) {
          .bk-root { flex-direction:column; height:auto; overflow:auto; }
          .bk-info { width:100%; border-right:none; border-bottom:1px solid #1e1e26; }
          .bk-right { min-height:80vh; }
          .bk-cal-layout { flex-direction:column; }
          .bk-slots-panel { width:100%; border-top:1px solid #1e1e26; }
        }
      `}</style>
    </div>
  );
}
