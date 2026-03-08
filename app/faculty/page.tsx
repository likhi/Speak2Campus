'use client'

import React, { useEffect, useState } from 'react'

interface Faculty {
  id: number
  name: string
  designation: string
  department: string
  specialization?: string
  email?: string
  cabin?: string
  profile_photo?: string | null
}

const DEPARTMENTS = ['MCA', 'MBA', 'MCOM'] as const

const DEPT_META: Record<string, { label: string; gradient: string; badge: string; icon: string }> = {
  MCA: {
    label: 'Master of Computer Applications',
    gradient: 'from-blue-600 to-indigo-700',
    badge: 'bg-blue-100 text-blue-800',
    icon: '💻',
  },
  MBA: {
    label: 'Master of Business Administration',
    gradient: 'from-violet-600 to-purple-700',
    badge: 'bg-violet-100 text-violet-800',
    icon: '📊',
  },
  MCOM: {
    label: 'Master of Commerce',
    gradient: 'from-teal-500 to-cyan-700',
    badge: 'bg-teal-100 text-teal-800',
    icon: '🏛️',
  },
}

function SkeletonCard() {
  return (
    <div className="faculty-card animate-pulse">
      <div className="faculty-card-header">
        <div className="w-24 h-24 rounded-full bg-white/20 mx-auto mb-3" />
        <div className="h-4 bg-white/20 rounded w-3/4 mx-auto mb-2" />
        <div className="h-3 bg-white/15 rounded w-1/2 mx-auto" />
      </div>
      <div className="faculty-card-body">
        <div className="h-3 bg-gray-200 rounded w-full mb-2" />
        <div className="h-3 bg-gray-200 rounded w-4/5 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-3/5" />
      </div>
    </div>
  )
}

