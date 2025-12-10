import React from 'react';

const ViewTripSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 animate-pulse">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
        </div>

        {/* Trip Summary Card skeleton */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-r border-gray-100 pr-4 last:border-r-0">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Hotels Section skeleton */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          
          {/* Hotel Map skeleton */}
          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            <div className="h-12 bg-gray-200"></div>
            <div className="h-96 bg-gray-200"></div>
          </div>
          
          {/* Hotel Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Itinerary Section skeleton */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          
          {/* Itinerary Map skeleton */}
          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            <div className="h-12 bg-gray-200"></div>
            <div className="h-96 bg-gray-200"></div>
          </div>
          
          {/* Daily plans skeleton */}
          {[1, 2, 3].map((day) => (
            <div key={day} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-8">
              <div className="h-16 bg-gray-200"></div>
              <div className="p-6">
                <div className="h-20 bg-gray-200 rounded mb-6"></div>
                
                {/* Activities skeleton */}
                {[1, 2].map((activity) => (
                  <div key={activity} className="flex flex-col md:flex-row gap-6 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0 mb-6">
                    <div className="md:w-1/3 h-48 rounded-xl bg-gray-200"></div>
                    <div className="md:w-2/3">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="flex items-center bg-gray-100 p-3 rounded-lg">
                            <div className="h-5 bg-gray-200 rounded w-full"></div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewTripSkeleton;