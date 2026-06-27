import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthShellProps {
  /** Background image shown behind the form (full-bleed on phone, left panel on desktop/tablet). */
  background: string;
  /** Large headline shown over the photo panel (desktop/tablet only). */
  headline?: string;
  /** Sub copy under the headline. */
  subline?: string;
  /** The form card content. */
  children: ReactNode;
}

/**
 * Responsive auth layout — a campus photo background with a readable form panel.
 *
 * - Desktop / tablet (lg+, md+): split screen. The photo fills the left with a
 *   dark gradient overlay + branding; the form sits in a clean white panel on
 *   the right.
 * - Phone: the photo fills the whole screen (kept visible at the edges) with a
 *   dark overlay, and the form floats in a frosted-glass card.
 *
 * Motion: a security "scan beam" sweeps the photo, a faint tech grid drifts,
 * and the branding / headline reveal with a staggered spring entrance. All
 * decorative motion is disabled under `prefers-reduced-motion`.
 */
export default function AuthShell({ background, headline, subline, children }: AuthShellProps) {
  return (
    <div className="auth-shell">
      {/* Background photo — full-bleed on phone, left half on md+ */}
      <div className="auth-shell__photo" style={{ backgroundImage: `url(${background})` }}>
        <div className="auth-shell__overlay" />
        {/* Faint engineered grid for a "secure system" texture */}
        <div className="auth-shell__grid" aria-hidden />
        {/* Security scan beam sweeping down the photo */}
        <div className="auth-shell__beam" aria-hidden />

        {/* Branding over the photo (visible on md+; on phone it's the top strip) */}
        <motion.div
          className="auth-shell__brand"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <div className="auth-shell__logo-wrap">
            <img src="/logo.png" alt="RIT Gate" className="auth-shell__logo" />
            <span className="auth-shell__logo-ring" aria-hidden />
          </div>
          <div>
            <p className="auth-shell__brand-name">RIT GATE</p>
            <p className="auth-shell__brand-tag">
              <span className="auth-shell__live-dot" aria-hidden />
              Secure Access Control System
            </p>
          </div>
        </motion.div>

        {headline && (
          <motion.div
            className="auth-shell__headline"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          >
            <h2>{headline}</h2>
            {subline && <p>{subline}</p>}
            <div className="auth-shell__trust">
              {['256-bit Encrypted', 'OTP Verified', 'Audit Logged'].map((t, i) => (
                <motion.span
                  key={t}
                  className="auth-shell__trust-pill"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.55 + i * 0.1 }}
                >
                  {t}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Form panel */}
      <div className="auth-shell__panel">
        <motion.div
          className="auth-shell__card"
          initial={{ opacity: 0, y: 22, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>

      <style>{`
        .auth-shell {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          background: #0B1120;
          overflow: hidden;
        }
        .auth-shell__photo {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          z-index: 0;
          /* Professional entrance: fade in, then a slow, endless Ken Burns drift */
          animation:
            authPhotoIn 1.1s ease-out both,
            authKenBurns 26s ease-in-out 1.1s infinite alternate;
          will-change: transform, opacity;
        }
        @keyframes authPhotoIn {
          from { opacity: 0; transform: scale(1.12); }
          to   { opacity: 1; transform: scale(1.06); }
        }
        @keyframes authKenBurns {
          from { transform: scale(1.06) translate3d(0, 0, 0); }
          to   { transform: scale(1.14) translate3d(-2.5%, -2%, 0); }
        }
        .auth-shell__overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          /* Strong on phone so the card is readable over the photo */
          background:
            linear-gradient(180deg, rgba(8,12,24,0.55) 0%, rgba(8,12,24,0.78) 100%);
        }

        /* Engineered grid texture */
        .auth-shell__grid {
          position: absolute;
          inset: -1px;
          z-index: 1;
          background-image:
            linear-gradient(rgba(148,197,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,197,255,0.06) 1px, transparent 1px);
          background-size: 46px 46px;
          mask-image: radial-gradient(circle at 30% 35%, #000 0%, transparent 72%);
          -webkit-mask-image: radial-gradient(circle at 30% 35%, #000 0%, transparent 72%);
          animation: authGridDrift 32s linear infinite;
        }
        @keyframes authGridDrift {
          from { background-position: 0 0, 0 0; }
          to   { background-position: 46px 46px, 46px 46px; }
        }

        /* Security scan beam */
        .auth-shell__beam {
          position: absolute;
          left: 0; right: 0;
          top: -40%;
          height: 38%;
          z-index: 1;
          background: linear-gradient(180deg,
            transparent 0%,
            rgba(96,165,250,0.00) 35%,
            rgba(120,190,255,0.16) 50%,
            rgba(96,165,250,0.00) 65%,
            transparent 100%);
          filter: blur(2px);
          animation: authBeam 6.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        @keyframes authBeam {
          0%   { transform: translateY(0); opacity: 0; }
          12%  { opacity: 1; }
          55%  { opacity: 1; }
          70%  { transform: translateY(360%); opacity: 0; }
          100% { transform: translateY(360%); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-shell__photo { animation: authPhotoIn 0.6s ease-out both; }
          .auth-shell__grid,
          .auth-shell__beam,
          .auth-shell__logo-ring,
          .auth-shell__live-dot { animation: none; }
          .auth-shell__beam { display: none; }
        }

        .auth-shell__brand {
          position: absolute;
          top: 22px;
          left: 22px;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .auth-shell__logo-wrap { position: relative; width: 46px; height: 46px; flex-shrink: 0; }
        .auth-shell__logo {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
          position: relative;
          z-index: 1;
        }
        .auth-shell__logo-ring {
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          border: 1.5px solid rgba(120,190,255,0.55);
          animation: authPulseRing 2.8s ease-out infinite;
        }
        @keyframes authPulseRing {
          0%   { transform: scale(0.85); opacity: 0.9; }
          70%  { transform: scale(1.25); opacity: 0; }
          100% { transform: scale(1.25); opacity: 0; }
        }
        .auth-shell__brand-name {
          margin: 0;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #FFFFFF;
        }
        .auth-shell__brand-tag {
          margin: 2px 0 0;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .auth-shell__live-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #34D399;
          box-shadow: 0 0 0 0 rgba(52,211,153,0.7);
          animation: authLive 2s ease-out infinite;
        }
        @keyframes authLive {
          0%   { box-shadow: 0 0 0 0 rgba(52,211,153,0.55); }
          70%  { box-shadow: 0 0 0 7px rgba(52,211,153,0); }
          100% { box-shadow: 0 0 0 0 rgba(52,211,153,0); }
        }
        .auth-shell__headline { display: none; }
        .auth-shell__trust { display: none; }

        /* Form panel + card */
        .auth-shell__panel {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .auth-shell__card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.55);
          border-radius: 24px;
          padding: 28px 24px;
          box-shadow: 0 24px 70px rgba(2,6,23,0.45);
          will-change: transform, opacity;
        }

        /* Tablet & desktop — split screen, solid form panel on the right */
        @media (min-width: 768px) {
          .auth-shell__photo {
            right: auto;
            width: 52%;
          }
          .auth-shell__overlay {
            background:
              linear-gradient(115deg, rgba(8,12,24,0.32) 0%, rgba(8,12,24,0.62) 70%, rgba(11,17,32,0.92) 100%);
          }
          .auth-shell__headline {
            display: block;
            position: absolute;
            left: 44px;
            bottom: 56px;
            right: 44px;
            z-index: 3;
            color: #FFFFFF;
          }
          .auth-shell__headline h2 {
            margin: 0;
            font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
            font-size: 34px;
            line-height: 1.12;
            font-weight: 800;
            letter-spacing: -0.5px;
            text-shadow: 0 2px 18px rgba(0,0,0,0.45);
          }
          .auth-shell__headline p {
            margin: 12px 0 0;
            font-size: 14px;
            font-weight: 600;
            max-width: 360px;
            color: rgba(255,255,255,0.82);
          }
          .auth-shell__trust {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 20px;
          }
          .auth-shell__trust-pill {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.4px;
            color: rgba(255,255,255,0.92);
            padding: 6px 12px;
            border-radius: 999px;
            background: rgba(255,255,255,0.10);
            border: 1px solid rgba(255,255,255,0.22);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }
          .auth-shell__panel {
            margin-left: 52%;
            background: #FFFFFF;
            padding: 40px;
          }
          .auth-shell__card {
            background: #FFFFFF;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            border: none;
            box-shadow: none;
            padding: 8px;
            max-width: 400px;
          }
        }

        @media (min-width: 1024px) {
          .auth-shell__photo { width: 56%; }
          .auth-shell__panel { margin-left: 56%; }
          .auth-shell__headline h2 { font-size: 42px; }
        }

        /* Dark mode form panel on desktop */
        @media (min-width: 768px) {
          .dark .auth-shell__panel { background: #0B1120; }
          .dark .auth-shell__card { background: #0B1120; }
        }
      `}</style>
    </div>
  );
}
