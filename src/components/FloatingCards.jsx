import React, { useState, useEffect, useRef } from 'react';

const CARDS = [
  {
    num: '01', title: 'Branding',
    desc: 'Identity that commands attention. Strategy, visual identity & communication systems that make you unforgettable.',
    color: '#c9f0dc', textColor: '#1e3a2a',
    sRot: '-5deg',   sTx: '-10px', sTy: '-8px',  sZ: 3,
    fRot: '-13deg',  fTx: '-155px', fTy: '18px', fZ: 1,
  },
  {
    num: '02', title: 'Design',
    desc: 'Experiences that convert. Websites, web apps & products built to delight users and drive measurable results.',
    color: '#c8e4f8', textColor: '#1a2535',
    sRot: '8deg',    sTx: '36px',  sTy: '-16px', sZ: 2,
    fRot: '4deg',    fTx: '4px',   fTy: '-10px', fZ: 3,
  },
  {
    num: '03', title: 'Growth',
    desc: 'Systems that compound. AI automation, lead generation & paid acquisition engineered to scale your revenue.',
    color: '#f0c8f0', textColor: '#2e1535',
    sRot: '-14deg',  sTx: '-32px', sTy: '28px',  sZ: 1,
    fRot: '16deg',   fTx: '155px', fTy: '18px',  fZ: 2,
  },
];

export default function FloatingCards() {
  const sentinelRef = useRef(null);
  const closeTimer  = useRef(null);

  // phase: 'hidden' → 'sliding-in' → 'stacked' → 'fanning' → 'fanned'
  const [phase,     setPhase]     = useState('hidden');
  const [activeCard, setActiveCard] = useState(null); // which card is on top
  const [scale,     setScale]     = useState(1);
  const [isMobile,  setIsMobile]  = useState(false);
  // mobile-only toggle
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scale for responsive sizing
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const mobile = w < 768;
      setIsMobile(mobile);
      const FULL = 610;
      setScale(w < FULL ? Math.max(0.44, (w - 40) / FULL) : 1);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // Scroll-triggered: slide in → stack → fan open → stay open
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && phase === 'hidden') {
          setPhase('sliding-in');
          setTimeout(() => setPhase('stacked'),  700);
          setTimeout(() => setPhase('fanning'),  1100);
          setTimeout(() => setPhase('fanned'),   1800);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [phase]);

  const isFanned  = phase === 'fanning' || phase === 'fanned';
  const isHidden  = phase === 'hidden';
  const isSliding = phase === 'sliding-in';

  // On desktop: clicking/hovering a card makes it active (comes to front, lifts up)
  const handleCardEnter = (num) => {
    if (!isMobile && isFanned) setActiveCard(num);
  };
  const handleCardLeave = () => {
    if (!isMobile) setActiveCard(null);
  };
  const handleCardClick = (num) => {
    if (isMobile) {
      // mobile: toggle whole deck open/close
      if (phase !== 'fanned' && phase !== 'stacked') return;
      setMobileOpen(prev => !prev);
    } else {
      // desktop: bring clicked card to front
      if (isFanned) setActiveCard(prev => prev === num ? null : num);
    }
  };

  // Effective fanned state
  const showFanned = isMobile ? mobileOpen : isFanned;
  // On mobile, use phase for stacked unless mobileOpen
  const effectiveFanned = isMobile
    ? (phase === 'fanned' || phase === 'fanning') && mobileOpen
    : isFanned;

  const rootHeight = Math.max(180, Math.round(295 * scale) + 60);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Inter:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <div ref={sentinelRef} style={{ width: '100%', height: rootHeight, position: 'relative' }}>

        <div style={{ width: '100%', height: '100%', overflow: isHidden || isSliding ? 'hidden' : 'visible' }}>

          {/* Sled — slides in from right */}
          <div
            style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...(isHidden
                ? { opacity: 0, transform: 'translateX(280px)', transition: 'none' }
                : isSliding
                ? { opacity: 1, transform: 'translateX(0)',
                    transition: 'opacity .6s cubic-bezier(.25,.8,.25,1), transform .65s cubic-bezier(.22,1,.36,1)' }
                : { opacity: 1, transform: 'translateX(0)' }),
            }}
          >
            {/* Scale wrapper */}
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center', flexShrink: 0 }}>

              <div className="fc-scene">

                {/* Mobile hint — only when stacked and not open */}
                {isMobile && !mobileOpen && (phase === 'fanned' || phase === 'stacked') && (
                  <div className="fc-hint"><span>tap to open</span></div>
                )}

                {CARDS.map((c, i) => {
                  const fanned = isMobile
                    ? (phase === 'fanned' || phase === 'fanning') && mobileOpen
                    : isFanned;

                  const rot = fanned ? c.fRot : c.sRot;
                  const tx  = fanned ? c.fTx  : c.sTx;
                  const ty  = fanned ? c.fTy  : c.sTy;

                  // z-index: active card goes highest, else fan default
                  let z = fanned ? c.fZ : c.sZ;
                  if (activeCard === c.num) z = 20;

                  // Active card lifts up and straightens
                  const isActive = activeCard === c.num;

                  return (
                    <div
                      key={c.num}
                      className="fc-card"
                      style={{
                        background: c.color,
                        zIndex: z,
                        '--fTx': c.fTx,
                        '--fTy': c.fTy,
                        transform: isActive
                          ? `rotate(0deg) translate(${c.fTx}, calc(${c.fTy} - 22px))`
                          : `rotate(${rot}) translate(${tx}, ${ty})`,
                        boxShadow: isActive
                          ? '0 36px 70px rgba(0,0,0,0.2), 0 8px 18px rgba(0,0,0,0.1)'
                          : '0 20px 50px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
                        transitionDelay: fanned && !isActive
                          ? `${i * 0.08}s`
                          : '0s',
                      }}
                      onMouseEnter={() => handleCardEnter(c.num)}
                      onMouseLeave={handleCardLeave}
                      onClick={() => handleCardClick(c.num)}
                    >
                      <span className="fc-num"   style={{ color: c.textColor }}>{c.num}</span>
                      <h3   className="fc-title" style={{ color: c.textColor }}>{c.title}</h3>
                      <p    className="fc-desc"  style={{ color: c.textColor }}>{c.desc}</p>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>
      </div>

      <style>{`
        .fc-scene {
          position: relative;
          width: 220px;
          height: 295px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .fc-hint {
          position: absolute;
          bottom: -34px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99;
          pointer-events: none;
          animation: fc-hint-pulse 2s ease-in-out infinite;
          white-space: nowrap;
        }
        .fc-hint span {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: #94a3b8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        @keyframes fc-hint-pulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 1; }
        }

        .fc-card {
          position: absolute;
          inset: 0;
          border-radius: 22px;
          padding: 28px 22px 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          border: 3px solid rgba(255,255,255,0.88);
          transition:
            transform  0.55s cubic-bezier(.34,1.56,.64,1),
            box-shadow 0.4s ease,
            z-index    0s;
          will-change: transform;
          user-select: none;
          cursor: pointer;
        }

        .fc-num {
          font-family: 'Caveat', cursive;
          font-size: 24px;
          font-weight: 600;
          opacity: 0.62;
          line-height: 1;
        }
        .fc-title {
          font-family: 'Caveat', cursive;
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          line-height: 1.15;
        }
        .fc-desc {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 400;
          line-height: 1.6;
          margin: 0;
          opacity: 0.78;
        }
      `}</style>
    </>
  );
}
