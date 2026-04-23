import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import LogoImg from '../../assets/logo.png';
import { cn } from '../../utils/cn';

const BG = '#F7F9FF';
const ACCENT = '#2563EB';

const Particle = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ y: '110vh', opacity: 0, x: Math.random() * 100 + 'vw' }}
    animate={{ y: '-10vh', opacity: [0, 0.3, 0] }}
    transition={{ duration: 8, delay, repeat: Infinity, ease: "linear" }}
    className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
  />
);

const RippleRing = ({ delay, scale }: { delay: number, scale: number }) => (
  <motion.div
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale, opacity: [0, 0.5, 0] }}
    transition={{ duration: 1.2, delay, repeat: Infinity, ease: "easeOut" }}
    className="absolute w-40 h-40 border border-blue-500/20 rounded-full"
  />
);

const AnimLetter = ({ char, delay }: { char: string, delay: number }) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.7, x: 0 }}
    animate={{ opacity: 1, scale: [0.7, 1.2, 1], x: [0, -2, 2, 0] }}
    transition={{ duration: 0.4, delay }}
    className="inline-block text-[72px] font-black tracking-widest text-slate-900 select-none"
  >
    {char}
  </motion.span>
);

export default function SplashPage() {
  const { isBackendReady, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isBackendReady) {
      const timer = setTimeout(() => {
        navigate(isAuthenticated ? '/dashboard' : '/login', { replace: true });
      }, 3000); // Allow time for cinematic animations
      return () => clearTimeout(timer);
    }
  }, [isBackendReady, isAuthenticated, navigate]);

  return (
    <div className="fixed inset-0 bg-[#F7F9FF] overflow-hidden flex flex-col items-center justify-center">
      {/* Cinematic Particles */}
      {[...Array(12)].map((_, i) => <Particle key={i} delay={i * 0.8} />)}

      {/* Floating Background Orbs */}
      <motion.div 
        animate={{ y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] w-[100vw] h-[100vw] bg-blue-500/[0.03] rounded-full blur-3xl pointer-events-none" 
      />
      <motion.div 
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, delay: 1, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[20%] -right-[10%] w-[80vw] h-[80vw] bg-blue-500/[0.03] rounded-full blur-3xl pointer-events-none" 
      />

      {/* Main Stage */}
      <div className="relative flex flex-col items-center">
        {/* Logo & Rings */}
        <motion.div
           initial={{ y: -40, opacity: 0, scale: 0.62 }}
           animate={{ y: -80, opacity: 1, scale: 1 }}
           transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
           className="relative w-44 h-44 flex items-center justify-center mb-14"
        >
          {/* Ripple Rings */}
          <RippleRing delay={0} scale={1.8} />
          <RippleRing delay={0.2} scale={2.4} />
          
          <div className="relative w-40 h-40 rounded-full bg-white shadow-2xl flex items-center justify-center overflow-hidden z-10 border-4 border-blue-50 p-6">
            <img src={LogoImg} alt="Logo" className="w-full h-full object-contain" />
            {/* Logo Shimmer */}
            <motion.div 
              initial={{ x: '-150%' }}
              animate={{ x: '200%' }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none"
            />
          </div>
        </motion.div>

        {/* Wordmark */}
        <div className="flex flex-col items-center -mt-6">
          <div className="flex gap-4">
            {['R', 'I', 'T'].map((char, i) => (
              <AnimLetter key={`r${i}`} char={char} delay={0.9 + i * 0.1} />
            ))}
          </div>
          <div className="flex gap-4 -mt-2">
            {['G', 'A', 'T', 'E'].map((char, i) => (
              <AnimLetter key={`g${i}`} char={char} delay={1.2 + i * 0.1} />
            ))}
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="mt-12 flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.1, scale: 1 }}
              animate={{ opacity: [0.1, 1, 0.1], scale: [1, 1.8, 1] }}
              transition={{ duration: 0.5, delay: i * 0.15, repeat: Infinity, repeatDelay: 0.4 }}
              className="w-1.5 h-1.5 rounded-full bg-blue-600 border border-white/80 shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Progress Bar (Bottom) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-0 left-0 right-0 h-1 bg-blue-600/10 overflow-hidden"
      >
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: isBackendReady ? '100%' : '70%' }}
          transition={{ duration: isBackendReady ? 0.6 : 30, ease: "easeOut" }}
          className="h-full bg-blue-600 rounded-full"
        />
      </motion.div>
    </div>
  );
}
