import React from 'react';
import { motion } from 'framer-motion';

const OverlayWidget = ({ data, isCritical }) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="absolute top-20 right-4 w-48 bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-2xl z-50 pointer-events-auto cursor-move"
      style={{
         boxShadow: isCritical ? '0 0 20px rgba(239, 68, 68, 0.5)' : '0 0 20px rgba(34, 211, 238, 0.2)'
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 500 }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Floating View</span>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-gray-400 text-xs">RPM</span>
          <span className="text-white font-mono font-bold text-lg">{Math.round(data.rpm)}</span>
        </div>
        <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
            <motion.div
                className="h-full bg-cyan-400"
                style={{ width: `${(data.rpm / 5000) * 100}%` }}
            />
        </div>

        <div className="flex justify-between items-end">
          <span className="text-gray-400 text-xs">TEMP</span>
          <span className={`font-mono font-bold text-lg ${data.coolantTemp > 90 ? 'text-red-400' : 'text-white'}`}>
             {Math.round(data.coolantTemp)}°C
          </span>
        </div>

        <div className="flex justify-between items-end">
            <span className="text-gray-400 text-xs">RAIL</span>
            <span className="text-white font-mono font-bold text-sm">{(data.railPressure/1000).toFixed(1)}k</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-center text-gray-500">
        Drag to move • Tap to expand
      </div>
    </motion.div>
  );
};

export default OverlayWidget;
