import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

const LazySection = ({ 
  children, 
  threshold = 0.1, 
  animationType = 'fade', 
  delay = 0,
  className = '',
  once = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const controls = useAnimation();
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          controls.start('visible');
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          controls.start('hidden');
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [controls, threshold, once]);

  const getAnimationVariants = () => {
    const variants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.1
        }
      }
    };

    switch (animationType) {
      case 'fade':
        variants.hidden = { opacity: 0 };
        variants.visible = { opacity: 1, transition: { duration: 0.6, delay } };
        break;
      case 'slide-up':
        variants.hidden = { opacity: 0, y: 50 };
        variants.visible = { opacity: 1, y: 0, transition: { duration: 0.6, delay } };
        break;
      case 'slide-down':
        variants.hidden = { opacity: 0, y: -50 };
        variants.visible = { opacity: 1, y: 0, transition: { duration: 0.6, delay } };
        break;
      case 'slide-left':
        variants.hidden = { opacity: 0, x: 50 };
        variants.visible = { opacity: 1, x: 0, transition: { duration: 0.6, delay } };
        break;
      case 'slide-right':
        variants.hidden = { opacity: 0, x: -50 };
        variants.visible = { opacity: 1, x: 0, transition: { duration: 0.6, delay } };
        break;
      case 'scale':
        variants.hidden = { opacity: 0, scale: 0.8 };
        variants.visible = { opacity: 1, scale: 1, transition: { duration: 0.6, delay } };
        break;
      case 'bounce':
        variants.hidden = { opacity: 0, y: 50 };
        variants.visible = { 
          opacity: 1, 
          y: 0, 
          transition: { 
            type: 'spring', 
            damping: 12, 
            stiffness: 200,
            delay 
          } 
        };
        break;
      default:
        variants.hidden = { opacity: 0 };
        variants.visible = { opacity: 1, transition: { duration: 0.6, delay } };
    }

    return variants;
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={getAnimationVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default LazySection;