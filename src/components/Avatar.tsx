import { useState } from 'react';

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
  className?: string;
}

const colorPresets = [
  '#7c3aed', // purple
  '#dc2626', // red
  '#d97706', // amber
  '#059669', // emerald
  '#2563eb', // blue
  '#db2777', // pink
  '#e11d48', // rose
  '#0891b2', // cyan
];

export default function Avatar({ name, avatarUrl, size = 48, className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Generate a deterministic color based on the name string
  const getColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % colorPresets.length;
    return colorPresets[idx];
  };

  const firstLetter = name ? name.trim().charAt(0).toUpperCase() : '?';

  if (avatarUrl && !imgError) {
    return (
      <div 
        className={className}
        style={{ 
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '50%',
          flexShrink: 0,
          width: `${size}px`, 
          height: `${size}px`, 
          border: '2px solid rgba(15, 23, 42, 0.06)',
          display: 'inline-block'
        }}
      >
        <img 
          src={avatarUrl} 
          alt={name} 
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            userSelect: 'none',
            pointerEvents: 'none'
          }}
        />
      </div>
    );
  }

  const bgColor = getColor(name);

  return (
    <div 
      className={className}
      style={{ 
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 'bold',
        userSelect: 'none',
        width: `${size}px`, 
        height: `${size}px`, 
        backgroundColor: bgColor,
        fontSize: size >= 76 ? '2rem' : (size <= 40 ? '0.85rem' : '1.1rem'),
        border: '2px solid rgba(255, 255, 255, 0.7)'
      }}
    >
      {firstLetter}
    </div>
  );
}
