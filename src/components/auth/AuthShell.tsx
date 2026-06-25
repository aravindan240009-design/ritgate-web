import type { ReactNode } from 'react';

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
 */
export default function AuthShell({ background, headline, subline, children }: AuthShellProps) {
  return (
    <div className="auth-shell">
      {/* Background photo — full-bleed on phone, left half on md+ */}
      <div className="auth-shell__photo" style={{ backgroundImage: `url(${background})` }}>
        <div className="auth-shell__overlay" />
        {/* Branding over the photo (visible on md+; on phone it's the top strip) */}
        <div className="auth-shell__brand">
          <img src="/logo.png" alt="RIT Gate" className="auth-shell__logo" />
          <div>
            <p className="auth-shell__brand-name">RIT GATE</p>
            <p className="auth-shell__brand-tag">Secure Access Control System</p>
          </div>
        </div>
        {headline && (
          <div className="auth-shell__headline">
            <h2>{headline}</h2>
            {subline && <p>{subline}</p>}
          </div>
        )}
      </div>

      {/* Form panel */}
      <div className="auth-shell__panel">
        <div className="auth-shell__card">{children}</div>
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
        }
        .auth-shell__overlay {
          position: absolute;
          inset: 0;
          /* Strong on phone so the card is readable over the photo */
          background:
            linear-gradient(180deg, rgba(8,12,24,0.55) 0%, rgba(8,12,24,0.78) 100%);
        }
        .auth-shell__brand {
          position: absolute;
          top: 22px;
          left: 22px;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .auth-shell__logo {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        }
        .auth-shell__brand-name {
          margin: 0;
          font-size: 18px;
          font-weight: 900;
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
        }
        .auth-shell__headline { display: none; }

        /* Form panel + card */
        .auth-shell__panel {
          position: relative;
          z-index: 1;
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
            z-index: 2;
            color: #FFFFFF;
          }
          .auth-shell__headline h2 {
            margin: 0;
            font-size: 34px;
            line-height: 1.12;
            font-weight: 900;
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
