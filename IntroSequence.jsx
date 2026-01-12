import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const IntroSequence = ({ onComplete }) => {
  const [textVisible, setTextVisible] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // 1. Play Sound (Low Volume)
    if(audioRef.current) {
      audioRef.current.volume = 0.3; // เบาที่สุด
      audioRef.current.play().catch(e => console.log("Audio autoplay blocked", e));
    }

    // 2. Text Fade In
    setTimeout(() => setTextVisible(true), 500);

    // 3. Complete Sequence
    setTimeout(() => {
        onComplete();
    }, 3500);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
      {/* Sound Element */}
      <audio ref={audioRef} src="/assets/sounds/wing_whisper.mp3" />

      {/* Light Effect (The "Wing" visual) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1, 1.5, 30], opacity: [0, 0.5, 0] }}
        transition={{ duration: 3, ease: "easeInOut" }}
        className="absolute w-2 h-2 bg-cyan-400 rounded-full blur-xl shadow-[0_0_100px_rgba(34,211,238,0.8)]"
      />

      {/* Brand Text */}
      <motion.h1
        initial={{ opacity: 0, letterSpacing: "0.5em" }}
        animate={{ opacity: textVisible ? 1 : 0, letterSpacing: "0.2em" }}
        transition={{ duration: 2 }}
        className="text-white text-3xl md:text-5xl font-light tracking-[0.2em] z-10 font-[Rajdhani]"
        style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
      >
        INSPIRAFIRMA
      </motion.h1>
    </div>
  );
};

export default IntroSequence;