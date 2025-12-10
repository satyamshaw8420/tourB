import React, { useState, useEffect } from 'react';

const AnimatedTaglineCarousel = ({ onIndexChange }) => {
  // Tagline options for the second part
  const taglineOptions = [
    "Explore Forever",
    "Create Memories",
    "Share Adventures",
    "Build Connections",
    "Discover Wonders",
    "Make Moments",
    "Find Joy",
    "Grow Closer"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Cycle through taglines every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % taglineOptions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Notify parent component of index changes for background synchronization
  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(currentIndex);
    }
  }, [currentIndex, onIndexChange]);

  return (
    <div className="h-24 flex items-center justify-center">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white text-center flex flex-nowrap justify-center items-center">
        {/* Static "Travel Together" part */}
        <span className="mr-2">Travel Together,</span>
        
        {/* Animated second part */}
        <span 
          key={currentIndex}
          className="inline-block"
          style={{ 
            animation: 'slideUpDown 3s ease-in-out forwards',
          }}
        >
          {taglineOptions[currentIndex]}
        </span>
      </h1>

      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes slideUpDown {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          20% {
            opacity: 1;
            transform: translateY(0);
          }
          80% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-30px);
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedTaglineCarousel;