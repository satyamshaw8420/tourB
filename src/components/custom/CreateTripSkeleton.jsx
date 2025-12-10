import React from 'react';

const CreateTripSkeleton = () => {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 animate-pulse">
      {/* Premium cinematic background with misty mountains */}
      <div className="absolute inset-0 z-0">
        {/* Blue-to-teal gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-teal-800 to-blue-700"></div>
        
        {/* Misty mountain silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3">
          {/* Mountain layers for depth */}
          <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div className="absolute bottom-10 left-10 w-64 h-40 bg-black/20 rounded-t-full transform rotate-12"></div>
          <div className="absolute bottom-5 right-20 w-80 h-52 bg-black/25 rounded-t-full transform -rotate-6"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-60 bg-black/20 rounded-t-full"></div>
          <div className="absolute bottom-16 left-2/3 w-72 h-44 bg-black/30 rounded-t-full transform rotate-3"></div>
        </div>
        
        {/* Soft blur overlay for dreamy effect */}
        <div className="absolute inset-0 backdrop-blur-sm"></div>
      </div>
      
      {/* Frosted glass panel */}
      <div className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-8">
        <div className="text-center mb-10">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>

        {/* Destination Image Preview skeleton */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-md h-48 rounded-xl bg-gray-200 shadow-lg border-2 border-white/30"></div>
        </div>

        {/* Destination Field skeleton */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <div className="h-6 w-6 bg-gray-200 rounded-full mr-2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>

        {/* Traveler Selection skeleton */}
        <div className="mb-8">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div 
                key={item}
                className="h-24 bg-gray-200 rounded-xl"
              ></div>
            ))}
          </div>
        </div>

        {/* Days Input skeleton */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <div className="h-6 w-6 bg-gray-200 rounded-full mr-2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
        </div>

        {/* Budget Selection skeleton */}
        <div className="mb-10">
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div 
                key={item}
                className="h-24 bg-gray-200 rounded-xl"
              ></div>
            ))}
          </div>
        </div>

        {/* Multi-Destination Trip Button skeleton */}
        <div className="flex justify-center mb-6">
          <div className="h-12 bg-gray-200 rounded-full w-2/3"></div>
        </div>
        
        {/* Submit Button skeleton */}
        <div className="flex justify-center">
          <div className="h-12 bg-gray-200 rounded-full w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default CreateTripSkeleton;