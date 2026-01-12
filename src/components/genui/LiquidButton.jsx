import React from 'react';
import { motion } from 'framer-motion';

const LiquidButton = ({ children, onClick, active, color = "cyan" }) => {
  // Define glow colors based on prop
  const colors = {
    cyan: "rgb(34, 211, 238)",
    orange: "rgb(251, 146, 60)",
    red: "rgb(248, 113, 113)",
    gold: "rgb(250, 204, 21)"
  };

  const glowColor = colors[color] || colors.cyan;

  return (
    <motion.button
      onClick={onClick}
      className="relative px-6 py-3 rounded-xl overflow-hidden group"
      style={{ background: 'transparent' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Background Glow (Liquid) */}
      <motion.div
        className="absolute inset-0 opacity-20 blur-xl"
        style={{ background: glowColor }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Border Light */}
      <div
        className="absolute inset-0 rounded-xl border border-white/10"
        style={{ boxShadow: active ? `0 0 15px ${glowColor}` : 'none' }}
      />

      {/* Content */}
      <span className={`relative z-10 font-medium tracking-wider ${active ? 'text-white' : 'text-gray-400'}`}
            style={{ textShadow: active ? `0 0 10px ${glowColor}` : 'none' }}>
        {children}
      </span>
    </motion.button>
  );
};

export default LiquidButton;
