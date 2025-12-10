import React, { useState, useEffect } from 'react';

const AnimatedHomepageCarousel = ({ currentIndex = 0 }) => {
  // Pre-defined scenic images from Unsplash with direct URLs
  // Back to 8 images to match the 8 taglines
  const images = [
    {
      url: 'https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      alt: 'Beautiful hill station landscape'
    },
    {
      url: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      alt: 'Tropical beach with crystal clear water'
    },
    {
      url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      alt: 'Panoramic view of Mount Everest'
    },
    {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      alt: 'Majestic mountain range'
    },
    {
      url: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      alt: 'Jungle with beautiful sunset view'
    },
    {
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      alt: 'Snow-capped mountains'
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      alt: 'Desert landscape'
    },
    {
      url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      alt: 'Northern lights'
    }
  ];

  const [displayIndex, setDisplayIndex] = useState(0);

  // Update display index when currentIndex prop changes
  useEffect(() => {
    setDisplayIndex(currentIndex);
  }, [currentIndex]);

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {/* Carousel images with enhanced smooth flow animation */}
      {images.map((image, index) => {
        // Calculate the position for sliding effect
        let positionClass = '';
        let opacityClass = '';
        let scaleClass = '';
        
        // Current image
        if (index === displayIndex) {
          positionClass = 'z-20';
          opacityClass = 'opacity-100';
          scaleClass = 'scale-110';
        } 
        // Next image (sliding in)
        else if (index === (displayIndex + 1) % images.length) {
          positionClass = 'z-10';
          opacityClass = 'opacity-0';
          scaleClass = 'scale-100';
        }
        // Previous image (sliding out)
        else if (index === (displayIndex - 1 + images.length) % images.length) {
          positionClass = 'z-0';
          opacityClass = 'opacity-0';
          scaleClass = 'scale-120';
        }
        // Hidden images
        else {
          positionClass = 'z-0';
          opacityClass = 'opacity-0';
          scaleClass = 'scale-100';
        }

        return (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${positionClass} ${opacityClass} ${scaleClass}`}
          >
            <div 
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-in-out bg-no-repeat`}
              style={{ 
                backgroundImage: `url(${image.url})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover'
              }}
            />
            
            {/* Dark overlay for better text visibility */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        );
      })}
      
      {/* Navigation dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setDisplayIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === displayIndex ? 'bg-white w-6' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Previous button */}
      <button
        onClick={() => setDisplayIndex(prev => (prev - 1 + images.length) % images.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 opacity-0 hover:opacity-100 focus:opacity-100 z-30"
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Next button */}
      <button
        onClick={() => setDisplayIndex(prev => (prev + 1) % images.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 opacity-0 hover:opacity-100 focus:opacity-100 z-30"
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default AnimatedHomepageCarousel;