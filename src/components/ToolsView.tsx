import { useState, type FormEvent, type CSSProperties } from 'react';
import {
  Plus, X, Check, ChevronLeft, ChevronRight, ArrowLeft, CalendarDays,
  Wrench, Hammer, Rocket, FlaskConical, ListFilter, ArrowUpDown, SlidersHorizontal,
  MessageSquare, HardDrive, FileType, Figma, LayoutGrid, Eye, Rows3, Layers,
  Palette, Link2, Database, ListChecks, Settings2, Lock, Zap, Sparkles, Flag,
} from 'lucide-react';
import Avatar from './Avatar';
import type { Profile } from '../lib/supabase';

type Status = 'not_started' | 'in_progress' | 'done';
type Priority = 'Low' | 'Medium' | 'High';
type BoardView = 'board' | 'list' | 'timeline';
type PopoverKey = 'status' | 'assignee' | 'priority' | 'date' | null;
type AppTab = 'home' | 'network' | 'rank' | 'messages' | 'profile' | 'tools';

interface TodoItem {
  id: number;
  text: string;
  done: boolean;
}

interface ProjectCard {
  id: number;
  title: string;
  status: Status;
  priority: Priority;
  icon: 'wrench' | 'rocket' | 'flask';
  assignee: string | null;
  endDate: string | null;
  about: string;
  todos: TodoItem[];
  comments: string[];
}

const LANES: { key: Status; label: string; dot: string; tint: string }[] = [
  { key: 'not_started', label: 'Backlog', dot: '#9ca3af', tint: 'rgba(156, 163, 175, 0.08)' },
  { key: 'in_progress', label: 'Building', dot: '#7c3aed', tint: 'rgba(124, 58, 237, 0.06)' },
  { key: 'done', label: 'Shipped', dot: '#059669', tint: 'rgba(5, 150, 105, 0.07)' },
];

const PRIORITY_META: Record<Priority, { bg: string; color: string; stripe: string }> = {
  Low: { bg: 'rgba(5, 150, 105, 0.12)', color: '#047857', stripe: '#059669' },
  Medium: { bg: 'rgba(217, 119, 6, 0.14)', color: '#b45309', stripe: '#d97706' },
  High: { bg: 'rgba(220, 38, 38, 0.12)', color: '#dc2626', stripe: '#dc2626' },
};

const ICONS = { wrench: Wrench, rocket: Rocket, flask: FlaskConical };

const emptyProject = (id: number, status: Status): ProjectCard => ({
  id,
  title: 'Untitled build',
  status,
  priority: 'Medium',
  icon: 'wrench',
  assignee: null,
  endDate: null,
  about: '',
  todos: [{ id: 1, text: 'First step', done: false }],
  comments: [],
});

const INITIAL_PROJECTS: ProjectCard[] = [
  { ...emptyProject(1, 'not_started'), title: 'Portfolio site rebuild', icon: 'wrench' },
  { ...emptyProject(2, 'in_progress'), title: 'CNN from scratch in NumPy', priority: 'High', icon: 'flask' },
  { ...emptyProject(3, 'done'), title: 'Open-source PR: docs fix', priority: 'Low', icon: 'rocket' },
];

const BOARD_VIEWS: { key: BoardView; label: string }[] = [
  { key: 'board', label: 'Board' },
  { key: 'list', label: 'List' },
  { key: 'timeline', label: 'Timeline' },
];

const VIEW_SETTINGS_ROWS = [
  { icon: LayoutGrid, label: 'Layout', value: 'Board' },
  { icon: Eye, label: 'Property visibility', value: '3' },
  { icon: ListFilter, label: 'Filter', value: '' },
  { icon: ArrowUpDown, label: 'Sort', value: '' },
  { icon: Rows3, label: 'Group', value: 'Status' },
  { icon: Layers, label: 'Sub-group', value: '' },
  { icon: Palette, label: 'Conditional color', value: '' },
  { icon: Link2, label: 'Copy link to view', value: '' },
];

const DATA_SOURCE_ROWS = [
  { icon: Database, label: 'Source', value: 'My builds' },
  { icon: ListChecks, label: 'Edit properties', value: '' },
  { icon: Zap, label: 'Automations', value: '' },
  { icon: Sparkles, label: 'AI Autofill', value: '' },
  { icon: Settings2, label: 'More settings', value: '' },
];

