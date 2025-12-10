import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Define animation directions for different routes
const routeAnimations = {
  '/': { direction: 'up', intensity: 'high' },
  '/create-trip': { direction: 'right', intensity: 'medium' },
  '/trip-history': { direction: 'left', intensity: 'medium' },
  '/globe': { direction: 'up', intensity: 'high' },
  '/compare': { direction: 'right', intensity: 'medium' },
  '/offline': { direction: 'left', intensity: 'medium' },
  '/weather': { direction: 'up', intensity: 'high' },
  '/social': { direction: 'right', intensity: 'medium' },
  '/view-trip': { direction: 'left', intensity: 'medium' },
  '/sign-up': { direction: 'fade', intensity: 'low' },
  '/financial': { direction: 'up', intensity: 'high' },
  '/multi-trip': { direction: 'right', intensity: 'medium' },
  default: { direction: 'fade', intensity: 'low' }
};

const getAnimationProps = (direction, intensity) => {
  const distance = intensity === 'high' ? 100 : intensity === 'medium' ? 50 : 25;
  const scaleInitial = intensity === 'high' ? 0.8 : intensity === 'medium' ? 0.9 : 0.95;
  const scaleExit = intensity === 'high' ? 1.1 : intensity === 'medium' ? 1.05 : 1.02;
  
  switch (direction) {
    case 'left':
      return {
        initial: { opacity: 0, x: -distance, scale: scaleInitial },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: distance, scale: scaleExit }
      };
    case 'right':
      return {
        initial: { opacity: 0, x: distance, scale: scaleInitial },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: -distance, scale: scaleExit }
      };
    case 'up':
      return {
        initial: { opacity: 0, y: -distance, scale: scaleInitial },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: distance, scale: scaleExit }
      };
    case 'down':
      return {
        initial: { opacity: 0, y: distance, scale: scaleInitial },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -distance, scale: scaleExit }
      };
    case 'fade':
      return {
        initial: { opacity: 0, scale: scaleInitial },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: scaleExit }
      };
    default:
      return {
        initial: { opacity: 0, scale: scaleInitial },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: scaleExit }
      };
  }
};

const AnimatedRoutes = ({ children }) => {
  const location = useLocation();
  const currentRoute = Object.keys(routeAnimations).find(route => 
    location.pathname.startsWith(route)
  ) || 'default';
  
  const animationType = routeAnimations[currentRoute]?.direction || routeAnimations.default.direction;
  const animationIntensity = routeAnimations[currentRoute]?.intensity || routeAnimations.default.intensity;
  const animationProps = getAnimationProps(animationType, animationIntensity);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        {...animationProps}
        transition={{ 
          type: "spring", 
          damping: 20, 
          stiffness: 300,
          duration: 0.5,
          ease: "easeInOut"
        }}
        className="w-full h-full min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;