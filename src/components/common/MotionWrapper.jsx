"use client";

import { motion } from "framer-motion";

// Clean cubic bezier ease curves for modern luxury feel
export const TRANSITION_EASE = [0.22, 1, 0.36, 1];

/**
 * FadeIn Component
 * Fades and translates content from a given direction.
 */
export function FadeIn({
  children,
  direction = "up",
  distance = 20,
  duration = 0.4,
  delay = 0,
  className = "",
  once = true,
  ...props
}) {
  const getDirections = () => {
    switch (direction) {
      case "up":
        return { y: distance, x: 0 };
      case "down":
        return { y: -distance, x: 0 };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const initialDir = getDirections();

  return (
    <motion.div
      initial={{ opacity: 0, ...initialDir }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once }}
      transition={{
        duration,
        delay,
        ease: TRANSITION_EASE,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer Component
 * Orchestrates staggered animations for grid or list items.
 */
export function StaggerContainer({
  children,
  staggerChildren = 0.08,
  delayChildren = 0,
  className = "",
  once = true,
  ...props
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem Component
 * Item component inside a StaggerContainer.
 */
export function StaggerItem({
  children,
  className = "",
  yDistance = 20,
  duration = 0.4,
  ...props
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: yDistance },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            ease: TRANSITION_EASE,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedButton Component
 * Interactive button with spring micro-interactions on hover and tap.
 */
export function AnimatedButton({
  children,
  className = "",
  onClick,
  disabled = false,
  hoverScale = 1.02,
  tapScale = 0.96,
  hoverY = -1,
  type = "button",
  ...props
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: hoverScale, y: hoverY } : undefined}
      whileTap={!disabled ? { scale: tapScale } : undefined}
      transition={{ duration: 0.15, ease: TRANSITION_EASE }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * ScaleIn Component
 * Scale animation with optional spring timing.
 */
export function ScaleIn({
  children,
  duration = 0.3,
  delay = 0,
  initialScale = 0.9,
  className = "",
  once = true,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once }}
      transition={{
        duration,
        delay,
        ease: TRANSITION_EASE,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * PageTransition Component
 * Page wrapper for entry transitions.
 */
export function PageTransition({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: TRANSITION_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
