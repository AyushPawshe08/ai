'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

/* ─── Example topics ─────────────────────────────────────── */
const EXAMPLES = [
  'The impact of quantum computing on cryptography',
  'Latest breakthroughs in CRISPR gene editing',
  'How large language models are trained',
  'Climate change mitigation strategies in 2025',
  'The rise of autonomous vehicles',
  'Neuroplasticity and lifelong learning',
]

/* ─── Helpers ────────────────────────────────────────────── */
function formatDate(iso) {
  const d = new Date(iso)
  const diffDays = Math.floor((new Date() - d) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ─── User dropdown ──────────────────────────────────────── */
function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??'

  return (
    <div className="user-menu" ref={ref}>
      <button id="user-menu-btn" className="user-avatar-btn" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="avatar-initials">{initials}</span>
        <span className="avatar-name">{user?.username ?? '…'}</span>
        <svg className={`avatar-chevron ${open ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="user-dropdown" role="menu">
          <div className="dropdown-info">
            <span className="dropdown-username">{user?.username}</span>
            <span className="dropdown-email">{user?.email}</span>
          </div>
          <div className="dropdown-divider" />
          <button id="signout-btn" className="dropdown-signout" onClick={onLogout} role="menuitem">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Sidebar ────────────────────────────────────────────── */
function Sidebar({ isOpen, onClose, history, historyLoading, activeId, onSelectHistory, onNewResearch }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return history
    const q = search.toLowerCase()
    return history.filter(h =>
      (h.title || h.topic || '').toLowerCase().includes(q)
    )
  }, [history, search])

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`rp-sidebar ${isOpen ? 'sidebar-open' : ''}`} aria-label="Research history">

        {/* ── New Research button ─────────────────────────── */}
        <div className="sidebar-top">
          <button
            id="new-research-btn"
            className="new-research-btn"
            onClick={() => { onNewResearch(); onClose() }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Research
          </button>
        </div>

        {/* ── Search bar ──────────────────────────────────── */}
        <div className="sidebar-search-wrap">
          <svg className="sidebar-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            id="history-search"
            className="sidebar-search-input"
            type="text"
            placeholder="Search history…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoComplete="off"
          />
          {search && (
            <button className="sidebar-search-clear" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
          )}
        </div>

        {/* ── History label ───────────────────────────────── */}
        <div className="sidebar-section-label">
          <span>Recent</span>
          {!historyLoading && history.length > 0 && (
            <span className="sidebar-count">{history.length}</span>
          )}
        </div>

        {/* ── History list ────────────────────────────────── */}
        <div className="sidebar-list">
          {historyLoading && (
            <>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="history-skel">
                  <div className="skel hs-title" />
                  <div className="skel hs-date" />
                </div>
              ))}
            </>
          )}

          {!historyLoading && history.length === 0 && (
            <div className="sidebar-empty">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span>No research yet</span>
              <span className="sidebar-empty-sub">Your searches will appear here</span>
            </div>
          )}

          {!historyLoading && history.length > 0 && filtered.length === 0 && (
            <div className="sidebar-empty">
              <span>No matches for &ldquo;{search}&rdquo;</span>
            </div>
          )}

          {!historyLoading && filtered.map(item => (
            <button
              key={item.public_id}
              className={`history-item ${activeId === item.public_id ? 'history-item-active' : ''}`}
              onClick={() => { onSelectHistory(item.public_id); onClose() }}
            >
              <span className="history-item-title">{item.title || item.topic}</span>
              <span className="history-item-date">{formatDate(item.created_at)}</span>
            </button>
          ))}
        </div>

        {/* ── Mobile close button (bottom) ────────────────── */}
        <button className="sidebar-close-bottom" onClick={onClose} aria-label="Close sidebar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
          Close
        </button>
      </aside>
    </>
  )
}

/* ─── Report section wrapper ─────────────────────────────── */
function ReportSection({ title, icon, children }) {
  return (
    <section className="report-section">
      <h2 className="section-title"><span className="section-icon">{icon}</span>{title}</h2>
      {children}
    </section>
  )
}

/* ─── Full report renderer ───────────────────────────────── */
/* ─── Inline markdown formatter ──────────────────────────── */
function formatMarkdownInline(text) {
  if (!text) return '';
  
  // Check if string starts with **Heading**: or **Heading**
  const headingRegex = /^\*\*(.*?)\*\*(:?)\s*(.*)/;
  const match = text.match(headingRegex);
  
  if (match) {
    const heading = match[1];
    const colon = match[2];
    const rest = match[3];
    
    return (
      <>
        <span style={{ textDecoration: 'underline', fontWeight: '500' }}>{heading}</span>
        {colon && <span style={{ marginRight: '4px' }}>{colon}</span>}
        <span>{rest}</span>
      </>
    );
  }
  
  // Replace inline bold formatting with underlined spans
  const parts = text.split(/\*\*(.*?)\*\*/g);
  if (parts.length > 1) {
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <span key={i} style={{ textDecoration: 'underline', fontWeight: '500' }}>{part}</span>;
      }
      return part;
    });
  }
  
  return text;
}

/* ─── Block markdown text formatter ──────────────────────── */
function formatMarkdownText(text, isHighlight = false) {
  if (!text) return null;
  
  const lines = text.split('\n');
  
  return lines.map((line, idx) => {
    if (!line.trim()) return null;
    
    const headingRegex = /^\*\*(.*?)\*\*(:?)\s*(.*)/;
    const match = line.match(headingRegex);
    
    if (match) {
      const heading = match[1];
      const colon = match[2];
      const rest = match[3];
      
      return (
        <p key={idx} className={isHighlight ? "prose highlight" : "prose"} style={{ marginBottom: '12px' }}>
          <span style={{ textDecoration: 'underline', fontWeight: '500' }}>{heading}</span>
          {colon && <span style={{ marginRight: '4px' }}>{colon}</span>}
          {rest}
        </p>
      );
    }
    
    const parts = line.split(/\*\*(.*?)\*\*/g);
    if (parts.length > 1) {
      return (
        <p key={idx} className={isHighlight ? "prose highlight" : "prose"} style={{ marginBottom: '12px' }}>
          {parts.map((part, i) => {
            if (i % 2 === 1) {
              return <span key={i} style={{ textDecoration: 'underline', fontWeight: '500' }}>{part}</span>;
            }
            return part;
          })}
        </p>
      );
    }
    
    return (
      <p key={idx} className={isHighlight ? "prose highlight" : "prose"} style={{ marginBottom: '12px' }}>
        {line}
      </p>
    );
  });
}

/* ─── Full report renderer ───────────────────────────────── */
function ResearchReport({ data }) {
  const { report, critic_feedback, credits_remaining } = data
  return (
    <div className="report-root animate-report-reveal">
      <div className="report-header">
        <div className="report-badge">Research Report</div>
        <h1 className="report-title">{report.title}</h1>
        <p className="report-query">Query: {report.query}</p>
        {credits_remaining !== undefined && (
          <span className="credits-badge">{credits_remaining} credits remaining</span>
        )}
      </div>

      <ReportSection title="Executive Summary" icon="◈">
        {formatMarkdownText(report.executive_summary)}
      </ReportSection>

      <ReportSection title="Introduction" icon="◉">
        {formatMarkdownText(report.introduction)}
      </ReportSection>

      {report.key_findings?.length > 0 && (
        <ReportSection title="Key Findings" icon="✦">
          <ul className="findings-list">
            {report.key_findings.map((f, i) => (
              <li key={i} className="finding-item">
                <span className="finding-num">{String(i + 1).padStart(2, '0')}</span>
                <span>{formatMarkdownInline(f)}</span>
              </li>
            ))}
          </ul>
        </ReportSection>
      )}

      <ReportSection title="Detailed Analysis" icon="◎">
        {formatMarkdownText(report.detailed_analysis)}
      </ReportSection>

      {report.important_statistics?.length > 0 && (
        <ReportSection title="Key Statistics" icon="◆">
          <div className="stats-grid">
            {report.important_statistics.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-value">{s.value}</div>
                <div className="stat-metric">{s.metric}</div>
                <div className="stat-context">{s.context}</div>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {report.timeline?.length > 0 && (
        <ReportSection title="Timeline" icon="◐">
          <div className="timeline">
            {report.timeline.map((t, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-year">{t.year}</div>
                <div className="timeline-dot" />
                <div className="timeline-event">{formatMarkdownInline(t.event)}</div>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {(report.advantages?.length > 0 || report.disadvantages?.length > 0) && (
        <ReportSection title="Pros & Cons" icon="⊕">
          <div className="pros-cons-grid">
            {report.advantages?.length > 0 && (
              <div className="pros-col">
                <div className="pros-label">Advantages</div>
                <ul className="bullet-list">
                  {report.advantages.map((a, i) => <li key={i}><span className="bullet-dot pros" />{formatMarkdownInline(a)}</li>)}
                </ul>
              </div>
            )}
            {report.disadvantages?.length > 0 && (
              <div className="cons-col">
                <div className="cons-label">Disadvantages</div>
                <ul className="bullet-list">
                  {report.disadvantages.map((d, i) => <li key={i}><span className="bullet-dot cons" />{formatMarkdownInline(d)}</li>)}
                </ul>
              </div>
            )}
          </div>
        </ReportSection>
      )}

      {report.expert_opinions?.length > 0 && (
        <ReportSection title="Expert Opinions" icon="◇">
          <div className="opinions-list">
            {report.expert_opinions.map((o, i) => (
              <div key={i} className="opinion-card">
                <blockquote className="opinion-text">&ldquo;{o.opinion}&rdquo;</blockquote>
                <cite className="opinion-source">— {o.source}</cite>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {report.recent_developments?.length > 0 && (
        <ReportSection title="Recent Developments" icon="◈">
          <ul className="simple-list">{report.recent_developments.map((d, i) => <li key={i}>{formatMarkdownInline(d)}</li>)}</ul>
        </ReportSection>
      )}

      {report.challenges?.length > 0 && (
        <ReportSection title="Challenges" icon="△">
          <ul className="simple-list warn">{report.challenges.map((c, i) => <li key={i}>{formatMarkdownInline(c)}</li>)}</ul>
        </ReportSection>
      )}

      {report.future_outlook && (
        <ReportSection title="Future Outlook" icon="◉">
          {formatMarkdownText(report.future_outlook)}
        </ReportSection>
      )}

      <ReportSection title="Conclusion" icon="◈">
        {formatMarkdownText(report.conclusion, true)}
      </ReportSection>

      {report.suggested_followup_questions?.length > 0 && (
        <ReportSection title="Follow-up Questions" icon="?">
          <div className="followup-chips">
            {report.suggested_followup_questions.map((q, i) => (
              <span key={i} className="followup-chip">{q}</span>
            ))}
          </div>
        </ReportSection>
      )}

      {report.references?.length > 0 && (
        <ReportSection title="References" icon="⊞">
          <ol className="references-list">
            {report.references.map((r, i) => (
              <li key={i} className="reference-item">
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="ref-link">{r.title}</a>
                <span className="ref-source">{r.source}</span>
              </li>
            ))}
          </ol>
        </ReportSection>
      )}

      {critic_feedback && (
        <div className="critic-box">
          <span className="critic-label">AI Critic Feedback</span>
          <p className="critic-text">{critic_feedback}</p>
        </div>
      )}
    </div>
  )
}

/* ─── Skeleton loader ────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="skeleton-root">
      <div className="skeleton-header">
        <div className="skel skel-badge" />
        <div className="skel skel-title" />
        <div className="skel skel-sub" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-section">
          <div className="skel skel-section-title" />
          <div className="skel skel-line" />
          <div className="skel skel-line short" />
          <div className="skel skel-line" />
        </div>
      ))}
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────── */
export default function ResearchPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Open sidebar by default on desktop
  useEffect(() => {
    if (window.innerWidth >= 900) setSidebarOpen(true)
  }, [])
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const reportRef = useRef(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (!d.error) setUser(d) }).catch(() => {})
  }, [])

  const loadHistory = useCallback(() => {
    setHistoryLoading(true)
    fetch('/api/research/history')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setHistory(d) })
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
  }, [])

  useEffect(() => { loadHistory() }, [loadHistory])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const handleNewResearch = () => {
    setResult(null)
    setError('')
    setQuery('')
    setActiveId(null)
  }

  const handleSelectHistory = async (publicId) => {
    setActiveId(publicId)
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const res = await fetch(`/api/research/${publicId}`)
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Failed to load research')
      else {
        setResult(data)
        setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      }
    } catch { setError('Something went wrong.') }
    finally { setLoading(false) }
  }

  const handleResearch = async (topic) => {
    const q = topic || query
    if (!q.trim()) return
    setQuery(q)
    setLoading(true)
    setResult(null)
    setError('')
    setActiveId(null)
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: q.trim() }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Research failed. Please try again.')
      else {
        setResult(data)
        setActiveId(data.public_id)
        loadHistory()
        setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      }
    } catch { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleResearch() }
  }

  return (
    <div className="rp-root">

      {/* ── Navbar ────────────────────────────────────────── */}
      <header className="rp-navbar">
        <div className="rp-navbar-left">
          {/* Hamburger — always visible, toggles sidebar on all screen sizes */}
          <button
            id="sidebar-toggle"
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="rp-brand">
            <span className="brand-icon">✦</span>
            <span className="brand-name">ResearchAI</span>
          </div>
        </div>
        <UserMenu user={user} onLogout={handleLogout} />
      </header>

      {/* ── Body ──────────────────────────────────────────── */}
      <div className="rp-body">

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          history={history}
          historyLoading={historyLoading}
          activeId={activeId}
          onSelectHistory={handleSelectHistory}
          onNewResearch={handleNewResearch}
        />

        <main className="rp-main">
          <div className={`rp-hero ${result || loading ? 'rp-hero-compact' : ''}`}>
            <h1 className="rp-headline">
              What do you want to <span className="accent-text">research</span>?
            </h1>
            <p className="rp-subline">Ask anything — get a structured, AI-powered deep dive.</p>

            <div className="search-wrap">
              <div className="search-box">
                <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  id="research-input"
                  className="search-input"
                  type="text"
                  placeholder="e.g. How does photosynthesis work at a molecular level?"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  autoComplete="off"
                  autoFocus
                />
                {query && (
                  <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear">✕</button>
                )}
              </div>
              <button
                id="research-submit"
                className="search-btn"
                onClick={() => handleResearch()}
                disabled={loading || !query.trim()}
              >
                {loading
                  ? <span className="spinner" />
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                }
              </button>
            </div>

            {!result && !loading && (
              <div className="examples-wrap">
                <span className="examples-label">Try an example</span>
                <div className="examples-row">
                  {EXAMPLES.map(ex => (
                    <button key={ex} className="example-chip" onClick={() => handleResearch(ex)}>{ex}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="error-box" role="alert" style={{ marginBottom: '24px' }}>
              <span className="error-icon">⚠</span>{error}
            </div>
          )}

          {loading && <Skeleton />}

          {result && <div ref={reportRef}><ResearchReport data={result} /></div>}
        </main>
      </div>
    </div>
  )
}
