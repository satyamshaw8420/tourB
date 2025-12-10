import React from 'react';
import { useLocation } from 'react-router-dom';
import HomePageFinancingPanel from './HomePageFinancingPanel';

const FinancialPage = () => {
  const location = useLocation();
  
  // Get trip data from location state or use sample data
  const tripData = location.state?.tripData || {
    userSelection: {
      location: { label: "Sample Destination" },
      days: 5,
      travelers: 2,
      budget: 2,
      needGuide: false
    },
    estimatedTotalCostPerCouple: {
      total_range: "₹25,000"
    }
  };

  return (
    <div className="w-full min-h-screen">
      <HomePageFinancingPanel tripData={tripData} />
    </div>
  );
};

export default FinancialPage;