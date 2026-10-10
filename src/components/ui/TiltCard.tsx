import React, { useRef, useState, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  HTMLMotionProps,
} from 'framer-motion';
import { cn } from '@/utils/cn';

export interface TiltCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  spotlightColor?: string;
  spotlightSize?: number;
  disabled?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className,
  maxTilt = 6,
  spotlightColor = 'rgba(0, 242, 254, 0.12)',
  spotlightSize = 380,
  disabled = false,
  whileTap = { scale: 0.98 },
  style,
  onMouseMove,
  onMouseLeave,
  onMouseEnter,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect coarse pointer or touch devices to preserve 60fps mobile scrolling
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(hover: none)').matches ||
        'ontouchstart' in window
      );
    };

    checkTouch();
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    mediaQuery.addEventListener?.('change', checkTouch);
    return () => mediaQuery.removeEventListener?.('change', checkTouch);
  }, []);

  // Motion values for normalized cursor coordinates (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Exact pixel coordinates for spotlight overlay
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics configuration: responsive stiffness with controlled damping
  const springConfig = { stiffness: 160, damping: 22 };
  const rawRotateX = useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rawRotateY = useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const rotateX = useSpring(rawRotateX, springConfig);
  const rotateY = useSpring(rawRotateY, springConfig);

  // Spotlight fade-in / fade-out spring
  const spotlightOpacity = useSpring(0, { stiffness: 220, damping: 25 });

  // Dynamic radial spotlight background template
  const spotlightBackground = useMotionTemplate`radial-gradient(${spotlightSize}px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseMove?.(e);
    if (isTouchDevice || disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    mouseX.set(clientX);
    mouseY.set(clientY);

    // Compute normalized coordinates from -0.5 to 0.5
    const normX = clientX / rect.width - 0.5;
    const normY = clientY / rect.height - 0.5;

    x.set(normX);
    y.set(normY);
    spotlightOpacity.set(1);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseEnter?.(e);
    if (!isTouchDevice && !disabled) {
      spotlightOpacity.set(1);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseLeave?.(e);
    // Smoothly return card to level rest state
    x.set(0);
    y.set(0);
    spotlightOpacity.set(0);
  };

  const shouldTilt = !isTouchDevice && !disabled;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileTap={whileTap}
      style={{
        transformPerspective: 1000,
        rotateX: shouldTilt ? rotateX : 0,
        rotateY: shouldTilt ? rotateY : 0,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      className={cn(
        'relative rounded-2xl overflow-hidden',
        // Emil Kowalski subtle edge highlight & inner shadow
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
        className
      )}
      {...rest}
    >
      {/* Spring-powered interactive cursor spotlight overlay */}
      {!isTouchDevice && !disabled && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
          style={{
            background: spotlightBackground,
            opacity: spotlightOpacity,
            mixBlendMode: 'screen',
          }}
        />
      )}

      {children}
    </motion.div>
  );
};

export default TiltCard;
