'use client'

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { FoundersCard } from "@/components/founders-card"

// Hardcoded founders data - NO DATABASE CONNECTION
const founders = [
  {
    id: 1,
    name: "Ramya G P",
    qualification: "BCA, MCA",
    location: "Tumkur",
    image: "/ramyagp.png",
  },
  {
    id: 2,
    name: "Likhitha D S",
    qualification: "BCA, MCA",
    location: "Kunigal",
    image: "/likhithads.png",
  },
  {
    id: 3,
    name: "Ramya S",
    qualification: "BCA, MCA",
    location: "Tumkur",
    image: "/Ramyas.png",
  },
]

export default function FoundersPage() {
  return (
    <main className="founders-root">
      {/* ── Ambient background orbs ── */}
      <div className="founders-orb founders-orb-1" />
      <div className="founders-orb founders-orb-2" />
      <div className="founders-orb founders-orb-3" />

      {/* ── Back Button ── */}
      <div className="founders-back">
        <Link href="/" className="founders-back-link">
          <ArrowLeft className="founders-back-icon" />
          <span>Back</span>
        </Link>
      </div>

      {/* ── Hero Header ── */}
      <section className="founders-hero">
        <div className="founders-badge">✦ Our Visionary Team</div>

        <h1 className="founders-title">
          <span className="founders-title-line">The</span>{" "}
          <span className="founders-title-accent">Team</span>
        </h1>

        <p className="founders-subtitle">Meet Our Visionary Leaders</p>

        {/* Animated divider */}
        <div className="founders-divider">
          <span className="founders-divider-dot" />
          <span className="founders-divider-line" />
          <span className="founders-divider-diamond">◆</span>
          <span className="founders-divider-line" />
          <span className="founders-divider-dot" />
        </div>
      </section>

      {/* ── Cards Grid ── */}
      <section className="founders-grid-section">
        <div className="founders-grid">
          {founders.map((founder, i) => (
            <FoundersCard
              key={founder.id}
              name={founder.name}
              qualification={founder.qualification}
              location={founder.location}
              image={founder.image}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* ── Footer accent ── */}
      <div className="founders-footer">
        <p className="founders-footer-text">
          Building the future of campus navigation
        </p>
      </div>

      {/* ── Inline styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .founders-root {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a1a 0%, #0d1035 30%, #0a1628 60%, #0a0a1a 100%);
          position: relative;
          overflow: hidden;
        }

        /* ── ambient orbs ── */
        .founders-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          animation: orbFloat 8s ease-in-out infinite;
        }
        .founders-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%);
          top: -150px; left: -150px;
          animation-delay: 0s;
        }
        .founders-orb-2 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(236,72,153,0.20) 0%, transparent 70%);
          top: 30%; right: -200px;
          animation-delay: 2.5s;
        }
        .founders-orb-3 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%);
          bottom: -100px; left: 30%;
          animation-delay: 5s;
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        /* ── back button ── */
        .founders-back {
          position: fixed; top: 24px; left: 24px; z-index: 100;
        }
        .founders-back-link {
          display: flex; align-items: center; gap: 8px;
          color: rgba(255,255,255,0.75);
          font-size: 0.875rem; font-weight: 500;
          padding: 10px 18px;
          border-radius: 50px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .founders-back-link:hover {
          background: rgba(255,255,255,0.15);
          color: #fff;
          transform: translateX(-3px);
        }
        .founders-back-icon { width: 16px; height: 16px; }

        /* ── hero ── */
        .founders-hero {
          position: relative; z-index: 10;
          padding: 120px 24px 64px;
          text-align: center;
        }
        .founders-badge {
          display: inline-block;
          font-size: 0.75rem; font-weight: 600; letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #a5b4fc;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 50px;
          padding: 6px 18px;
          margin-bottom: 28px;
        }
        .founders-title {
          font-size: clamp(4rem, 12vw, 8rem);
          font-weight: 900;
          line-height: 1;
          margin: 0 0 20px;
          letter-spacing: -0.04em;
        }
        .founders-title-line {
          color: #fff;
        }
        .founders-title-accent {
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .founders-subtitle {
          font-size: clamp(1rem, 2.5vw, 1.375rem);
          font-weight: 300;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.05em;
          margin-bottom: 40px;
        }

        /* ── decorative divider ── */
        .founders-divider {
          display: flex; align-items: center; justify-content: center; gap: 12px;
          margin-bottom: 16px;
        }
        .founders-divider-line {
          width: 80px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(165,180,252,0.5), transparent);
        }
        .founders-divider-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(165,180,252,0.5);
        }
        .founders-divider-diamond {
          color: #818cf8; font-size: 0.6rem;
          animation: spinSlow 6s linear infinite;
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── grid ── */
        .founders-grid-section {
          position: relative; z-index: 10;
          padding: 0 24px 80px;
        }
        .founders-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 28px;
        }

        /* ── footer ── */
        .founders-footer {
          position: relative; z-index: 10;
          text-align: center;
          padding: 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .founders-footer-text {
          font-size: 0.8rem;
          font-weight: 400;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
      `}</style>
    </main>
  )
}
