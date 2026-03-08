/**
 * Individual Founder Card Component — Premium Glassmorphism Edition
 * Displays founder information with circular image, hover glow, and entry animations
 */
"use client"
import Image from "next/image"

interface FoundersCardProps {
  name: string
  qualification: string
  location: string
  image?: string
  index?: number
}

export function FoundersCard({ name, qualification, location, image, index = 0 }: FoundersCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('')

  return (
    <>
      <div
        className="fc-card"
        style={{ animationDelay: `${index * 150}ms` }}
      >
        {/* Glowing border effect */}
        <div className="fc-glow" />

        {/* Inner card surface */}
        <div className="fc-inner">

          {/* Avatar ring + image */}
          <div className="fc-avatar-wrap">
            <div className="fc-avatar-ring" />
            <div className="fc-avatar">
              {image ? (
                <Image
                  src={image}
                  alt={name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <span className="fc-initials">{initials}</span>
              )}
            </div>
            {/* Orbit dot */}
            <div className="fc-orbit">
              <div className="fc-orbit-dot" />
            </div>
          </div>

          {/* Text block */}
          <div className="fc-text">
            <h3 className="fc-name">{name}</h3>
            <div className="fc-divider" />
            <p className="fc-qual">{qualification}</p>
            <p className="fc-location">
              <span className="fc-pin">📍</span>
              {location}
            </p>
          </div>

          {/* Bottom shimmer accent */}
          <div className="fc-shimmer" />
        </div>
      </div>

      <style>{`
        .fc-card {
          position: relative;
          border-radius: 24px;
          padding: 2px;
          animation: fcFadeIn 0.6s ease-out both;
          cursor: default;
        }
        @keyframes fcFadeIn {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Glowing gradient border */
        .fc-glow {
          position: absolute; inset: 0;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(129,140,248,0.6), rgba(192,132,252,0.4), rgba(244,114,182,0.5));
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 0;
        }
        .fc-card:hover .fc-glow { opacity: 1; }

        /* Glass surface */
        .fc-inner {
          position: relative; z-index: 1;
          border-radius: 22px;
          background: rgba(255,255,255,0.045);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 44px 32px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          overflow: hidden;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                      background 0.35s ease,
                      box-shadow 0.35s ease;
        }
        .fc-card:hover .fc-inner {
          transform: translateY(-8px);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 32px 64px rgba(0,0,0,0.5), 0 0 40px rgba(129,140,248,0.15);
        }

        /* Avatar */
        .fc-avatar-wrap {
          position: relative;
          width: 128px; height: 128px;
          margin-bottom: 28px;
        }
        .fc-avatar-ring {
          position: absolute; inset: -4px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #818cf8, #c084fc, #f472b6, #818cf8);
          animation: ringRotate 4s linear infinite;
          opacity: 0.7;
          transition: opacity 0.3s;
        }
        .fc-card:hover .fc-avatar-ring { opacity: 1; }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .fc-avatar {
          position: absolute; inset: 4px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1e1b4b, #312e81);
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          border: 3px solid rgba(255,255,255,0.08);
        }
        .fc-initials {
          font-size: 2rem; font-weight: 800;
          background: linear-gradient(135deg, #818cf8, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Orbiting dot */
        .fc-orbit {
          position: absolute; inset: -8px;
          border-radius: 50%;
          animation: orbitSpin 3s linear infinite;
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .fc-orbit-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: linear-gradient(135deg, #818cf8, #f472b6);
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          box-shadow: 0 0 10px rgba(129,140,248,0.8);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .fc-card:hover .fc-orbit-dot { opacity: 1; }

        /* Text */
        .fc-text { width: 100%; }
        .fc-name {
          font-size: 1.4rem; font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }
        .fc-divider {
          width: 40px; height: 2px; border-radius: 2px;
          background: linear-gradient(90deg, #818cf8, #f472b6);
          margin: 0 auto 14px;
          transition: width 0.3s ease;
        }
        .fc-card:hover .fc-divider { width: 70px; }
        .fc-qual {
          font-size: 0.9rem; font-weight: 500;
          color: rgba(165,180,252,0.9);
          margin-bottom: 10px;
          letter-spacing: 0.03em;
        }
        .fc-location {
          font-size: 0.8rem; font-weight: 400;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.05em;
          display: flex; align-items: center; justify-content: center; gap: 4px;
        }
        .fc-pin { font-size: 0.85rem; }

        /* Bottom shimmer */
        .fc-shimmer {
          position: absolute; bottom: 0; left: -50%; right: -50%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(129,140,248,0.6), rgba(244,114,182,0.6), transparent);
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }
        .fc-card:hover .fc-shimmer { transform: scaleX(1); }
      `}</style>
    </>
  )
}