export default function FacultyPage() {
  const [data, setData] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<string>('ALL')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/api/faculty')
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return
        setData(Array.isArray(json) ? json : [])
      })
      .catch((err) => {
        console.error('Error loading faculty:', err)
        if (!mounted) return
        setError('Failed to load faculty data')
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  const grouped = DEPARTMENTS.reduce<Record<string, Faculty[]>>((acc, dept) => {
    acc[dept] = data.filter((f) => (f.department || '').toUpperCase() === dept)
    return acc
  }, {})

  const tabs = ['ALL', ...DEPARTMENTS.filter((d) => (grouped[d] || []).length > 0)]

  const displayDepts =
    activeTab === 'ALL'
      ? DEPARTMENTS.filter((d) => (grouped[d] || []).length > 0)
      : [activeTab as typeof DEPARTMENTS[number]]

  return (
    <>
      <style>{`
        /* ── Hero ── */
        .faculty-hero {
          background: linear-gradient(135deg, oklch(0.25 0.08 250) 0%, oklch(0.35 0.15 250) 45%, oklch(0.42 0.18 220) 100%);
          padding: 4rem 1.5rem 6rem;
          position: relative;
          overflow: hidden;
        }
        .faculty-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 80% 20%, oklch(0.55 0.18 250 / 0.25) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 50% at 10% 80%, oklch(0.55 0.15 180 / 0.2) 0%, transparent 70%);
        }
        .faculty-hero::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0; right: 0;
          height: 80px;
          background: linear-gradient(to bottom, transparent, oklch(0.98 0.01 250));
        }
        .dark .faculty-hero::after {
          background: linear-gradient(to bottom, transparent, oklch(0.13 0.02 250));
        }
        .hero-title {
          color: #fff;
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          position: relative;
          z-index: 1;
        }
        .hero-subtitle {
          color: oklch(0.85 0.05 250);
          font-size: 1.1rem;
          margin-top: 0.75rem;
          position: relative;
          z-index: 1;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: oklch(0.55 0.18 250 / 0.25);
          border: 1px solid oklch(0.65 0.15 250 / 0.4);
          border-radius: 99px;
          padding: 0.35rem 0.9rem;
          color: #fff;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
        }
        .hero-stats {
          display: flex;
          gap: 2.5rem;
          margin-top: 2rem;
          position: relative;
          z-index: 1;
        }
        .hero-stat-num {
          color: #fff;
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
        }
        .hero-stat-label {
          color: oklch(0.8 0.05 250);
          font-size: 0.78rem;
          font-weight: 500;
          margin-top: 0.25rem;
        }

        /* ── Tabs ── */
        .faculty-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding: 1.5rem 1.5rem 0;
          max-width: 1200px;
          margin: 0 auto;
        }
        .faculty-tab {
          padding: 0.5rem 1.25rem;
          border-radius: 99px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s ease;
          background: oklch(0.94 0.01 250);
          color: oklch(0.35 0.05 250);
          outline: none;
        }
        .faculty-tab:hover {
          background: oklch(0.88 0.04 250);
          border-color: oklch(0.55 0.15 250 / 0.3);
        }
        .faculty-tab.active {
          background: oklch(0.45 0.15 250);
          color: #fff;
          border-color: oklch(0.45 0.15 250);
          box-shadow: 0 4px 14px oklch(0.45 0.15 250 / 0.35);
        }
        .dark .faculty-tab {
          background: oklch(0.22 0.03 250);
          color: oklch(0.75 0.05 250);
        }
        .dark .faculty-tab:hover {
          background: oklch(0.28 0.04 250);
        }
        .dark .faculty-tab.active {
          background: oklch(0.55 0.18 250);
          color: #fff;
        }

        /* ── Section ── */
        .faculty-section {
          padding: 2rem 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .dept-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .dept-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          background: oklch(0.45 0.15 250 / 0.1);
          border: 1.5px solid oklch(0.45 0.15 250 / 0.2);
        }
        .dept-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: oklch(0.2 0.04 250);
          letter-spacing: -0.02em;
        }
        .dark .dept-title { color: oklch(0.92 0.02 250); }
        .dept-subtitle {
          font-size: 0.8rem;
          color: oklch(0.5 0.03 250);
          margin-top: 0.1rem;
        }
        .dept-count {
          margin-left: auto;
          background: oklch(0.45 0.15 250 / 0.1);
          color: oklch(0.4 0.12 250);
          border: 1.5px solid oklch(0.45 0.15 250 / 0.2);
          border-radius: 99px;
          padding: 0.25rem 0.85rem;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .dark .dept-count {
          background: oklch(0.55 0.18 250 / 0.15);
          color: oklch(0.7 0.12 250);
        }

        /* ── Grid ── */
        .faculty-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        /* ── Card ── */
        .faculty-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 12px oklch(0.45 0.15 250 / 0.08), 0 1px 3px oklch(0 0 0 / 0.06);
          border: 1.5px solid oklch(0.9 0.02 250);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          position: relative;
        }
        .faculty-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 40px oklch(0.45 0.15 250 / 0.2), 0 8px 16px oklch(0 0 0 / 0.08);
          border-color: oklch(0.65 0.12 250 / 0.4);
        }
        .dark .faculty-card {
          background: oklch(0.18 0.02 250);
          border-color: oklch(0.28 0.03 250);
          box-shadow: 0 2px 12px oklch(0 0 0 / 0.3);
        }
        .dark .faculty-card:hover {
          box-shadow: 0 20px 40px oklch(0.55 0.18 250 / 0.2), 0 8px 16px oklch(0 0 0 / 0.3);
          border-color: oklch(0.55 0.15 250 / 0.4);
        }

        /* Card header gradient */
        .faculty-card-header {
          padding: 2rem 1.25rem 1.5rem;
          text-align: center;
          position: relative;
        }
        .faculty-card-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg, oklch(0.45 0.15 250) 0%, oklch(0.35 0.18 240) 100%);
          opacity: 1;
        }
        .faculty-card-header.mba::before {
          background: linear-gradient(160deg, oklch(0.42 0.2 280) 0%, oklch(0.32 0.22 270) 100%);
        }
        .faculty-card-header.mcom::before {
          background: linear-gradient(160deg, oklch(0.42 0.12 185) 0%, oklch(0.35 0.15 195) 100%);
        }

        /* Mesh overlay on card header */
        .faculty-card-header::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 70% 30%, oklch(1 0 0 / 0.08) 0%, transparent 60%);
        }

        .faculty-avatar-wrap {
          position: relative;
          display: inline-block;
          z-index: 1;
        }
        .faculty-avatar {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid oklch(1 0 0 / 0.3);
          display: block;
          box-shadow: 0 4px 16px oklch(0 0 0 / 0.25);
        }
        .faculty-status-dot {
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 12px;
          height: 12px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid #fff;
        }
        .faculty-card-name {
          position: relative;
          z-index: 1;
          color: #fff;
          font-size: 1.05rem;
          font-weight: 700;
          margin-top: 0.75rem;
          letter-spacing: -0.01em;
          text-shadow: 0 1px 3px oklch(0 0 0 / 0.2);
        }
        .faculty-card-designation {
          position: relative;
          z-index: 1;
          color: oklch(0.9 0.03 250);
          font-size: 0.75rem;
          font-weight: 500;
          margin-top: 0.2rem;
        }

        /* Card body */
        .faculty-card-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .faculty-info-row {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.82rem;
          color: oklch(0.4 0.03 250);
        }
        .dark .faculty-info-row { color: oklch(0.7 0.03 250); }
        .faculty-info-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: oklch(0.45 0.15 250 / 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.75rem;
        }
        .faculty-info-text {
          padding-top: 0.35rem;
          line-height: 1.3;
          word-break: break-all;
        }
        .faculty-dept-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.2rem 0.65rem;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: oklch(0.45 0.15 250 / 0.1);
          color: oklch(0.38 0.12 250);
          border: 1px solid oklch(0.45 0.15 250 / 0.2);
          margin-bottom: 0.4rem;
        }
        .dark .faculty-dept-chip {
          background: oklch(0.55 0.18 250 / 0.15);
          color: oklch(0.7 0.12 250);
        }
        .faculty-card-footer {
          padding: 0.75rem 1.25rem;
          border-top: 1px solid oklch(0.92 0.01 250);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .dark .faculty-card-footer {
          border-top-color: oklch(0.26 0.02 250);
        }
        .faculty-email-link {
          font-size: 0.75rem;
          color: oklch(0.45 0.15 250);
          text-decoration: none;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 180px;
          transition: color 0.15s;
        }
        .faculty-email-link:hover { color: oklch(0.35 0.15 250); text-decoration: underline; }
        .faculty-cabin-badge {
          font-size: 0.72rem;
          font-weight: 600;
          color: oklch(0.45 0.12 180);
          background: oklch(0.45 0.12 180 / 0.1);
          border: 1px solid oklch(0.45 0.12 180 / 0.25);
          border-radius: 6px;
          padding: 0.2rem 0.55rem;
          white-space: nowrap;
        }

        /* Divider */
        .dept-divider {
          height: 1px;
          background: linear-gradient(to right, oklch(0.45 0.15 250 / 0.3), oklch(0.45 0.15 250 / 0.05));
          margin-bottom: 1.75rem;
        }

        /* Error state */
        .faculty-error {
          text-align: center;
          padding: 4rem 2rem;
          color: oklch(0.5 0.15 25);
        }
        .faculty-empty {
          text-align: center;
          padding: 4rem 2rem;
          color: oklch(0.55 0.03 250);
        }

        /* Floating orbs (decorative) */
        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.5;
          pointer-events: none;
        }
        .hero-orb-1 {
          width: 380px; height: 380px;
          background: oklch(0.6 0.2 200);
          top: -120px; right: -80px;
        }
        .hero-orb-2 {
          width: 260px; height: 260px;
          background: oklch(0.5 0.22 280);
          bottom: -40px; left: 10%;
        }
      `}</style>

      {/* ── Hero Banner ── */}
      <section className="faculty-hero">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 className="hero-title">Professors Directory</h1>
          <p className="hero-subtitle">
            Meet our distinguished faculty members shaping the leaders of tomorrow.
          </p>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">{data.length || '—'}</div>
              <div className="hero-stat-label">Faculty Members</div>
            </div>
            <div>
              <div className="hero-stat-num">{DEPARTMENTS.filter((d) => (grouped[d] || []).length > 0).length || '—'}</div>
              <div className="hero-stat-label">Departments</div>
            </div>
            <div>
              <div className="hero-stat-num">3+</div>
              <div className="hero-stat-label">Specializations</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs ── */}
      <div className="faculty-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`faculty-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'ALL' ? '🏫 All Departments' : `${DEPT_META[tab]?.icon} ${tab}`}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ paddingBottom: '3rem' }}>
        {loading ? (
          <div className="faculty-section">
            <div className="faculty-grid">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : error ? (
          <div className="faculty-error">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
            <p style={{ fontWeight: 600 }}>{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="faculty-empty">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
            <p style={{ fontWeight: 600 }}>No faculty data available yet.</p>
          </div>
        ) : (
          displayDepts.map((dept) => {
            const list = grouped[dept] || []
            if (list.length === 0) return null
            const meta = DEPT_META[dept]
            const headerClass = dept === 'MBA' ? 'mba' : dept === 'MCOM' ? 'mcom' : ''

            return (
              <section key={dept} className="faculty-section">
                {/* Department Header */}
                <div className="dept-header">
                  <div className="dept-icon-wrap">{meta.icon}</div>
                  <div>
                    <div className="dept-title">{dept}</div>
                    <div className="dept-subtitle">{meta.label}</div>
                  </div>
                  <div className="dept-count">{list.length} Faculty</div>
                </div>
                <div className="dept-divider" />

                {/* Cards Grid */}
                <div className="faculty-grid">
                  {list.map((f) => (
                    <article key={f.id} className="faculty-card">
                      {/* Card Header */}
                      <div className={`faculty-card-header ${headerClass}`}>
                        <div className="faculty-avatar-wrap">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={f.profile_photo || '/images/default-avatar.svg'}
                            alt={f.name}
                            onError={(e) => {
                              ; (e.target as HTMLImageElement).src = '/images/default-avatar.svg'
                            }}
                            className="faculty-avatar"
                          />
                          <span className="faculty-status-dot" title="Active faculty" />
                        </div>
                        <div className="faculty-card-name">{f.name}</div>
                        <div className="faculty-card-designation">{f.designation}</div>
                      </div>

                      {/* Card Body */}
                      <div className="faculty-card-body">
                        <div>
                          <span className="faculty-dept-chip">{meta.icon} {dept}</span>
                        </div>

                        {f.specialization && (
                          <div className="faculty-info-row">
                            <div className="faculty-info-icon">🎓</div>
                            <div className="faculty-info-text">{f.specialization}</div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="faculty-card-footer">
                        {f.email ? (
                          <a
                            href={`mailto:${f.email}`}
                            className="faculty-email-link"
                            title={f.email}
                          >
                            ✉ {f.email}
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'oklch(0.65 0.02 250)' }}>—</span>
                        )}

                        {f.cabin && (
                          <span className="faculty-cabin-badge">🚪 {f.cabin}</span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )
          })
        )}
      </div>
    </>
  )
}
