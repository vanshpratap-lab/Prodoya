import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Profile } from '../lib/supabase';
import { updateProfileDetails } from '../lib/hooks';

interface EditProfileModalProps {
  profile: Profile;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: '10px',
  border: '1px solid var(--color-dark-border)', background: 'var(--color-surface-elevated)',
  color: 'var(--color-text-strong)', fontSize: '0.88rem', outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted-light)', marginBottom: '4px', display: 'block',
};

export default function EditProfileModal({ profile, onClose, onSaved }: EditProfileModalProps) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [role, setRole] = useState(profile.role);
  const [college, setCollege] = useState(profile.college);
  const [bio, setBio] = useState(profile.bio);
  const [githubUrl, setGithubUrl] = useState(profile.github_url);
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url ?? '');
  const [twitterUrl, setTwitterUrl] = useState(profile.twitter_url ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateProfileDetails(profile.id, {
        full_name: fullName,
        role,
        college,
        bio,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        twitter_url: twitterUrl,
      });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)', borderRadius: '20px', boxShadow: 'var(--shadow-lg)',
          width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto',
          animation: 'scaleFromTop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--color-dark-border)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-strong)', margin: 0 }}>Edit profile</h2>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: 'var(--color-text-muted-light)', cursor: 'pointer', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Full name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} style={fieldStyle} maxLength={100} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Role</label>
              <input value={role} onChange={e => setRole(e.target.value)} style={fieldStyle} maxLength={80} placeholder="Engineering Student" />
            </div>
            <div>
              <label style={labelStyle}>College</label>
              <input value={college} onChange={e => setCollege(e.target.value)} style={fieldStyle} maxLength={120} placeholder="IIT Delhi" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} style={{ ...fieldStyle, resize: 'vertical', minHeight: '64px' }} maxLength={280} placeholder="A short line about what you're building." />
          </div>

          <div style={{ borderTop: '1px solid var(--color-dark-border)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted-light)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Connected accounts — only shown on your profile if filled in
            </span>
            <div>
              <label style={labelStyle}>GitHub URL</label>
              <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} style={fieldStyle} placeholder="https://github.com/yourname" type="url" />
            </div>
            <div>
              <label style={labelStyle}>LinkedIn URL</label>
              <input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} style={fieldStyle} placeholder="https://linkedin.com/in/yourname" type="url" />
            </div>
            <div>
              <label style={labelStyle}>Twitter / X URL</label>
              <input value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)} style={fieldStyle} placeholder="https://x.com/yourname" type="url" />
            </div>
          </div>

          {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.82rem' }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: '999px', border: '1px solid var(--color-dark-border)', background: 'var(--color-surface-elevated)', color: 'var(--color-text-light)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ padding: '9px 20px', borderRadius: '999px', border: 'none', background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