const MANAGE_ROWS = [
  { icon: Database, label: 'Manage data sources' },
  { icon: Lock, label: 'Lock board' },
  { icon: CalendarDays, label: 'Open in Calendar' },
];

const ATTACHMENT_ROWS = [
  { icon: HardDrive, label: 'Attach Drive file' },
  { icon: FileType, label: 'Attach PDF' },
  { icon: Figma, label: 'Attach design file' },
];

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function buildCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

interface ToolsViewProps {
  profile: Profile;
  setActiveTab: (tab: AppTab) => void;
}

export default function ToolsView({ profile, setActiveTab }: ToolsViewProps) {
  const [projects, setProjects] = useState<ProjectCard[]>(INITIAL_PROJECTS);
  const [addingIn, setAddingIn] = useState<Status | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [activeView, setActiveView] = useState<BoardView>('board');
  const [viewSettingsOpen, setViewSettingsOpen] = useState(false);
  const [openProjectId, setOpenProjectId] = useState<number | null>(null);
  const [openPopover, setOpenPopover] = useState<PopoverKey>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const openProject = projects.find(p => p.id === openProjectId) ?? null;

  const updateProject = (id: number, patch: Partial<ProjectCard>) => {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  };

  const startAdding = (status: Status) => {
    setAddingIn(status);
    setDraftTitle('');
  };

  const submitNewProject = (e: FormEvent, status: Status) => {
    e.preventDefault();
    const title = draftTitle.trim();
    if (!title) {
      setAddingIn(null);
      return;
    }
    setProjects(prev => [...prev, { ...emptyProject(Date.now(), status), title }]);
    setAddingIn(null);
    setDraftTitle('');
  };

  const createAndOpenProject = () => {
    const id = Date.now();
    setProjects(prev => [...prev, emptyProject(id, 'not_started')]);
    setOpenProjectId(id);
    setOpenPopover(null);
  };

  const toggleTodo = (todoId: number) => {
    if (!openProject) return;
    updateProject(openProject.id, {
      todos: openProject.todos.map(t => (t.id === todoId ? { ...t, done: !t.done } : t)),
    });
  };

  const submitComment = (e: FormEvent) => {
    e.preventDefault();
    if (!openProject || !commentDraft.trim()) return;
    updateProject(openProject.id, { comments: [...openProject.comments, commentDraft.trim()] });
    setCommentDraft('');
  };

  const pickDate = (day: number) => {
    if (!openProject) return;
    const iso = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    updateProject(openProject.id, { endDate: iso });
    setOpenPopover(null);
  };

  const total = projects.length;
  const building = projects.filter(p => p.status === 'in_progress').length;
  const shipped = projects.filter(p => p.status === 'done').length;
  const shippedPct = total ? Math.round((shipped / total) * 100) : 0;

  return (
    <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: 'var(--color-bg-home)', position: 'relative' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>

        {/* Header */}
        <div>
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 600,
              padding: '0 0 10px', transition: 'opacity 0.2s',
            }}
          >
            <ArrowLeft size={15} />
            Back to feed
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '52px', height: '52px', borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, var(--color-primary), #a78bfa)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: '0 6px 16px rgba(124, 58, 237, 0.25)',
                }}
              >
                <Hammer size={24} color="var(--color-on-primary)" />
              </div>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--color-text-strong)', margin: 0, lineHeight: 1.1 }}>
                  Tools
                </h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted-light)', margin: '2px 0 0' }}>
                  Your private build tracker — plan it, build it, ship it.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={createAndOpenProject}
              className="feed-post-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', fontSize: '0.85rem' }}
            >
              <Plus size={15} />
              New build
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            { label: 'Total builds', value: String(total), accent: 'var(--color-text-strong)' },
            { label: 'In the shop', value: String(building), accent: 'var(--color-primary)' },
            { label: 'Shipped', value: `${shipped} · ${shippedPct}%`, accent: '#059669' },
          ].map(stat => (
            <div
              key={stat.label}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 18px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted-light)' }}>
                {stat.label}
              </span>
              <span style={{ fontFamily: 'var(--font-specialty)', fontSize: '2rem', lineHeight: 1, color: stat.accent }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* View switcher + tools */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            {BOARD_VIEWS.map(view => {
              const active = activeView === view.key;
              return (
                <button
                  key={view.key}
                  type="button"
                  className={`feed-filter-btn ${active ? 'active' : ''}`}
                  onClick={() => setActiveView(view.key)}
                >
                  {view.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[ListFilter, ArrowUpDown].map((Icon, idx) => (
              <button
                key={idx}
                type="button"
                style={{
                  width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: 'none', borderRadius: '8px',
                  color: 'var(--color-text-muted-light)', cursor: 'pointer',
                }}
              >
                <Icon size={15} />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setViewSettingsOpen(v => !v)}
              aria-expanded={viewSettingsOpen}
              style={{
                width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: viewSettingsOpen ? 'var(--color-primary-soft)' : 'none',
                border: 'none', borderRadius: '8px',
                color: viewSettingsOpen ? 'var(--color-primary)' : 'var(--color-text-muted-light)',
                cursor: 'pointer',
              }}
            >
              <SlidersHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* Board */}
        {activeView !== 'board' ? (
          <div
            key={activeView}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '70px 20px', gap: '12px', color: 'var(--color-text-muted-light)',
              background: 'var(--color-surface)', border: '1px dashed var(--color-dark-border)',
              borderRadius: 'var(--radius-lg)', animation: 'fadeIn 0.25s ease',
            }}
          >
            <Wrench size={34} style={{ color: 'var(--color-primary)' }} />
            <p style={{ fontSize: '0.88rem' }}>
              {activeView === 'list' ? 'List view' : 'Timeline view'} is on the workbench — coming soon.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', alignItems: 'start' }}>
            {LANES.map(lane => {
              const laneProjects = projects.filter(p => p.status === lane.key);
              return (
                <section
                  key={lane.key}
                  style={{
                    background: lane.tint,
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <header style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 2px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: lane.dot }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>
                      {lane.label}
                    </span>
                    <span
                      style={{
                        marginLeft: 'auto', minWidth: '22px', textAlign: 'center',
                        fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted-light)',
                        background: 'var(--color-surface)', border: '1px solid var(--color-dark-border)',
                        borderRadius: '10px', padding: '1px 7px',
                      }}
                    >
                      {laneProjects.length}
                    </span>
                  </header>

                  {laneProjects.map(p => {
                    const Icon = ICONS[p.icon];
                    const prio = PRIORITY_META[p.priority];
                    const doneCount = p.todos.filter(t => t.done).length;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setOpenProjectId(p.id)}
                        className="tools-card"
                        style={{
                          position: 'relative',
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px 14px 12px 18px',
                          boxShadow: 'var(--shadow-sm)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          overflow: 'hidden',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                        }}
                      >
                        <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: prio.stripe, borderRadius: '4px 0 0 4px' }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
                              background: 'var(--color-primary-soft)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <Icon size={14} style={{ color: 'var(--color-primary)' }} />
                          </span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-strong)', lineHeight: 1.3 }}>
                            {p.title}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 9px', borderRadius: '10px', background: prio.bg, color: prio.color, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Flag size={9} />
                            {p.priority}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>
                            {doneCount}/{p.todos.length} steps
                          </span>
                          {p.endDate && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted-light)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <CalendarDays size={10} />
                              {formatDate(p.endDate)}
                            </span>
                          )}
                          {p.assignee && (
                            <span style={{ marginLeft: 'auto', display: 'inline-flex' }}>
                              <Avatar name={p.assignee} size={18} />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {addingIn === lane.key ? (
                    <form
                      onSubmit={e => submitNewProject(e, lane.key)}
                      style={{ display: 'flex', gap: '6px', alignItems: 'center', animation: 'fadeIn 0.15s ease' }}
                    >
                      <input
                        autoFocus
                        value={draftTitle}
                        onChange={e => setDraftTitle(e.target.value)}
                        onBlur={() => { if (!draftTitle.trim()) setAddingIn(null); }}
                        placeholder="Name your build..."
                        maxLength={120}
                        style={{
                          flex: 1, padding: '9px 12px', borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-primary)', outline: 'none',
                          fontSize: '0.85rem', background: 'var(--color-surface)', color: 'var(--color-text-light)',
                          boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.08)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setAddingIn(null)}
                        aria-label="Cancel"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted-light)', display: 'flex' }}
                      >
                        <X size={16} />
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startAdding(lane.key)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        background: 'none', border: '1px dashed var(--color-dark-border)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-text-muted-light)', fontSize: '0.8rem', fontWeight: 600,
                        cursor: 'pointer', padding: '9px', transition: 'var(--transition)',
                      }}
                    >
                      <Plus size={14} />
                      Add build
                    </button>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* View settings panel */}
      {viewSettingsOpen && (
        <>
          <div onClick={() => setViewSettingsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div
            style={{
              position: 'absolute',
              top: '218px',
              right: 'max(32px, calc((100% - 1100px) / 2))',
              width: '260px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 50,
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              animation: 'slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>View settings</span>
              <button
                type="button"
                onClick={() => setViewSettingsOpen(false)}
                aria-label="Close view settings"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted-light)', display: 'flex' }}
              >
                <X size={14} />
              </button>
            </div>

            {VIEW_SETTINGS_ROWS.map(row => (
              <div key={row.label} style={settingsRowStyle}>
                <row.icon size={13} style={{ color: 'var(--color-text-muted-light)', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{row.label}</span>
                {row.value && <span style={{ color: 'var(--color-text-muted-light)', fontSize: '0.74rem' }}>{row.value}</span>}
              </div>
            ))}

            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted-light)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 4px 2px' }}>
              Data source
            </div>

            {DATA_SOURCE_ROWS.map(row => (
              <div key={row.label} style={settingsRowStyle}>
                <row.icon size={13} style={{ color: 'var(--color-text-muted-light)', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{row.label}</span>
                {row.value && <span style={{ color: 'var(--color-text-muted-light)', fontSize: '0.74rem' }}>{row.value}</span>}
              </div>
            ))}

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-dark-border)', margin: '4px 0 2px' }} />

            {MANAGE_ROWS.map(row => (
              <div key={row.label} style={settingsRowStyle}>
                <row.icon size={13} style={{ color: 'var(--color-text-muted-light)', flexShrink: 0 }} />
                <span>{row.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Build detail slide-over */}
      {openProject && (
        <>
          <div
            onClick={() => { setOpenProjectId(null); setOpenPopover(null); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.25)', zIndex: 60, animation: 'fadeIn 0.2s ease' }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: 'min(470px, 92vw)',
              height: '100vh',
              background: 'var(--color-surface)',
              borderLeft: '1px solid var(--color-dark-border)',
              boxShadow: '-12px 0 30px rgba(15, 23, 42, 0.12)',
              zIndex: 61,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInPanel 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            }}
          >
            {/* Panel header band */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--color-dark-border)',
                background: 'linear-gradient(135deg, var(--color-primary-soft), var(--color-surface))',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span
                style={{
                  width: '40px', height: '40px', borderRadius: 'var(--radius-md)', flexShrink: 0,
                  background: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {(() => { const Icon = ICONS[openProject.icon]; return <Icon size={19} color="var(--color-on-primary)" />; })()}
              </span>
              <input
                value={openProject.title}
                onChange={e => updateProject(openProject.id, { title: e.target.value })}
                placeholder="Untitled build"
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.35rem',
                  color: 'var(--color-text-strong)',
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  padding: '2px 0',
                  minWidth: 0,
                }}
              />
              <button
                type="button"
                onClick={() => { setOpenProjectId(null); setOpenPopover(null); }}
                aria-label="Close build details"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted-light)', display: 'flex', padding: '4px', flexShrink: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px' }}>
              {/* Properties */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                  <span style={propLabelStyle}>Stage</span>
                  <button
                    type="button"
                    onClick={() => setOpenPopover(v => (v === 'status' ? null : 'status'))}
                    style={propChipStyle}
                  >
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: LANES.find(l => l.key === openProject.status)?.dot }} />
                    {LANES.find(l => l.key === openProject.status)?.label}
                  </button>
                  {openPopover === 'status' && (
                    <div style={popoverStyle}>
                      {LANES.map(lane => (
                        <button
                          key={lane.key}
                          type="button"
                          onClick={() => { updateProject(openProject.id, { status: lane.key }); setOpenPopover(null); }}
                          style={popoverRowStyle}
                        >
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: lane.dot }} />
                          {lane.label}
                          {openProject.status === lane.key && <Check size={12} style={{ marginLeft: 'auto', color: 'var(--color-primary)' }} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assignee */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                  <span style={propLabelStyle}>Owner</span>
                  <button
                    type="button"
                    onClick={() => setOpenPopover(v => (v === 'assignee' ? null : 'assignee'))}
                    style={{ ...propChipStyle, color: openProject.assignee ? 'var(--color-text-light)' : 'var(--color-text-muted-light)' }}
                  >
                    {openProject.assignee ? (
                      <>
                        <Avatar name={openProject.assignee} size={16} />
                        {openProject.assignee}
                      </>
                    ) : 'Unassigned'}
                  </button>
                  {openPopover === 'assignee' && (
                    <div style={{ ...popoverStyle, width: '220px' }}>
                      <div style={{ padding: '4px 8px 8px', fontSize: '0.72rem', color: 'var(--color-text-muted-light)' }}>
                        Pick an owner
                      </div>
                      <button
                        type="button"
                        onClick={() => { updateProject(openProject.id, { assignee: profile.full_name }); setOpenPopover(null); }}
                        style={popoverRowStyle}
                      >
                        <Avatar name={profile.full_name} size={18} />
                        {profile.full_name} (You)
                        {openProject.assignee === profile.full_name && <Check size={12} style={{ marginLeft: 'auto', color: 'var(--color-primary)' }} />}
                      </button>
                      {openProject.assignee && (
                        <button
                          type="button"
                          onClick={() => { updateProject(openProject.id, { assignee: null }); setOpenPopover(null); }}
                          style={{ ...popoverRowStyle, color: 'var(--color-danger)' }}
                        >
                          <X size={13} />
                          Clear owner
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                  <span style={propLabelStyle}>Priority</span>
                  <button
                    type="button"
                    onClick={() => setOpenPopover(v => (v === 'priority' ? null : 'priority'))}
                    style={{
                      padding: '3px 10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      fontSize: '0.76rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: PRIORITY_META[openProject.priority].bg,
                      color: PRIORITY_META[openProject.priority].color,
                    }}
                  >
                    <Flag size={10} />
                    {openProject.priority}
                  </button>
                  {openPopover === 'priority' && (
                    <div style={popoverStyle}>
                      {(['High', 'Medium', 'Low'] as Priority[]).map(pr => (
                        <button
                          key={pr}
                          type="button"
                          onClick={() => { updateProject(openProject.id, { priority: pr }); setOpenPopover(null); }}
                          style={popoverRowStyle}
                        >
                          <span style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 700, background: PRIORITY_META[pr].bg, color: PRIORITY_META[pr].color }}>
                            {pr}
                          </span>
                          {openProject.priority === pr && <Check size={12} style={{ marginLeft: 'auto', color: 'var(--color-primary)' }} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Target date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                  <span style={propLabelStyle}>Target date</span>
                  <button
                    type="button"
                    onClick={() => setOpenPopover(v => (v === 'date' ? null : 'date'))}
                    style={{ ...propChipStyle, color: openProject.endDate ? 'var(--color-text-light)' : 'var(--color-text-muted-light)' }}
                  >
                    <CalendarDays size={13} />
                    {formatDate(openProject.endDate) ?? 'No date'}
                  </button>
                  {openPopover === 'date' && (
                    <div style={{ ...popoverStyle, width: '260px', padding: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <button type="button" onClick={() => setCalendarMonth(m => m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 })} style={iconBtnStyle}>
                          <ChevronLeft size={14} />
                        </button>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-strong)' }}>
                          {new Date(calendarMonth.year, calendarMonth.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </span>
                        <button type="button" onClick={() => setCalendarMonth(m => m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 })} style={iconBtnStyle}>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', fontSize: '0.66rem', color: 'var(--color-text-muted-light)', marginBottom: '4px', textAlign: 'center' }}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                        {buildCalendarDays(calendarMonth.year, calendarMonth.month).map((day, idx) => {
                          if (day === null) return <span key={idx} />;
                          const iso = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const selected = openProject.endDate === iso;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => pickDate(day)}
                              style={{
                                width: '26px', height: '26px', borderRadius: '50%', border: 'none',
                                background: selected ? 'var(--color-primary)' : 'none',
                                color: selected ? 'var(--color-on-primary)' : 'var(--color-text-light)',
                                fontSize: '0.74rem', cursor: 'pointer',
                              }}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                      {openProject.endDate && (
                        <button
                          type="button"
                          onClick={() => { updateProject(openProject.id, { endDate: null }); setOpenPopover(null); }}
                          style={{ marginTop: '8px', background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '0.76rem', cursor: 'pointer', padding: '4px 0' }}
                        >
                          Clear date
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-dark-border)', margin: '4px 0 20px' }} />

              {/* Blueprint (about) */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={sectionHeadingStyle}>The blueprint</h3>
                <textarea
                  value={openProject.about}
                  onChange={e => updateProject(openProject.id, { about: e.target.value })}
                  placeholder="What are you building, and why does it matter?"
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-dark-border)', outline: 'none', resize: 'vertical',
                    fontSize: '0.85rem', fontFamily: 'inherit', background: 'var(--color-surface-elevated)',
                    color: 'var(--color-text-light)',
                  }}
                />
              </div>

              {/* Build steps (todos) */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={sectionHeadingStyle}>
                  Build steps
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted-light)', marginLeft: '8px' }}>
                    {openProject.todos.filter(t => t.done).length}/{openProject.todos.length}
                  </span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {openProject.todos.map(todo => (
                    <label
                      key={todo.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        fontSize: '0.85rem', cursor: 'pointer',
                        padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-surface-elevated)',
                        border: '1px solid var(--color-dark-border)',
                        color: todo.done ? 'var(--color-text-muted-light)' : 'var(--color-text-light)',
                        textDecoration: todo.done ? 'line-through' : 'none',
                        transition: 'var(--transition)',
                      }}
                    >
                      <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} style={{ accentColor: 'var(--color-primary)' }} />
                      {todo.text}
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => updateProject(openProject.id, { todos: [...openProject.todos, { id: Date.now(), text: 'Next step', done: false }] })}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '4px 0' }}
                  >
                    <Plus size={13} />
                    Add step
                  </button>
                </div>
              </div>

              {/* Build log (comments) */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={sectionHeadingStyle}>
                  <MessageSquare size={14} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
                  Build log
                </h3>
                {openProject.comments.map((c, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} size={22} />
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', paddingTop: '2px' }}>{c}</span>
                  </div>
                ))}
                <form onSubmit={submitComment} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} size={22} />
                  <input
                    value={commentDraft}
                    onChange={e => setCommentDraft(e.target.value)}
                    placeholder="Log progress..."
                    maxLength={500}
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: '18px',
                      border: '1px solid var(--color-dark-border)', outline: 'none',
                      fontSize: '0.8rem', background: 'var(--color-surface-elevated)', color: 'var(--color-text-light)',
                    }}
                  />
                </form>
              </div>

              {/* Attachments */}
              <div>
                <h3 style={sectionHeadingStyle}>Attachments</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ATTACHMENT_ROWS.map(row => (
                    <button
                      key={row.label}
                      type="button"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px',
                        borderRadius: 'var(--radius-md)', border: '1px solid var(--color-dark-border)',
                        background: 'var(--color-surface)', cursor: 'pointer', textAlign: 'left',
                        fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)',
                        transition: 'var(--transition)',
                      }}
                    >
                      <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <row.icon size={14} style={{ color: 'var(--color-primary)' }} />
                      </span>
                      {row.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

const propLabelStyle: CSSProperties = {
  width: '90px',
  fontSize: '0.78rem',
  color: 'var(--color-text-muted-light)',
  flexShrink: 0,
};

const propChipStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '5px 12px',
  borderRadius: '16px',
  border: '1px solid var(--color-dark-border)',
  background: 'var(--color-surface-elevated)',
  color: 'var(--color-text-light)',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'var(--transition)',
};

const sectionHeadingStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.15rem',
  fontWeight: 500,
  color: 'var(--color-text-strong)',
  margin: '0 0 10px',
};

const settingsRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 4px',
  fontSize: '0.78rem',
  color: 'var(--color-text-light)',
  cursor: 'pointer',
  borderRadius: '5px',
};

const popoverStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: '90px',
  width: '190px',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-dark-border)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-lg)',
  zIndex: 70,
  padding: '6px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  animation: 'slideUp 0.15s cubic-bezier(0.4, 0, 0.2, 1) forwards',
};

const popoverRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 8px',
  borderRadius: '6px',
  border: 'none',
  background: 'none',
  fontSize: '0.8rem',
  color: 'var(--color-text-light)',
  cursor: 'pointer',
  textAlign: 'left',
};

const iconBtnStyle: CSSProperties = {
  width: '22px',
  height: '22px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'none',
  border: 'none',
  borderRadius: '5px',
  color: 'var(--color-text-muted-light)',
  cursor: 'pointer',
};
