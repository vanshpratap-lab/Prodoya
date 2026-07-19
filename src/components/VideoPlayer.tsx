import { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, AlertTriangle, Download } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  maxHeight?: number;
}

export default function VideoPlayer({ src, maxHeight = 320 }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const [errored, setErrored] = useState(false);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || errored) return;
    if (video.paused) {
      video.play().catch(() => setErrored(true));
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  if (errored) {
    return (
      <div
        style={{
          width: '100%', minHeight: '140px', borderRadius: '12px', border: '1px solid var(--color-dark-border)',
          background: 'var(--color-surface-elevated)', display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '10px', padding: '20px', textAlign: 'center',
        }}
      >
        <AlertTriangle size={22} style={{ color: 'var(--color-warning)' }} />
        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', maxWidth: '320px' }}>
          This video can't be played directly in the browser — its format or codec isn't supported (common with videos recorded on some phones).
        </span>
        <a
          href={src}
          download
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}
        >
          <Download size={14} />
          Download the original file
        </a>
      </div>
    );
  }

  return (
    <div
      onClick={togglePlay}
      style={{
        position: 'relative', width: '100%', maxHeight, borderRadius: '12px', overflow: 'hidden',
        border: '1px solid var(--color-dark-border)', background: '#000', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <video
        ref={videoRef}
        src={src}
        muted={muted}
        playsInline
        preload="metadata"
        onLoadedMetadata={() => setReady(true)}
        onError={() => setErrored(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        style={{ width: '100%', maxHeight, display: 'block' }}
      />

      {!ready && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
          Loading video…
        </div>
      )}

      {/* Center play/pause affordance — always visible when paused, so a video never looks like a static image */}
      {ready && !playing && (
        <div
          style={{
            position: 'absolute', width: '58px', height: '58px', borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.55)', border: '2px solid rgba(255,255,255,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}
        >
          <Play size={24} fill="#fff" style={{ marginLeft: '3px' }} />
        </div>
      )}

      {/* Bottom-right controls: play/pause + mute/unmute, professionally styled */}
      {ready && (
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); togglePlay(); }}
            aria-label={playing ? 'Pause video' : 'Play video'}
            style={{
              width: '32px', height: '32px', borderRadius: '50%', border: 'none',
              background: 'rgba(0, 0, 0, 0.6)', color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)',
            }}
          >
            {playing ? <Pause size={14} /> : <Play size={14} fill="#fff" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute video' : 'Mute video'}
            style={{
              width: '32px', height: '32px', borderRadius: '50%', border: 'none',
              background: 'rgba(0, 0, 0, 0.6)', color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)',
            }}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}
