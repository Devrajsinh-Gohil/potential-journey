'use client';

import { ReactNode, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CardGlowProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: number;
}

export function CardGlow({
  children,
  className = '',
  glowColor = 'rgba(59, 130, 246, 0.5)', // Default blue glow
  intensity = 0.15
}: CardGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 1 }}
      whileHover={{ z: 20 }} // Subtle z-axis movement
    >
      {/* Radial gradient following mouse */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: isHovering 
            ? `radial-gradient(
                circle at ${mousePosition.x}px ${mousePosition.y}px, 
                ${glowColor} 0%, 
                transparent 70%
              )`
            : 'none',
          opacity: isHovering ? intensity : 0
        }}
        transition={{ type: 'spring', bounce: 0.4, duration: 0.4 }}
      />
      
      {/* Edge highlight */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        animate={{
          boxShadow: isHovering 
            ? `0 0 15px 2px ${glowColor}` 
            : '0 0 0 0 transparent'
        }}
        transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
      />
      
      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// For different priority levels
export function PriorityCardGlow({
  children,
  priority = 'normal',
  className = '',
}: {
  children: ReactNode;
  priority?: 'low' | 'medium' | 'high' | 'normal';
  className?: string;
}) {
  // Map priority to glow color
  const glowColors = {
    low: 'rgba(34, 197, 94, 0.5)',    // Green
    medium: 'rgba(234, 179, 8, 0.5)',  // Yellow
    high: 'rgba(239, 68, 68, 0.5)',    // Red
    normal: 'rgba(59, 130, 246, 0.5)', // Blue
  };
  
  // Increase intensity for high priority
  const intensities = {
    low: 0.1,
    medium: 0.15,
    high: 0.2,
    normal: 0.15,
  };
  
  return (
    <CardGlow 
      className={className} 
      glowColor={glowColors[priority]} 
      intensity={intensities[priority]}
    >
      {children}
    </CardGlow>
  );
} 