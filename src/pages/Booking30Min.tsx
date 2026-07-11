import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const WEEKDAY_UPPER = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

const TZ_OPTIONS = [
  'Asia/Ashgabat GMT +5:00',
  'Asia/Samarkand GMT +5:00',
  'Asia/Tashkent GMT +5:00',
  'Asia/Kolkata GMT +5:30',
];

// All 30-min slots across a day
const ALL_SLOTS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    ALL_SLOTS.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function addDays(date: Date, n: number): Date {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isToday(d: Date) { return sameDay(d, new Date()); }
function isPast(d: Date) {
  const t = new Date(); t.setHours(0,0,0,0); return d < t;
}
function getDaysInMonth(y: number, m: number) { return new Date(y, m+1, 0).getDate(); }
function getFirstDOW(y: number, m: number) { return new Date(y, m, 1).getDay(); }

function fmt(slot: string, format: '12h'|'24h') {
  if (format === '24h') return slot;
  const [h, m] = slot.split(':').map(Number);
  const p = h < 12 ? 'am' : 'pm';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2,'0')}${p}`;
}

function getSlotsForDay(d: Date): string[] {
  if (isPast(d)) return [];
  if (!isToday(d)) return ALL_SLOTS;
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  return ALL_SLOTS.filter(s => { const [h,m] = s.split(':').map(Number); return h*60+m > mins+30; });
}

function getWeekLabel(days: Date[]) {
  const f = days[0], l = days[6];
  const fM = MONTH_NAMES[f.getMonth()].slice(0,3);
  if (f.getMonth() === l.getMonth())
    return `${fM} ${f.getDate()}-${l.getDate()}, ${f.getFullYear()}`;
  return `${fM} ${f.getDate()} - ${MONTH_NAMES[l.getMonth()].slice(0,3)} ${l.getDate()}, ${l.getFullYear()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
type ViewMode = 'timeline' | 'slots';
interface BookingSlot { day: Date; time: string; }

export default function Booking30Min() {
  const todayClean = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();

  const [weekStart,   setWeekStart]   = useState<Date>(todayClean);
  const [viewMode,    setViewMode]    = useState<ViewMode>('slots');
  const [timeFormat,  setTimeFormat]  = useState<'12h'|'24h'>('24h');
  const [overlayOn,   setOverlayOn]   = useState(false);
  const [animDir,     setAnimDir]     = useState<'left'|'right'|null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Mini calendar
  const [miniYear,  setMiniYear]  = useState(todayClean.getFullYear());
  const [miniMonth, setMiniMonth] = useState(todayClean.getMonth());

  // Timezone
  const [activeTz, setActiveTz] = useState('Asia/Kolkata GMT +5:30');
  const [tzOpen,   setTzOpen]   = useState(false);

  // Booking modal
  const [slot,       setSlot]      = useState<BookingSlot|null>(null);
  const [modalOpen,  setModalOpen] = useState(false);
  const [isSuccess,  setIsSuccess] = useState(false);
  const [name,       setName]      = useState('');
  const [email,      setEmail]     = useState('');
  const [notes,      setNotes]     = useState('');

  // Toast
  const [toastMsg,  setToastMsg]  = useState('');
  const [showToast, setShowToast] = useState(false);

  // Live clock for current-time line
  const [now, setNow] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);

  const weekDays = Array.from({length:7}, (_,i) => addDays(weekStart, i));
  const weekLabel = getWeekLabel(weekDays);
  const todayColIdx = weekDays.findIndex(d => isToday(d));

  // Tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll timeline to current time
  useEffect(() => {
    if (viewMode === 'timeline' && timelineRef.current) {
      const px = now.getHours() * 60 + (now.getMinutes() / 60) * 60;
      timelineRef.current.scrollTop = Math.max(0, px - 200);
    }
  }, [viewMode]);

  // Toast dismiss
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

  // ── Navigation
  const navigateWeek = (dir: 'left'|'right') => {
    if (isAnimating) return;
    setWeekStart(prev => addDays(prev, dir === 'right' ? 7 : -7));
    setAnimDir(dir);
    setIsAnimating(true);
    setTimeout(() => { setAnimDir(null); setIsAnimating(false); }, 380);
  };

  const goToToday = () => {
    if (isAnimating) return;
    setWeekStart(todayClean);
    setMiniYear(todayClean.getFullYear());
    setMiniMonth(todayClean.getMonth());
    setAnimDir('right');
    setIsAnimating(true);
    setTimeout(() => { setAnimDir(null); setIsAnimating(false); }, 380);
    toast('Jumped to today');
  };

  // ── Mini-cal
  const miniDays  = getDaysInMonth(miniYear, miniMonth);
  const miniFirst = getFirstDOW(miniYear, miniMonth);
  const miniPrev  = () => { miniMonth === 0 ? (setMiniYear(y=>y-1), setMiniMonth(11)) : setMiniMonth(m=>m-1); };
  const miniNext  = () => { miniMonth === 11 ? (setMiniYear(y=>y+1), setMiniMonth(0)) : setMiniMonth(m=>m+1); };

  // ── Slot click
  const openSlot = (day: Date, time: string) => {
    setSlot({day, time});
    setName(''); setEmail(''); setNotes('');
    setIsSuccess(false);
    setModalOpen(true);
  };

  // ── Current time position
  const nowPx = now.getHours() * 60 + (now.getMinutes() / 60) * 60; // px (1h = 60px)

  return (
    <div className="bk-root" onClick={() => setTzOpen(false)}>
      {/* ══ LEFT SIDEBAR ══════════════════════════════════════════════════════ */}
      <aside className="bk-sidebar">
        {/* Logo */}
        <div className="bk-logo">
          <svg viewBox="0 0 48 48" width="36" height="36">
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
          <p className="bk-sect-label">🚀 Mobile App Strategy Session:</p>
          <ol className="bk-list">
            <li>Your app idea and target users</li>
            <li>Technical needs and platform choice</li>
            <li>Timeline and budget discussion</li>
            <li>Next steps</li>
          </ol>
        </div>

        <div className="bk-meta"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>30m</span></div>

        <div className="bk-meta">
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
          <button className="bk-tz-btn" onClick={() => setTzOpen(v=>!v)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
            <span>{activeTz.split(' ')[0]}</span>
            <svg className={`bk-caret${tzOpen?' open':''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div className={`bk-tz-dropdown${tzOpen?' open':''}`}>
            {TZ_OPTIONS.map(tz => (
              <div key={tz} className={`bk-tz-opt${tz===activeTz?' sel':''}`}
                onClick={() => { setActiveTz(tz); setTzOpen(false); toast(`TZ: ${tz.split(' ')[0]}`); }}>
                {tz}
              </div>
            ))}
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="bk-mini-cal">
          <div className="bk-mini-head">
            <span className="bk-mini-title"><b>{MONTH_NAMES[miniMonth]}</b> {miniYear}</span>
            <div style={{display:'flex',gap:'2px'}}>
              <button className="bk-mini-nav" onClick={miniPrev}>‹</button>
              <button className="bk-mini-nav" onClick={miniNext}>›</button>
            </div>
          </div>
          <div className="bk-mini-grid">
            {WEEKDAY_UPPER.map(d => <div key={d} className="bk-mini-wday">{d}</div>)}
            {Array.from({length: miniFirst}).map((_,i) => <div key={`b${i}`}/>)}
            {Array.from({length: miniDays}, (_,i) => i+1).map(day => {
              const d = new Date(miniYear, miniMonth, day);
              d.setHours(0,0,0,0);
              const inWk = weekDays.some(w => sameDay(w, d));
              const tod  = isToday(d);
              return (
                <button key={day}
                  className={`bk-mini-day${tod?' tod':''}${inWk?' in-wk':''}`}
                  onClick={() => {
                    setWeekStart(d);
                    setAnimDir('right'); setIsAnimating(true);
                    setTimeout(()=>{setAnimDir(null);setIsAnimating(false);},380);
                    toast(`Week of ${MONTH_NAMES[miniMonth].slice(0,3)} ${day}`);
                  }}>
                  {day}
                  {tod && <span className="bk-mini-dot"/>}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ══ RIGHT PANEL ═══════════════════════════════════════════════════════ */}
      <div className="bk-right">

        {/* TOP BAR */}
        <div className="bk-topbar">
          <div className="bk-topbar-l">
            <span className="bk-week-label">{weekLabel}</span>
            <button className="bk-nav-arr" onClick={()=>navigateWeek('left')} disabled={isAnimating}>‹</button>
            <button className="bk-nav-arr" onClick={()=>navigateWeek('right')} disabled={isAnimating}>›</button>
            <button className="bk-today-pill" onClick={goToToday}>Today</button>
          </div>
          <div className="bk-topbar-r">
            <label className="bk-overlay" onClick={e=>{e.stopPropagation();setOverlayOn(v=>!v);}}>
              <div className={`bk-sw${overlayOn?' on':''}`}><div className="bk-knob"/></div>
              <span>Overlay my calendar</span>
            </label>
            <div className="bk-fmt-grp">
              <button className={`bk-fmt${timeFormat==='12h'?' act':''}`} onClick={()=>setTimeFormat('12h')}>12h</button>
              <button className={`bk-fmt${timeFormat==='24h'?' act':''}`} onClick={()=>setTimeFormat('24h')}>24h</button>
            </div>
            <div className="bk-view-grp">
              {/* Single day icon */}
              <button className="bk-vbtn" title="Timeline view" onClick={()=>setViewMode('timeline')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </button>
              {/* Grid icon = slots */}
              <button className={`bk-vbtn${viewMode==='slots'?' act':''}`} title="Slot grid" onClick={()=>setViewMode('slots')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              </button>
              {/* Columns icon = timeline */}
              <button className={`bk-vbtn${viewMode==='timeline'?' act':''}`} title="Week timeline" onClick={()=>setViewMode('timeline')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className={`bk-main${animDir ? ` anim-${animDir}` : ''}`}>

          {viewMode === 'timeline' ? (
            /* ─ TIMELINE VIEW ─────────────────────────────────────────────── */
            <div className="bk-tl-wrap">
              {/* Column headers */}
              <div className="bk-hdr-row">
                <div className="bk-gutter-head"/>
                {weekDays.map((d,i) => {
                  const tod = isToday(d);
                  return (
                    <div key={i} className={`bk-col-hdr${tod?' tod':''}`}>
                      <span className="bk-col-wday">{WEEKDAY_UPPER[d.getDay()]}</span>
                      <span className={`bk-col-num${tod?' tod-circle':''}`}>{String(d.getDate()).padStart(2,'0')}</span>
                    </div>
                  );
                })}
              </div>

              {/* Scrollable grid */}
              <div className="bk-tl-scroll" ref={timelineRef}>
                <div className="bk-tl-inner">
                  {/* Time gutter */}
                  <div className="bk-tl-gutter">
                    {Array.from({length:24},(_,h) => (
                      <div key={h} className={`bk-hr-lbl${h===now.getHours()&&todayColIdx>=0?' now-hr':''}`}>
                        {String(h).padStart(2,'0')}:00
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {weekDays.map((d,ci) => {
                    const tod  = isToday(d);
                    const past = isPast(d);
                    return (
                      <div key={ci} className={`bk-tl-col${tod?' tod':''}${past?' past':''}`}>
                        {Array.from({length:24},(_,h) => {
                          const pastHour = tod && h < now.getHours();
                          return (
                            <div key={h}
                              className={`bk-hr-cell${pastHour?' past-hr':''}`}
                              onClick={() => {
                                if (!past && !pastHour) {
                                  const s = `${String(h).padStart(2,'0')}:00`;
                                  openSlot(d, fmt(s, timeFormat));
                                }
                              }}
                            />
                          );
                        })}
                        {/* Current time indicator */}
                        {tod && (
                          <div className="bk-now-line" style={{top:`${nowPx}px`}}>
                            <div className="bk-now-dot"/>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ─ SLOT GRID VIEW ────────────────────────────────────────────── */
            <div className="bk-sg-wrap">
              {/* Column headers */}
              <div className="bk-hdr-row bk-hdr-slots">
                {weekDays.map((d,i) => {
                  const tod = isToday(d);
                  return (
                    <div key={i} className={`bk-col-hdr${tod?' tod':''}`}>
                      <span className="bk-col-wday">{WEEKDAY_UPPER[d.getDay()]}</span>
                      <span className={`bk-col-num${tod?' tod-circle':''}`}>{String(d.getDate()).padStart(2,'0')}</span>
                    </div>
                  );
                })}
              </div>

              {/* Slot columns */}
              <div className="bk-sg-grid">
                {weekDays.map((d,ci) => {
                  const slots = getSlotsForDay(d);
                  return (
                    <div key={ci} className="bk-sg-col">
                      {slots.length === 0
                        ? <div className="bk-no-slots">—</div>
                        : slots.map((s,si) => (
                          <button key={s}
                            className="bk-sg-btn"
                            style={{'--i': si} as React.CSSProperties}
                            onClick={() => openSlot(d, fmt(s, timeFormat))}>
                            {fmt(s, timeFormat)}
                          </button>
                        ))
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ MODAL ═════════════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="bk-modal-bg" onClick={()=>setModalOpen(false)}>
          <div className="bk-modal" onClick={e=>e.stopPropagation()}>
            <div className="bk-modal-hd">
              <span className="bk-modal-title">Confirm Booking</span>
              <button className="bk-close" onClick={()=>setModalOpen(false)}>✕</button>
            </div>
            {!isSuccess ? (
              <form className="bk-modal-body" onSubmit={e=>{e.preventDefault();setIsSuccess(true);toast('Booking confirmed! 🎉');}}>
                <label className="bk-lbl">Name
                  <input className="bk-inp" type="text" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} required/>
                </label>
                <label className="bk-lbl">Email
                  <input className="bk-inp" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
                </label>
                <label className="bk-lbl">Notes (optional)
                  <textarea className="bk-inp" rows={3} placeholder="Tell us about your app idea…" value={notes} onChange={e=>setNotes(e.target.value)}/>
                </label>
                {slot && (
                  <p className="bk-slot-info">
                    📅 {MONTH_NAMES[slot.day.getMonth()]} {slot.day.getDate()}, {slot.day.getFullYear()} &nbsp;·&nbsp; ⏰ {slot.time}
                  </p>
                )}
                <div className="bk-modal-ft">
                  <button type="button" className="bk-btn-sec" onClick={()=>setModalOpen(false)}>Cancel</button>
                  <button type="submit" className="bk-btn-pri">Confirm Slot</button>
                </div>
              </form>
            ) : (
              <div className="bk-success">
                <div className="bk-ok-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className="bk-ok-title">Meeting Confirmed!</h3>
                <p className="bk-ok-desc">Google Meet invite sent to <strong>{email}</strong>.</p>
                <button className="bk-btn-pri" style={{width:'100%',marginTop:'8px'}} onClick={()=>setModalOpen(false)}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ TOAST ═════════════════════════════════════════════════════════════ */}
      <div className={`bk-toast${showToast?' show':''}`}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        {toastMsg}
      </div>

      {/* ══ STYLES ════════════════════════════════════════════════════════════ */}
      <style>{`
        /* ── Reset */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: inherit; cursor: pointer; }
        ol, ul { list-style: none; padding: 0; }

        /* ── Root */
        .bk-root {
          display: flex;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #0c0c0d;
          color: #e4e4e7;
          font-family: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif;
          animation: bk-root-in .5s cubic-bezier(.16,1,.3,1) both;
        }
        @keyframes bk-root-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ══ SIDEBAR ══════════════════════════════════════════════════════════ */
        .bk-sidebar {
          width: 270px;
          flex-shrink: 0;
          background: #111113;
          border-right: 1px solid #1e1e26;
          padding: 24px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 0;
          overflow-y: auto;
          animation: bk-sidebar-in .5s cubic-bezier(.16,1,.3,1) .05s both;
        }
        @keyframes bk-sidebar-in {
          from { transform: translateX(-24px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        .bk-sidebar::-webkit-scrollbar { width: 3px; }
        .bk-sidebar::-webkit-scrollbar-thumb { background:#27272a; border-radius:99px; }

        .bk-logo {
          width: 40px; height: 40px; border-radius: 50%;
          background: #fff; display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px; flex-shrink: 0;
          box-shadow: 0 2px 10px rgba(0,0,0,.3);
          transition: transform .25s;
        }
        .bk-logo:hover { transform: scale(1.07) rotate(3deg); }

        .bk-brand { font-size: 11.5px; font-weight: 500; color: #71717a; margin-bottom: 6px; }
        .bk-event-title { font-size: 17px; font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 18px; }

        .bk-section { margin-bottom: 18px; }
        .bk-sect-label { font-size: 11.5px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 7px; }
        .bk-list { display: flex; flex-direction: column; gap: 4px; padding-left: 14px; list-style: decimal; color: #a1a1aa; font-size: 12px; line-height: 1.6; }

        .bk-meta { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #a1a1aa; margin-bottom: 10px; }

        /* Timezone */
        .bk-tz-wrap { position: relative; margin-top: 2px; margin-bottom: 22px; }
        .bk-tz-btn {
          background: none; border: none; color: #a1a1aa; font-size: 12.5px; font-weight: 600;
          display: flex; align-items: center; gap: 6px; padding: 3px 0; transition: color .18s;
        }
        .bk-tz-btn:hover { color: #fff; }
        .bk-caret { transition: transform .22s; }
        .bk-caret.open { transform: rotate(180deg); }

        .bk-tz-dropdown {
          position: absolute; top: calc(100% + 6px); left: 0;
          background: #1a1a20; border: 1px solid #2a2a34;
          border-radius: 8px; width: 230px; max-height: 0; overflow: hidden;
          z-index: 300; box-shadow: 0 10px 30px rgba(0,0,0,.6);
          transition: max-height .28s cubic-bezier(.16,1,.3,1), opacity .22s;
          opacity: 0; pointer-events: none;
        }
        .bk-tz-dropdown.open { max-height: 180px; opacity: 1; pointer-events: auto; overflow-y: auto; }
        .bk-tz-opt { padding: 9px 13px; font-size: 12px; color: #a1a1aa; cursor: pointer; transition: background .15s,color .15s; }
        .bk-tz-opt:hover { background: rgba(255,255,255,.05); color: #fff; }
        .bk-tz-opt.sel { background: rgba(59,102,245,.15); color: #fff; font-weight: 600; }

        /* Mini Calendar */
        .bk-mini-cal { margin-top: 4px; }
        .bk-mini-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .bk-mini-title { font-size: 13px; color: #e4e4e7; }
        .bk-mini-nav {
          width: 22px; height: 22px; background: none; border: none;
          color: #71717a; font-size: 16px; border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          transition: background .18s, color .18s; line-height: 1;
        }
        .bk-mini-nav:hover { background: rgba(255,255,255,.06); color: #fff; }

        .bk-mini-grid {
          display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;
        }
        .bk-mini-wday { font-size: 8.5px; font-weight: 700; color: #3f3f46; text-align: center; padding-bottom: 6px; text-transform: uppercase; }
        .bk-mini-day {
          aspect-ratio: 1; background: none; border: none; border-radius: 50%;
          font-size: 10.5px; font-weight: 500; color: #a1a1aa;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          position: relative; transition: background .18s, color .18s, transform .18s;
        }
        .bk-mini-day:hover { background: rgba(255,255,255,.07); color: #fff; transform: scale(1.1); }
        .bk-mini-day.in-wk { background: rgba(255,255,255,.05); color: #d4d4d8; }
        .bk-mini-day.tod { background: #fff; color: #000; font-weight: 700; }
        .bk-mini-day.tod:hover { background: #e4e4e7; }
        .bk-mini-dot { position: absolute; bottom: 2px; width: 3px; height: 3px; border-radius: 50%; background: #3b66f5; }

        /* ══ RIGHT PANEL ══════════════════════════════════════════════════════ */
        .bk-right {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column;
          overflow: hidden;
          animation: bk-right-in .5s cubic-bezier(.16,1,.3,1) .1s both;
        }
        @keyframes bk-right-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Top bar */
        .bk-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 16px; height: 52px;
          border-bottom: 1px solid #1e1e26;
          flex-shrink: 0; gap: 12px;
        }
        .bk-topbar-l { display: flex; align-items: center; gap: 10px; }
        .bk-topbar-r { display: flex; align-items: center; gap: 14px; }

        .bk-week-label { font-size: 14px; font-weight: 700; color: #fff; white-space: nowrap; }

        .bk-nav-arr {
          width: 26px; height: 26px; background: none; border: none;
          color: #71717a; font-size: 19px; border-radius: 5px;
          display: flex; align-items: center; justify-content: center;
          transition: background .18s, color .18s;
        }
        .bk-nav-arr:hover:not(:disabled) { background: rgba(255,255,255,.06); color: #fff; }
        .bk-nav-arr:disabled { opacity: .35; cursor: default; }

        .bk-today-pill {
          background: none; border: 1px solid #3a3a44;
          color: #e4e4e7; font-size: 12px; font-weight: 600;
          padding: 5px 12px; border-radius: 6px;
          transition: all .18s;
        }
        .bk-today-pill:hover { border-color: #71717a; color: #fff; background: rgba(255,255,255,.04); }

        /* Overlay toggle */
        .bk-overlay { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
        .bk-overlay span { font-size: 12px; font-weight: 600; color: #71717a; white-space: nowrap; }
        .bk-sw {
          width: 32px; height: 17px; border-radius: 99px; background: #2e2e3a;
          position: relative; transition: background .3s; flex-shrink: 0;
        }
        .bk-sw.on { background: #3b66f5; }
        .bk-knob {
          position: absolute; top: 2px; left: 2px;
          width: 13px; height: 13px; border-radius: 50%; background: #fff;
          transition: transform .28s cubic-bezier(.34,1.56,.64,1);
          box-shadow: 0 1px 4px rgba(0,0,0,.4);
        }
        .bk-sw.on .bk-knob { transform: translateX(15px); }

        /* 12h / 24h */
        .bk-fmt-grp { display: flex; background: #18181e; border: 1px solid #27272a; border-radius: 6px; padding: 2px; }
        .bk-fmt {
          background: none; border: none; color: #71717a;
          font-size: 11px; font-weight: 700; padding: 4px 9px; border-radius: 4px;
          transition: all .2s;
        }
        .bk-fmt.act { background: #27272a; color: #fff; }

        /* View icons */
        .bk-view-grp { display: flex; gap: 4px; }
        .bk-vbtn {
          width: 28px; height: 28px; background: none;
          border: 1px solid #27272a; border-radius: 6px;
          color: #52525b; display: flex; align-items: center; justify-content: center;
          transition: all .18s;
        }
        .bk-vbtn:hover { border-color: #3f3f46; color: #a1a1aa; }
        .bk-vbtn.act { border-color: #3b66f5; color: #3b66f5; background: rgba(59,102,245,.08); }

        /* ── Main content */
        .bk-main {
          flex: 1; overflow: hidden; position: relative;
        }
        .bk-main.anim-right {
          animation: bk-slide-right .38s cubic-bezier(.16,1,.3,1) both;
        }
        .bk-main.anim-left {
          animation: bk-slide-left .38s cubic-bezier(.16,1,.3,1) both;
        }
        @keyframes bk-slide-right {
          from { transform: translateX(32px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes bk-slide-left {
          from { transform: translateX(-32px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }

        /* ═══ COLUMN HEADERS (shared) ════════════════════════════════════════ */
        .bk-hdr-row {
          display: grid; grid-template-columns: 60px repeat(7,1fr);
          border-bottom: 1px solid #1e1e26;
          flex-shrink: 0;
        }
        .bk-hdr-slots {
          grid-template-columns: repeat(7,1fr);
        }
        .bk-gutter-head { border-right: 1px solid #1e1e26; }
        .bk-col-hdr {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 10px 4px; gap: 4px;
          border-right: 1px solid #1e1e26;
          transition: background .18s;
        }
        .bk-col-hdr:last-child { border-right: none; }
        .bk-col-hdr.tod { background: rgba(59,102,245,.04); }
        .bk-col-wday { font-size: 9.5px; font-weight: 700; color: #52525b; text-transform: uppercase; letter-spacing: .5px; }
        .bk-col-hdr.tod .bk-col-wday { color: #a1a1aa; }
        .bk-col-num {
          font-size: 12px; font-weight: 600; color: #71717a;
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .bk-col-hdr.tod .bk-col-num { color: #d4d4d8; }
        .bk-col-num.tod-circle {
          background: #fff; color: #000; font-weight: 700;
        }

        /* ═══ TIMELINE VIEW ══════════════════════════════════════════════════ */
        .bk-tl-wrap {
          display: flex; flex-direction: column;
          height: 100%; overflow: hidden;
        }
        .bk-tl-scroll {
          flex: 1; overflow-y: auto; overflow-x: hidden;
          scrollbar-width: thin; scrollbar-color: #27272a transparent;
        }
        .bk-tl-scroll::-webkit-scrollbar { width: 4px; }
        .bk-tl-scroll::-webkit-scrollbar-thumb { background:#27272a; border-radius:99px; }

        .bk-tl-inner {
          display: grid;
          grid-template-columns: 60px repeat(7,1fr);
          min-height: ${24 * 60}px; /* 1440px — 1hr=60px */
          position: relative;
        }
        .bk-tl-gutter {
          border-right: 1px solid #1e1e26;
          display: flex; flex-direction: column;
        }
        .bk-hr-lbl {
          height: 60px; display: flex; align-items: flex-start; justify-content: flex-end;
          padding: 4px 8px 0 0; font-size: 9.5px; font-weight: 600;
          color: #3f3f46; flex-shrink: 0; transition: color .18s;
        }
        .bk-hr-lbl.now-hr { color: #f59e0b; }

        .bk-tl-col {
          border-right: 1px solid #1e1e26; position: relative;
          display: flex; flex-direction: column;
        }
        .bk-tl-col:last-child { border-right: none; }
        .bk-tl-col.tod {
          background: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 6px,
            rgba(255,255,255,.012) 6px,
            rgba(255,255,255,.012) 12px
          );
        }
        .bk-tl-col.past { opacity: .55; }

        .bk-hr-cell {
          height: 60px; border-bottom: 1px solid #1a1a22;
          flex-shrink: 0; cursor: pointer; transition: background .15s;
        }
        .bk-hr-cell:hover { background: rgba(59,102,245,.07); }
        .bk-hr-cell.past-hr {
          background: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 5px,
            rgba(255,255,255,.015) 5px,
            rgba(255,255,255,.015) 10px
          );
          cursor: default;
        }
        .bk-hr-cell.past-hr:hover { background: repeating-linear-gradient(-45deg,transparent,transparent 5px,rgba(255,255,255,.015) 5px,rgba(255,255,255,.015) 10px); }

        /* Current time line */
        .bk-now-line {
          position: absolute; left: 0; right: 0; height: 1px;
          background: #f59e0b; z-index: 10; pointer-events: none;
          animation: bk-pulse-line 3s ease-in-out infinite;
        }
        @keyframes bk-pulse-line {
          0%,100% { opacity: 1; }
          50%      { opacity: .6; }
        }
        .bk-now-dot {
          position: absolute; left: -4px; top: -4px;
          width: 9px; height: 9px; border-radius: 50%;
          background: #f59e0b;
        }

        /* ═══ SLOT GRID VIEW ══════════════════════════════════════════════════ */
        .bk-sg-wrap {
          display: flex; flex-direction: column;
          height: 100%; overflow: hidden;
        }
        .bk-sg-grid {
          flex: 1; display: grid; grid-template-columns: repeat(7,1fr);
          overflow-y: auto; overflow-x: hidden; align-items: start;
          scrollbar-width: thin; scrollbar-color: #27272a transparent;
        }
        .bk-sg-grid::-webkit-scrollbar { width: 4px; }
        .bk-sg-grid::-webkit-scrollbar-thumb { background:#27272a; border-radius:99px; }

        .bk-sg-col {
          display: flex; flex-direction: column; gap: 7px;
          padding: 12px 6px; border-right: 1px solid #1e1e26;
          min-height: 100%;
        }
        .bk-sg-col:last-child { border-right: none; }

        .bk-sg-btn {
          width: 100%; padding: 11px 6px;
          background: #191920; border: 1px solid #27272a; border-radius: 8px;
          color: #d4d4d8; font-size: 12px; font-weight: 600; text-align: center;
          transition: background .18s, border-color .18s, transform .18s, box-shadow .18s;
          animation: bk-slot-in .35s calc(var(--i) * 18ms) cubic-bezier(.16,1,.3,1) both;
        }
        .bk-sg-btn:hover {
          background: #22222e; border-color: #3f3f46;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,.3);
        }
        .bk-sg-btn:active { transform: translateY(0); box-shadow: none; }
        @keyframes bk-slot-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .bk-no-slots {
          text-align: center; padding: 20px 0;
          font-size: 14px; color: #3f3f46;
        }

        /* ══ MODAL ════════════════════════════════════════════════════════════ */
        .bk-modal-bg {
          position: fixed; inset: 0; background: rgba(0,0,0,.75);
          backdrop-filter: blur(5px); z-index: 1000;
          display: flex; align-items: center; justify-content: center; padding: 20px;
          animation: bk-bg-in .22s ease both;
        }
        @keyframes bk-bg-in { from{opacity:0} to{opacity:1} }

        .bk-modal {
          background: #18181e; border: 1px solid #27272a; border-radius: 14px;
          max-width: 440px; width: 100%;
          box-shadow: 0 30px 70px rgba(0,0,0,.85);
          animation: bk-modal-in .3s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes bk-modal-in {
          from { transform: scale(.92) translateY(12px); opacity: 0; }
          to   { transform: scale(1) translateY(0);      opacity: 1; }
        }
        .bk-modal-hd {
          padding: 18px 20px; border-bottom: 1px solid #27272a;
          display: flex; justify-content: space-between; align-items: center;
        }
        .bk-modal-title { font-size: 15px; font-weight: 700; color: #fff; }
        .bk-close { background:none; border:none; color:#71717a; font-size:18px; line-height:1; transition:color .18s; }
        .bk-close:hover { color:#fff; }

        .bk-modal-body { padding: 20px; display: flex; flex-direction: column; gap: 13px; }
        .bk-lbl { display:flex; flex-direction:column; gap:5px; font-size:11.5px; font-weight:600; color:#a1a1aa; }
        .bk-inp {
          background:#111118; border:1px solid #27272a; border-radius:7px;
          color:#fff; padding:10px 12px; font-size:13px;
          font-family:inherit; transition:border-color .2s; resize:none;
        }
        .bk-inp:focus { outline:none; border-color:#3b66f5; }
        .bk-slot-info { font-size:12px; color:#52525b; }
        .bk-modal-ft { display:flex; gap:8px; padding-top:4px; }
        .bk-btn-sec {
          flex:1; padding:11px; background:none; border:1px solid #27272a;
          border-radius:7px; color:#a1a1aa; font-size:13px; font-weight:700;
          transition:all .18s; font-family:inherit;
        }
        .bk-btn-sec:hover { border-color:#52525b; color:#fff; }
        .bk-btn-pri {
          flex:1; padding:11px; background:#fff; border:1px solid #fff;
          border-radius:7px; color:#000; font-size:13px; font-weight:700;
          transition:opacity .18s; font-family:inherit;
        }
        .bk-btn-pri:hover { opacity:.85; }

        /* Success */
        .bk-success { padding:30px 20px; text-align:center; animation:bk-ok-in .4s cubic-bezier(.16,1,.3,1) both; }
        @keyframes bk-ok-in {
          from { opacity:0; transform:scale(.9); }
          to   { opacity:1; transform:scale(1); }
        }
        .bk-ok-icon {
          width:54px; height:54px; border-radius:50%;
          background:rgba(16,185,129,.1); color:#10b981;
          display:inline-flex; align-items:center; justify-content:center;
          margin-bottom:16px;
        }
        .bk-ok-title { font-size:17px; font-weight:700; color:#fff; margin-bottom:8px; }
        .bk-ok-desc  { font-size:13px; color:#a1a1aa; line-height:1.55; }

        /* ══ TOAST ════════════════════════════════════════════════════════════ */
        .bk-toast {
          position: fixed; bottom: 20px; right: 20px;
          background: #18181e; border: 1px solid #27272a;
          border-radius: 9px; padding: 11px 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,.55);
          font-size: 12.5px; font-weight: 600; color: #fff;
          display: flex; align-items: center; gap: 8px;
          z-index: 2000; pointer-events: none;
          transform: translateY(80px); opacity: 0;
          transition: transform .32s cubic-bezier(.16,1,.3,1), opacity .28s;
        }
        .bk-toast.show { transform: translateY(0); opacity: 1; }

        /* ══ RESPONSIVE ═══════════════════════════════════════════════════════ */
        @media (max-width: 800px) {
          .bk-sidebar { width: 220px; padding: 16px 14px; }
          .bk-event-title { font-size: 15px; }
          .bk-overlay span { display: none; }
        }
        @media (max-width: 640px) {
          .bk-root { flex-direction: column; height: auto; }
          .bk-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #1e1e26; }
          .bk-right { height: 80vh; }
        }
      `}</style>
    </div>
  );
}
