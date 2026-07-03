import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AuthShellProps {
  /** Background image shown behind the form (full-bleed on phone, left panel on desktop/tablet). */
  background: string;
  /** Large headline shown over the photo panel (desktop/tablet only). */
  headline?: string;
  /** Sub copy under the headline. */
  subline?: string;
  /** The form card content. */
  children: ReactNode;
  /** Optional extra content placed between branding and the form card. */
  headerExtra?: ReactNode;
}

/**
 * Responsive auth layout — a campus photo background has been replaced by a clean,
 * centered card layout as requested. The left image panel is removed.
 *
 * Branding and a back button are placed above the card.
 */
export default function AuthShell({ background, headline, subline, children, headerExtra }: AuthShellProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    // If we can go back, do so; otherwise go to splash
    if (window.history.state && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/splash');
    }
  };

  return (
    <div className="auth-shell">
      {/* Container for Centered Layout */}
      <div className="auth-shell__container">
        
        {/* Back Button */}
        <motion.button
          onClick={handleBack}
          className="auth-shell__back"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </motion.button>

        {/* Branding (Centered above the card) */}
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
          <div className="auth-shell__brand-text">
            <p className="auth-shell__brand-name">RIT GATE</p>
            <p className="auth-shell__brand-tag">
              <span className="auth-shell__live-dot" aria-hidden />
              Secure Access Control System
            </p>
          </div>
        </motion.div>

        {/* Extra Header Content (e.g. Chips) */}
        {headerExtra && (
          <div className="auth-shell__header-extra">
            {headerExtra}
          </div>
        )}

        {/* Form Card */}
        <motion.div
          className="auth-shell__card"
          initial={{ opacity: 0, y: 22, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          {children}
        </motion.div>

        {/* System footer text */}
        <div className="auth-shell__footer" aria-hidden>
          ACCESS VERIFICATION SYSTEM
        </div>
      </div>


      <style>{`
        .auth-shell {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F6F8FC;
          color: #0F172A;
          overflow-y: auto;
          width: 100%;
          padding: 40px 20px;
          box-sizing: border-box;
        }
        .dark .auth-shell {
          background: #0B1120;
          color: #F8FAFC;
        }

        .auth-shell__container {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .auth-shell__header-extra {
          margin-bottom: 24px;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .auth-shell__back {
          position: absolute;
          left: 0;
          top: -48px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #64748B;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          transition: background 0.2s, color 0.2s;
        }
        .auth-shell__back:hover {
          background: rgba(148, 163, 184, 0.15);
          color: #0F172A;
        }
        .dark .auth-shell__back {
          color: #94A3B8;
        }
        .dark .auth-shell__back:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
        }

        .auth-shell__brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          text-align: center;
        }
        .auth-shell__logo-wrap {
          position: relative;
          width: 60px;
          height: 60px;
        }
        .auth-shell__logo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          position: relative;
          z-index: 1;
        }
        .auth-shell__logo-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1.5px solid rgba(37, 99, 235, 0.4);
          animation: authPulseRing 2.8s ease-out infinite;
        }
        .dark .auth-shell__logo-ring {
          border-color: rgba(96, 165, 250, 0.4);
        }
        @keyframes authPulseRing {
          0%   { transform: scale(0.85); opacity: 0.9; }
          70%  { transform: scale(1.2); opacity: 0; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        .auth-shell__brand-text {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .auth-shell__brand-name {
          margin: 0;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #0F172A;
        }
        .dark .auth-shell__brand-name {
          color: #FFFFFF;
        }
        .auth-shell__brand-tag {
          margin: 4px 0 0;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #64748B;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dark .auth-shell__brand-tag {
          color: rgba(255,255,255,0.6);
        }
        .auth-shell__live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: authLive 2s ease-out infinite;
        }
        @keyframes authLive {
          0%   { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55); }
          70%  { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .auth-shell__card {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 24px;
          padding: 32px 28px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01);
          box-sizing: border-box;
        }
        .dark .auth-shell__card {
          background: #0F172A;
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }

        .auth-shell__footer {
          margin-top: 24px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.15em;
          color: #94A3B8;
          text-transform: uppercase;
        }
        .dark .auth-shell__footer {
          color: #475569;
        }

        @media (max-width: 480px) {
          .auth-shell {
            padding: 24px 16px;
          }
          .auth-shell__container {
            padding-top: 40px;
          }
          .auth-shell__back {
            top: 0px;
          }
          .auth-shell__card {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
}
