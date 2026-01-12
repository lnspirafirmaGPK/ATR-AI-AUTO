import React from 'react';
import { motion } from 'framer-motion';

const GenUIContainer = ({ children }) => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-950 text-white">
        {/* Ambient Background Mesh */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <motion.div
                className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-blue-900 rounded-full blur-[100px]"
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
             <motion.div
                className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-900 rounded-full blur-[100px]"
                animate={{
                    x: [0, -100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.3, 1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 w-full h-full flex flex-col">
            {children}
        </div>
    </div>
  );
};

export default GenUIContainer;
