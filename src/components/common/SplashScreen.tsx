import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RITLogo from './RITLogo';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(() => {
    return !sessionStorage.getItem('ritgate_splash_shown');
  });

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('ritgate_splash_shown', 'true');
    }, 3000);
    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#F8FAFF] overflow-hidden"
        >
          {/* Orbital Background Blobs */}
          <div className="absolute inset-0 pointer-events-none">
             <motion.div 
                animate={{ scale: [1, 1.1, 1], x: [0, 10, 0], y: [0, -10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] right-[-10%] w-[80%] h-[50%] bg-[#E8F0FF] rounded-full blur-[100px] opacity-70" 
             />
             <motion.div 
                animate={{ scale: [1, 1.2, 1], x: [0, -15, 0], y: [0, 15, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[-10%] left-[-5%] w-[90%] h-[60%] bg-[#F0F5FF] rounded-full blur-[100px] opacity-70" 
             />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo with Glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <RITLogo size={180} glow className="mb-12" />
            </motion.div>

            {/* Branded Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="bg-white px-16 py-10 rounded-[3rem] shadow-[0_20px_40px_-5px_rgba(37,99,235,0.06)] flex flex-col items-center gap-2"
            >
              <h2 className="text-[64px] font-black text-[#1A3B71] leading-none tracking-tight">RIT</h2>
              <h2 className="text-[64px] font-black text-[#4B85E8] leading-none tracking-tight">GATE</h2>
            </motion.div>
          </div>

          {/* Pagination-style dots */}
          <div className="absolute bottom-16 flex gap-2">
             <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
             <div className="w-2.5 h-2.5 rounded-full bg-blue-100" />
             <div className="w-2.5 h-2.5 rounded-full bg-blue-100" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
