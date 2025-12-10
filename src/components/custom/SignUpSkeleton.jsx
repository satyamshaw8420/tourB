import React from 'react';

const SignUpSkeleton = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-700 to-orange-600 p-4 sm:p-6 md:p-8 overflow-hidden relative animate-pulse">
      {/* Animated glowing background elements */}
      <div className="absolute inset-0 overflow-hidden hidden sm:block">
        {/* Central glowing orb */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"></div>
        
        {/* Floating glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-10 left-10 w-16 h-16 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-yellow-400/30 to-orange-400/30 blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 sm:w-40 sm:h-40 rounded-full bg-gradient-to-r from-green-400/30 to-blue-400/30 blur-xl"></div>
        
        {/* Additional moving glowing elements */}
        <div className="absolute top-1/3 right-1/3 w-10 h-10 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-cyan-400/40 to-blue-400/40 blur-lg hidden md:block"></div>
        <div className="absolute bottom-1/4 left-1/3 w-12 h-12 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-purple-400/40 to-pink-400/40 blur-lg hidden md:block"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Glowing card skeleton */}
        <div 
          className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20"
        >
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              {/* Logo skeleton */}
              <div className="mx-auto flex items-center justify-center -mt-6 sm:-mt-8">
                <div className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg h-16 w-16 sm:h-24 sm:w-24"></div>
              </div>
              
              {/* Title skeleton */}
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mt-4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>

            {/* Google Sign In Button skeleton */}
            <div className="w-full flex items-center justify-center gap-3 bg-white/20 border border-white/30 rounded-lg py-3 px-6 mb-6">
              <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
              <div className="h-5 bg-gray-200 rounded w-2/3"></div>
            </div>

            {/* Divider skeleton */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-white/20"></div>
              <div className="h-4 bg-gray-200 rounded w-10 mx-2"></div>
              <div className="flex-grow border-t border-white/20"></div>
            </div>

            {/* Features list skeleton */}
            <div className="space-y-3 mb-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center">
                  <div className="h-5 w-5 bg-gray-200 rounded-full mr-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>

            {/* Footer text skeleton */}
            <div className="text-center">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpSkeleton;