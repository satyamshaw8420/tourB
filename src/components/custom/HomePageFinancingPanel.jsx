import React, { useState } from 'react';
import { FaUserShield, FaCrown, FaStar, FaGem } from "react-icons/fa6";

// Main component
const HomePageFinancingPanel = () => {
  // State declarations
  const [activeTab, setActiveTab] = useState('payFull');
  const [emiUpfront, setEmiUpfront] = useState(15000);
  const [emiTenure, setEmiTenure] = useState(6);
  const [friendsCount, setFriendsCount] = useState(2);
  const [walletAmount, setWalletAmount] = useState(2000);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedPremiumFeatures, setSelectedPremiumFeatures] = useState([]);

  // Constants
  const totalTripCost = "₹25,000";
  const numericTotal = 25000;

  // Calculated values
  const emiCalculations = {
    monthlyPayment: Math.round((numericTotal - emiUpfront) / emiTenure),
    totalInterest: Math.round(((numericTotal - emiUpfront) * 0.08 * emiTenure) / 12),
    nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
  };

  const recommendedPlans = [
    { name: "Budget Plan", amount: 2500, months: 12 },
    { name: "Balanced Plan", amount: 3500, months: 9 },
    { name: "Quick Plan", amount: 5000, months: 6 }
  ];

  // Premium add-ons that users can't resist
  const premiumAddons = [
    { 
      id: 'priority', 
      name: 'Priority Booking', 
      description: 'Skip the line with instant confirmation', 
      price: 499,
      icon: <FaStar className="text-yellow-500" />,
      popular: true
    },
    { 
      id: 'upgrade', 
      name: 'Room Upgrade', 
      description: 'Complimentary upgrade to premium suite', 
      price: 1299,
      icon: <FaGem className="text-blue-500" />,
      popular: false
    },
    { 
      id: 'concierge', 
      name: '24/7 Concierge', 
      description: 'Personal travel assistant throughout your trip', 
      price: 799,
      icon: <FaCrown className="text-purple-500" />,
      popular: true
    },
    { 
      id: 'insurance', 
      name: 'Premium Travel Insurance', 
      description: 'Complete coverage for all unexpected events', 
      price: 899,
      icon: <FaUserShield className="text-green-500" />,
      popular: false
    },
    { 
      id: 'airport', 
      name: 'VIP Airport Service', 
      description: 'Fast-track entry and lounge access', 
      price: 1499,
      icon: <FaStar className="text-orange-500" />,
      popular: true
    },
    { 
      id: 'activities', 
      name: 'Exclusive Activities', 
      description: 'Access to members-only experiences', 
      price: 1999,
      icon: <FaGem className="text-red-500" />,
      popular: false
    }
  ];

  // Handle quick add to wallet
  const addToWallet = (amount) => {
    setWalletAmount(walletAmount + amount);
  };

  // Toggle addon selection
  const toggleAddon = (addonId) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  // Toggle premium feature selection
  const togglePremiumFeature = (featureId) => {
    if (selectedPremiumFeatures.includes(featureId)) {
      setSelectedPremiumFeatures(selectedPremiumFeatures.filter(id => id !== featureId));
    } else {
      setSelectedPremiumFeatures([...selectedPremiumFeatures, featureId]);
    }
  };

  // Calculate total for selected addons
  const calculateAddonsTotal = () => {
    return selectedAddons.reduce((total, addonId) => {
      const addon = premiumAddons.find(a => a.id === addonId);
      return total + (addon ? addon.price : 0);
    }, 0);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full">
      {/* Left Panel - Spline 3D Visualization */}
      <div className="w-full lg:w-1/2 h-96 lg:h-full min-h-[400px]">
        <div className="w-full h-full overflow-hidden relative">
          <iframe 
            src='https://my.spline.design/techinspired3dassetslock-ejurCj9Jy57BC9ajbYUDAgO7/' 
            frameBorder='0' 
            width='100%' 
            height='100%'
            title='3D Lock Visualization'
            className="w-full h-full"
            style={{ 
              minHeight: '400px',
              position: 'absolute',
              top: 0,
              left: 0,
              border: 'none'
            }}
            loading="lazy"
          ></iframe>
        </div>
      </div>

      {/* Right Panel - Financing Options */}
      <div className="w-full lg:w-1/2 p-4 md:p-6 bg-white overflow-y-auto">
        <div className="max-w-2xl mx-auto h-full flex flex-col">
          <div className="flex-grow">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center financial-page-heading">
              <FaUserShield className="mr-2 text-blue-600 financial-page-icon" />
              Full Secure Trip Financing & Payment Options
            </h1>
            <p className="text-gray-600 mb-6 text-sm md:text-base financial-page-subheading">How would you like to afford this trip?</p>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-1 md:gap-2 mb-6 md:mb-8 border-b border-gray-200 financial-page-tabs">
              {[
                { id: 'payFull', label: 'Pay in Full' },
                { id: 'emi', label: 'EMI Plan' },
                { id: 'split', label: 'Split with Friends' },
                { id: 'wallet', label: 'Trip Wallet' },
                { id: 'offers', label: 'Offers & Rewards' },
                { id: 'addons', label: 'Premium Add-ons' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-xs md:text-sm font-medium rounded-t-lg transition-colors financial-page-tab-button ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 financial-page-tab-active'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 financial-page-tab-inactive'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content - This section should be scrollable */}
            <div className="flex-grow overflow-y-auto financial-page-content">
              {/* Pay in Full */}
              {activeTab === 'payFull' && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-100 mb-6 financial-page-panel">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 financial-page-panel-title">Pay in Full Now</h2>
                  <p className="text-gray-600 mb-4 md:mb-6 text-sm financial-page-panel-description">Simple and straightforward payment with no extra charges.</p>
                  
                  <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm mb-4 md:mb-6 financial-page-amount-card">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 text-sm financial-page-amount-label">Total Amount</span>
                    </div>
                    <div className="text-lg md:text-2xl font-bold text-gray-900 mb-2 financial-page-amount-value">{totalTripCost}</div>
                    <div className="text-xs md:text-sm text-gray-500 financial-page-payment-methods">Payment methods: UPI, Card, Netbanking, Wallet</div>
                  </div>
                  
                  <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 md:py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md text-sm md:text-base financial-page-main-button">
                    Pay Now
                  </button>
                </div>
              )}

              {/* EMI Plan */}
              {activeTab === 'emi' && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 md:p-6 border border-green-100 mb-6 financial-page-panel">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 financial-page-panel-title">EMI / Monthly Plan</h2>
                  <p className="text-gray-600 mb-4 md:mb-6 text-sm financial-page-panel-description">Spread the cost over time with flexible EMIs.</p>
                  
                  <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm mb-4 md:mb-6 financial-page-emi-card">
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                      <span className="text-gray-600 text-sm financial-page-cost-label">Total Trip Cost</span>
                      <span className="text-lg md:text-xl font-bold text-gray-900 financial-page-cost-value">{totalTripCost}</span>
                    </div>
                    
                    <div className="mb-4 md:mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 text-sm financial-page-paynow-label">Pay now:</span>
                        <span className="font-medium text-sm financial-page-paynow-value">₹{emiUpfront.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={numericTotal}
                        value={emiUpfront}
                        onChange={(e) => setEmiUpfront(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer financial-page-range-input"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1 financial-page-range-labels">
                        <span>₹0</span>
                        <span>₹{numericTotal.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4 md:mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 text-sm financial-page-tenure-label">Tenure:</span>
                        <span className="font-medium text-sm financial-page-tenure-value">{emiTenure} months</span>
                      </div>
                      <div className="flex flex-wrap gap-1 md:gap-2 financial-page-tenure-options">
                        {[3, 6, 9, 12].map((months) => (
                          <button
                            key={months}
                            onClick={() => setEmiTenure(months)}
                            className={`flex-1 py-1 md:py-2 text-xs md:text-sm font-medium rounded-lg financial-page-tenure-button ${
                              emiTenure === months
                                ? 'bg-green-600 text-white financial-page-tenure-selected'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 financial-page-tenure-unselected'
                            }`}
                          >
                            {months}M
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6 financial-page-payment-details">
                      <div className="bg-green-50 rounded-lg p-2 md:p-3 financial-page-monthly-payment">
                        <div className="text-xs md:text-sm text-green-600 financial-page-monthly-label">Monthly Payment</div>
                        <div className="text-sm md:text-lg font-bold text-green-800 financial-page-monthly-value">₹{emiCalculations.monthlyPayment.toLocaleString()}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 md:p-3 financial-page-total-interest">
                        <div className="text-xs md:text-sm text-green-600 financial-page-interest-label">Total Interest</div>
                        <div className="text-sm md:text-lg font-bold text-green-800 financial-page-interest-value">₹{emiCalculations.totalInterest.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4 financial-page-next-payment">
                      Next payment due: {emiCalculations.nextDueDate}
                    </div>
                  </div>
                  
                  <div className="mb-4 md:mb-6 financial-page-recommended-plans">
                    <h3 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base financial-page-recommended-title">Recommended Plans</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 financial-page-plan-grid">
                      {recommendedPlans.map((plan, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setEmiUpfront(numericTotal - (plan.amount * plan.months));
                            setEmiTenure(plan.months);
                          }}
                          className="bg-white border border-gray-200 rounded-lg p-2 md:p-3 text-left hover:border-green-300 hover:bg-green-50 transition-colors financial-page-plan-button"
                        >
                          <div className="font-medium text-gray-900 text-xs md:text-sm financial-page-plan-name">{plan.name}</div>
                          <div className="text-xs text-gray-600 financial-page-plan-amount">₹{plan.amount.toLocaleString()} / month</div>
                          <div className="text-xs text-gray-500 financial-page-plan-duration">for {plan.months} months</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-2 md:py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md text-sm md:text-base financial-page-main-button">
                    Confirm EMI Plan
                  </button>
                </div>
              )}

              {/* Split with Friends */}
              {activeTab === 'split' && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 md:p-6 border border-purple-100 mb-6 financial-page-panel">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 financial-page-panel-title">Split with Friends</h2>
                  <p className="text-gray-600 mb-4 md:mb-6 text-sm financial-page-panel-description">Share the cost with your travel companions.</p>
                  
                  <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm mb-4 md:mb-6 financial-page-split-card">
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                      <span className="text-gray-600 text-sm financial-page-total-label">Total Amount</span>
                      <span className="text-lg md:text-xl font-bold text-gray-900 financial-page-total-value">{totalTripCost}</span>
                    </div>
                    
                    <div className="mb-3 md:mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2 financial-page-travelers-label">
                        Number of Travelers
                      </label>
                      <div className="flex items-center financial-page-travelers-controls">
                        <button
                          onClick={() => setFriendsCount(Math.max(1, friendsCount - 1))}
                          className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gray-100 rounded-l-lg text-gray-600 hover:bg-gray-200 text-sm md:text-base financial-page-decrement-button"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={friendsCount}
                          onChange={(e) => setFriendsCount(Math.max(1, Number(e.target.value)))}
                          className="w-full h-8 md:h-10 text-center border-y border-gray-200 text-sm md:text-base financial-page-travelers-input"
                        />
                        <button
                          onClick={() => setFriendsCount(friendsCount + 1)}
                          className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gray-100 rounded-r-lg text-gray-600 hover:bg-gray-200 text-sm md:text-base financial-page-increment-button"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6 financial-page-per-person-share">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium financial-page-share-label">Per Person Share</span>
                        <span className="text-lg font-bold text-purple-700 financial-page-share-value">₹{(numericTotal / friendsCount).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500 financial-page-travelers-count">Total travelers: {friendsCount}</div>
                    </div>
                    
                    <div className="mb-4 md:mb-6 financial-page-quick-share">
                      <h3 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base financial-page-quick-share-title">Quick Share Options</h3>
                      <div className="grid grid-cols-2 gap-2 md:gap-3 financial-page-share-options">
                        {[2, 3, 4, 5].map((count) => (
                          <button
                            key={count}
                            onClick={() => setFriendsCount(count)}
                            className={`py-2 text-sm font-medium rounded-lg financial-page-share-button ${
                              friendsCount === count
                                ? 'bg-purple-600 text-white financial-page-share-selected'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 financial-page-share-unselected'
                            }`}
                          >
                            {count} People
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold py-2 md:py-3 px-6 rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all shadow-md text-sm md:text-base financial-page-main-button">
                    Generate Sharing Links
                  </button>
                </div>
              )}

              {/* Trip Wallet */}
              {activeTab === 'wallet' && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 md:p-6 border border-amber-100 mb-6 financial-page-panel">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 financial-page-panel-title">Trip Wallet</h2>
                  <p className="text-gray-600 mb-4 md:mb-6 text-sm financial-page-panel-description">Save money with our trip wallet and exclusive offers.</p>
                  
                  <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm mb-4 md:mb-6 financial-page-wallet-card">
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                      <span className="text-gray-600 text-sm financial-page-balance-label">Current Wallet Balance</span>
                      <span className="text-lg md:text-xl font-bold text-gray-900 financial-page-balance-value">₹{walletAmount.toLocaleString()}</span>
                    </div>
                    
                    <div className="mb-4 md:mb-6 financial-page-add-money">
                      <label className="block text-sm font-medium text-gray-700 mb-2 financial-page-add-label">
                        Add Money to Wallet
                      </label>
                      <div className="flex flex-wrap gap-2 md:gap-3 financial-page-amount-options">
                        {[500, 1000, 2000, 5000].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => addToWallet(amount)}
                            className="flex-1 py-2 text-sm font-medium bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors financial-page-amount-button"
                          >
                            ₹{amount.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6 financial-page-potential-savings">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium financial-page-savings-label">Potential Savings</span>
                        <span className="text-lg font-bold text-amber-700 financial-page-savings-value">₹{(selectedAddons.length * 500).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500 financial-page-addons-info">Using wallet for {selectedAddons.length} add-ons</div>
                    </div>
                  </div>
                  
                  <button className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold py-2 md:py-3 px-6 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-md text-sm md:text-base financial-page-main-button">
                    Add to Wallet
                  </button>
                </div>
              )}

              {/* Offers & Rewards */}
              {activeTab === 'offers' && (
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 md:p-6 border border-pink-100 mb-6 financial-page-panel">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 financial-page-panel-title">Special Offers & Rewards</h2>
                  <p className="text-gray-600 mb-4 md:mb-6 text-sm financial-page-panel-description">Unlock exclusive discounts and rewards for your trip.</p>
                  
                  <div className="space-y-4 md:space-y-6 financial-page-offers-list">
                    <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm financial-page-offer-item">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 financial-page-offer-title">Early Bird Discount</h3>
                          <p className="text-sm text-gray-600 financial-page-offer-description">Book now and save 15%</p>
                        </div>
                        <span className="bg-pink-100 text-pink-800 text-xs font-bold px-2 py-1 rounded financial-page-discount-badge">15% OFF</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-3 financial-page-validity">Valid till: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                      <button className="w-full bg-pink-100 text-pink-700 font-medium py-2 rounded-lg hover:bg-pink-200 transition-colors text-sm financial-page-apply-button">
                        Apply Offer
                      </button>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm financial-page-offer-item">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 financial-page-offer-title">Referral Reward</h3>
                          <p className="text-sm text-gray-600 financial-page-offer-description">Refer friends and earn ₹500 each</p>
                        </div>
                        <span className="bg-pink-100 text-pink-800 text-xs font-bold px-2 py-1 rounded financial-page-reward-badge">₹500</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-3 financial-page-no-expiry">No expiry</div>
                      <button className="w-full bg-pink-100 text-pink-700 font-medium py-2 rounded-lg hover:bg-pink-200 transition-colors text-sm financial-page-share-button">
                        Share Referral Link
                      </button>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm financial-page-offer-item">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 financial-page-offer-title">Seasonal Bonus</h3>
                          <p className="text-sm text-gray-600 financial-page-offer-description">Additional 10% off on add-ons</p>
                        </div>
                        <span className="bg-pink-100 text-pink-800 text-xs font-bold px-2 py-1 rounded financial-page-bonus-badge">10% OFF</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-3 financial-page-limited-period">Limited period offer</div>
                      <button className="w-full bg-pink-100 text-pink-700 font-medium py-2 rounded-lg hover:bg-pink-200 transition-colors text-sm financial-page-apply-seasonal-button">
                        Apply Seasonal Bonus
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Premium Add-ons */}
              {activeTab === 'addons' && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 md:p-6 border border-indigo-100 mb-6 financial-page-panel">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 financial-page-panel-title">Premium Add-ons & Features</h2>
                  <p className="text-gray-600 mb-4 md:mb-6 text-sm financial-page-panel-description">Enhance your travel experience with our exclusive premium offerings.</p>
                  
                  <div className="mb-6 financial-page-addons-selection">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm md:text-base financial-page-addons-title">Must-Have Premium Add-ons</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 financial-page-addons-grid">
                      {premiumAddons.map((addon) => (
                        <div 
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`bg-white rounded-lg p-4 shadow-sm border-2 cursor-pointer transition-all hover:shadow-md financial-page-addon-item ${
                            selectedAddons.includes(addon.id) 
                              ? 'border-indigo-500 bg-indigo-50 financial-page-addon-selected' 
                              : 'border-gray-200 hover:border-indigo-300 financial-page-addon-unselected'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="mr-3 mt-1 financial-page-addon-icon">
                              {addon.icon}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-900 text-sm financial-page-addon-name">{addon.name}</h4>
                                {addon.popular && (
                                  <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded financial-page-addon-popular">POPULAR</span>
                                )}
                              </div>
                              <p className="text-gray-600 text-xs mt-1 financial-page-addon-description">{addon.description}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-indigo-600 font-bold text-sm financial-page-addon-price">₹{addon.price}</span>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center financial-page-addon-checkbox ${
                                  selectedAddons.includes(addon.id) 
                                    ? 'bg-indigo-600 border-indigo-600 financial-page-addon-checkbox-selected' 
                                    : 'border-gray-300 financial-page-addon-checkbox-unselected'
                                }`}>
                                  {selectedAddons.includes(addon.id) && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm mb-6 financial-page-total-addons">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium financial-page-addons-total-label">Selected Add-ons Total:</span>
                      <span className="text-lg font-bold text-indigo-700 financial-page-addons-total-value">₹{calculateAddonsTotal().toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 financial-page-addons-count">{selectedAddons.length} add-ons selected</div>
                  </div>
                  
                  <button className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 md:py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md text-sm md:text-base financial-page-main-button">
                    Add to Booking
                  </button>
                </div>
              )}
            </div>

            {/* Action Button - Fixed at bottom */}
            <div className="pt-4 border-t border-gray-200 mt-auto financial-page-action-section">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 financial-page-action-container">
                <div className="text-center sm:text-left financial-page-action-info">
                  <div className="text-sm font-medium text-gray-900 financial-page-action-label">
                    {activeTab === 'payFull' ? 'Total Amount:' : 
                     activeTab === 'emi' ? 'First Payment:' : 
                     activeTab === 'split' ? 'Per Person Share:' : 
                     activeTab === 'wallet' ? 'Wallet Balance:' : 
                     activeTab === 'addons' ? 'Add-ons Total:' :
                     'Discount Applied:'}
                  </div>
                  <div className="text-lg font-bold text-gray-900 financial-page-action-value">
                    {activeTab === 'payFull' ? totalTripCost : 
                     activeTab === 'emi' ? `₹${emiUpfront.toLocaleString()}` : 
                     activeTab === 'split' ? `₹${(numericTotal / friendsCount).toLocaleString()}` : 
                     activeTab === 'wallet' ? `₹${walletAmount.toLocaleString()}` : 
                     activeTab === 'addons' ? `₹${calculateAddonsTotal().toLocaleString()}` :
                     `${totalTripCost}`}
                  </div>
                  {activeTab === 'emi' && (
                    <div className="text-xs text-gray-500 financial-page-emi-details">
                      Next payment: {emiCalculations.nextDueDate} (₹{emiCalculations.monthlyPayment.toLocaleString()}/month)
                    </div>
                  )}
                </div>
                <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 md:py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md text-sm md:text-base financial-page-main-button">
                  {activeTab === 'payFull' ? 'Pay Now' : 
                   activeTab === 'emi' ? 'Confirm Plan' : 
                   activeTab === 'split' ? 'Generate Links' : 
                   activeTab === 'wallet' ? 'Add to Wallet' : 
                   activeTab === 'addons' ? 'Add Premium Features' :
                   'Apply Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageFinancingPanel;