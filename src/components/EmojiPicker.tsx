import { useState } from 'react';
import { Smile } from 'lucide-react';

// A genuine, professionally-curated set of commonly used Unicode emoji —
// grouped loosely by intent (reactions, work/engineering, gestures, symbols).
const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: 'Reactions', emojis: ['😀', '😄', '😊', '🙂', '😉', '😍', '🤔', '😎', '😅', '😂', '🥳', '😮'] },
  { label: 'Engineering', emojis: ['💻', '🚀', '🛠️', '🐛', '⚡', '🔧', '🧠', '📈', '🔬', '🧩', '🗂️', '🔗'] },
  { label: 'Gestures', emojis: ['👍', '👏', '🙌', '🙏', '💪', '🤝', '👌', '✌️'] },
  { label: 'Symbols', emojis: ['✅', '⭐', '🔥', '💡', '❤️', '🎯', '🎉', '✨'] },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  align?: 'left' | 'right';
}

export default function EmojiPicker({ onSelect, align = 'left' }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Add emoji"
        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted-light)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <Smile size={17} />
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: 'absolute', bottom: '28px', [align]: 0, zIndex: 50,
              background: 'var(--color-surface)', border: '1px solid var(--color-dark-border)',
              borderRadius: '14px', boxShadow: 'var(--shadow-lg)', padding: '10px',
              width: '236px', animation: 'fadeIn 0.15s ease',
            }}
          >
            {EMOJI_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: '6px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted-light)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {group.label}
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px', marginTop: '4px' }}>
                  {group.emojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => { onSelect(emoji); setOpen(false); }}
                      style={{ fontSize: '1.1rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', padding: '4px 0', lineHeight: 1 }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
