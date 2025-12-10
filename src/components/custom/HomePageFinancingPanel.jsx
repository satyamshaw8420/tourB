import React, { useState } from 'react';
import { FaPlaneDeparture, FaUserShield, FaCrown, FaStar, FaGem, FaArrowLeft, FaLock, FaCreditCard, FaMobileAlt, FaWallet, FaUserTie } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

// Main component
const HomePageFinancingPanel = ({ tripData }) => {
  const navigate = useNavigate();
  
  // State declarations
  const [activeTab, setActiveTab] = useState('payFull');
  const [emiUpfront, setEmiUpfront] = useState(15000);
  const [emiTenure, setEmiTenure] = useState(6);
  const [friendsCount, setFriendsCount] = useState(2);
  const [walletAmount, setWalletAmount] = useState(2000);
  const [selectedAddons, setSelectedAddons] = useState([]);
  
  // Function to get guide cost based on budget tier
  const getGuideCostFromBudget = (budgetTier) => {
    switch(budgetTier) {
      case 1: return 3000; // Cheap tier
      case 2: return 5000; // Moderate tier
      case 3: return 8000; // Luxury tier
      default: return 0;
    }
  };

  // Calculate costs
  // Use custom budget amount if provided, otherwise use base cost of 25000
  const baseCost = tripData?.userSelection?.customBudget 
    ? parseInt(tripData.userSelection.customBudget) || 25000
    : 25000;
    
  const guideCost = tripData?.userSelection?.needGuide 
    ? getGuideCostFromBudget(tripData?.userSelection?.budget)
    : 0;
  const totalTripCost = baseCost + guideCost;
  
  // Calculated values with proper error handling
  const emiCalculations = {
    monthlyPayment: totalTripCost > emiUpfront ? Math.round((totalTripCost - emiUpfront) / emiTenure) : 0,
    totalInterest: totalTripCost > emiUpfront ? Math.round(((totalTripCost - emiUpfront) * 0.08 * emiTenure) / 12) : 0,
    nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
  };

  // Recommended EMI plans with proper validation
  const recommendedPlans = [
    { 
      name: "Budget Plan", 
      amount: totalTripCost > 0 ? Math.max(1000, Math.round(totalTripCost * 0.1)) : 2500, 
      months: 12 
    },
    { 
      name: "Balanced Plan", 
      amount: totalTripCost > 0 ? Math.max(1500, Math.round(totalTripCost * 0.15)) : 3500, 
      months: 9 
    },
    { 
      name: "Quick Plan", 
      amount: totalTripCost > 0 ? Math.max(2000, Math.round(totalTripCost * 0.2)) : 5000, 
      months: 6 
    }
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

  // Calculate total for selected addons
  const calculateAddonsTotal = () => {
    return selectedAddons.reduce((total, addonId) => {
      const addon = premiumAddons.find(a => a.id === addonId);
      return total + (addon ? addon.price || 0 : 0);
    }, 0);
  };

  // Payment methods
  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: <FaMobileAlt className="text-blue-500" /> },
    { id: 'card', name: 'Credit/Debit Card', icon: <FaCreditCard className="text-green-500" /> },
    { id: 'netbanking', name: 'Net Banking', icon: <FaWallet className="text-purple-500" /> },
    { id: 'wallet', name: 'Wallet', icon: <FaWallet className="text-orange-500" /> }
  ];

  return (
    <div className="relative w-full min-h-screen overflow-auto">
      {/* Background with beach golden hour aesthetic - scrolls with content */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "scroll" // Ensure background scrolls with content
        }}
      >
        {/* Gaussian blur overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-black/10"></div>
        
        {/* Dark gradient overlay from top */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-transparent"></div>
      </div>

      {/* Main content container - scrollable */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-white bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 hover:bg-black/30 transition-all"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        {/* Page Header / Title Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <FaPlaneDeparture className="text-blue-600 text-xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0D1E46] tracking-wide">
              Full Secure Trip Financing & Payment Options
            </h1>
          </div>
          <p className="text-lg text-[#0D1E46]/80 font-medium">
            How would you like to afford this trip?
          </p>
        </div>

        {/* Trip Summary Bar */}
        <div className="bg-white/30 backdrop-blur-lg border border-white/40 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl md:text-2xl font-bold text-[#0D1E46]">
                {tripData?.userSelection?.location?.label || 'Your Trip'}
              </h2>
              <p className="text-[#0D1E46]/80">
                {tripData?.userSelection?.days || 'N/A'} days • {tripData?.userSelection?.travelers || 'N/A'} travelers
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <div className="text-sm text-gray-600 mb-1">Total Trip Cost</div>
              <div className="text-xl md:text-2xl font-bold text-[#0D1E46]">
                {activeTab === 'payFull' ? `₹${totalTripCost.toLocaleString()}` : 
                 activeTab === 'emi' ? `₹${emiUpfront.toLocaleString()}` : 
                 activeTab === 'split' ? `₹${friendsCount > 0 ? Math.round(totalTripCost / friendsCount).toLocaleString() : 0}` : 
                 activeTab === 'wallet' ? `₹${walletAmount.toLocaleString()}` : 
                 activeTab === 'addons' ? `₹${calculateAddonsTotal().toLocaleString()}` :
                 `₹${totalTripCost.toLocaleString()}`}
              </div>
              {activeTab === 'emi' && (
                <div className="text-xs text-gray-500">
                  Next payment: {emiCalculations.nextDueDate} (₹{emiCalculations.monthlyPayment.toLocaleString()}/month)
                </div>
              )}
              {tripData?.userSelection?.needGuide && (
                <div className="flex items-center justify-center md:justify-end mt-1">
                  <FaUserTie className="text-blue-600 mr-1" />
                  <span className="text-sm text-blue-600 font-medium">Guide Service Included (+₹{guideCost.toLocaleString()})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 bg-white/20 backdrop-blur-lg rounded-2xl p-2 border border-white/30">
          {[
            { id: 'payFull', label: 'Pay in Full', icon: <FaLock className="mr-2" /> },
            { id: 'emi', label: 'EMI Plans', icon: <FaCreditCard className="mr-2" /> },
            { id: 'split', label: 'Split with Friends', icon: <FaUserShield className="mr-2" /> },
            { id: 'wallet', label: 'Wallet', icon: <FaWallet className="mr-2" /> },
            { id: 'addons', label: 'Premium Add-ons', icon: <FaCrown className="mr-2" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 m-1 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#0D1E46] font-semibold shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/40">
          {/* Pay in Full Tab */}
          {activeTab === 'payFull' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#0D1E46] mb-4">Pay Full Amount</h2>
              <p className="text-[#0D1E46]/80 mb-6">
                Pay the entire trip cost upfront and enjoy exclusive benefits including priority booking and complimentary upgrades.
              </p>
              
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Total Trip Cost</h3>
                    <p className="text-blue-100">Complete payment in one transaction</p>
                  </div>
                  <div className="text-3xl font-bold">₹{totalTripCost.toLocaleString()}</div>
                </div>
                
                {tripData?.userSelection?.needGuide && (
                  <div className="mt-4 pt-4 border-t border-blue-400/30">
                    <div className="flex justify-between">
                      <span>Base Trip Cost:</span>
                      <span>₹{baseCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="flex items-center">
                        <FaUserTie className="mr-2" />
                        <span>Professional Guide Service:</span>
                      </div>
                      <span>+₹{guideCost.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white/50 rounded-xl p-4 border border-white">
                  <h4 className="font-bold text-[#0D1E46] mb-2 flex items-center">
                    <FaStar className="text-yellow-500 mr-2" /> Exclusive Benefits
                  </h4>
                  <ul className="text-[#0D1E46]/80 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Priority booking and instant confirmation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Complimentary room upgrade (subject to availability)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>24/7 dedicated customer support</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Free cancellation up to 48 hours before departure</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white/50 rounded-xl p-4 border border-white">
                  <h4 className="font-bold text-[#0D1E46] mb-2 flex items-center">
                    <FaLock className="text-blue-500 mr-2" /> Secure Payment
                  </h4>
                  <ul className="text-[#0D1E46]/80 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>End-to-end encryption for all transactions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>PCI DSS compliant payment gateway</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Instant payment confirmation via email/SMS</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>100% refund guarantee if trip cannot proceed</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center">
                  <FaLock className="mr-2" />
                  Proceed to Secure Payment (₹{totalTripCost.toLocaleString()})
                </button>
                <p className="text-center text-[#0D1E46]/60 text-sm mt-3">
                  Your payment details are securely encrypted and protected
                </p>
              </div>
            </div>
          )}

          {/* EMI Plans Tab */}
          {activeTab === 'emi' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#0D1E46] mb-4">Flexible EMI Plans</h2>
              <p className="text-[#0D1E46]/80 mb-6">
                Break your trip cost into affordable monthly installments with our flexible EMI options.
              </p>
              
              <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-xl font-bold mb-4">EMI Calculator</h3>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span>Pay now:</span>
                    <span className="font-bold text-lg">₹{emiUpfront.toLocaleString()}</span>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">0%</span>
                      <span className="text-sm">100%</span>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-white/30">
                      <div 
                        style={{ width: `${totalTripCost > 0 ? (emiUpfront / totalTripCost) * 100 : 0}%` }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-white"
                      ></div>
                    </div>
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max={totalTripCost > 0 ? totalTripCost : 100000}
                    value={emiUpfront}
                    onChange={(e) => setEmiUpfront(Number(e.target.value))}
                    className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                  <div className="flex justify-between text-xs text-white/70 mt-1">
                    <span>₹0</span>
                    <span>₹{totalTripCost > 0 ? totalTripCost.toLocaleString() : '1,00,000'}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-sm text-white/80">Monthly Payment</div>
                    <div className="text-lg font-bold text-white">₹{emiCalculations.monthlyPayment.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-sm text-white/80">Total Interest</div>
                    <div className="text-lg font-bold text-white">₹{emiCalculations.totalInterest.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <span>Select Tenure:</span>
                  <span className="font-bold">{emiTenure} months</span>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {[3, 6, 9, 12].map((months) => (
                    <button
                      key={months}
                      onClick={() => setEmiTenure(months)}
                      className={`py-2 text-sm font-medium rounded-lg ${
                        emiTenure === months
                          ? 'bg-white text-[#0D1E46] shadow'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {months}M
                    </button>
                  ))}
                </div>
                
                <p className="text-sm text-white/80 mb-4">
                  Next payment: {emiCalculations.nextDueDate} (₹{emiCalculations.monthlyPayment.toLocaleString()}/month)
                </p>
                
                <button className="w-full bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-[#0D1E46] font-bold py-3 px-4 rounded-lg shadow-lg transition-all">
                  Proceed with EMI Plan
                </button>
              </div>
              
              {/* Recommended Plans */}
              <div>
                <h3 className="text-xl font-bold text-[#0D1E46] mb-4">Recommended Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedPlans.map((plan, index) => (
                    <div 
                      key={index} 
                      className="bg-white/50 rounded-xl p-4 border border-white hover:bg-white/70 transition-all cursor-pointer"
                      onClick={() => {
                        setEmiUpfront(totalTripCost - (plan.amount * plan.months));
                        setEmiTenure(plan.months);
                      }}
                    >
                      <h4 className="font-bold text-[#0D1E46]">{plan.name}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-lg font-bold">₹{plan.amount.toLocaleString()}</span>
                        <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                          {plan.months} months
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8">
                <button className="w-full bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center">
                  <FaCreditCard className="mr-2" />
                  Proceed with EMI Plan (₹{emiUpfront.toLocaleString()} now)
                </button>
                <p className="text-center text-[#0D1E46]/60 text-sm mt-3">
                  Flexible payments with competitive interest rates
                </p>
              </div>
            </div>
          )}

          {/* Split with Friends Tab */}
          {activeTab === 'split' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#0D1E46] mb-4">Split with Friends</h2>
              <p className="text-[#0D1E46]/80 mb-6">
                Share the cost of your trip with friends and family. Simply enter the number of people and we'll calculate each person's share.
              </p>
              
              {/* Friends Count Selector */}
              <div className="bg-white/50 rounded-xl p-6 border border-white max-w-md mx-auto">
                <h3 className="font-bold text-[#0D1E46] mb-4 text-center">Number of People</h3>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setFriendsCount(Math.max(2, friendsCount - 1))}
                    className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold hover:bg-blue-600 transition-colors"
                  >
                    -
                  </button>
                  <div className="mx-6 text-3xl font-bold text-[#0D1E46] w-12 text-center">
                    {friendsCount}
                  </div>
                  <button
                    onClick={() => setFriendsCount(Math.min(20, friendsCount + 1))}
                    className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold hover:bg-blue-600 transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-center text-[#0D1E46]/60 mt-3">
                  Including you
                </p>
              </div>
              
              {/* Cost Breakdown */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-xl font-bold mb-4">Cost Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Trip Cost:</span>
                    <span>₹{totalTripCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of People:</span>
                    <span>{friendsCount}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-purple-400/30">
                    <span className="font-bold text-lg">Each Person Pays:</span>
                    <span className="font-bold text-xl">₹{friendsCount > 0 ? Math.round(totalTripCost / friendsCount).toLocaleString() : 0}</span>
                  </div>
                </div>
                
                {tripData?.userSelection?.needGuide && (
                  <div className="mt-4 pt-4 border-t border-purple-400/30">
                    <div className="flex justify-between">
                      <span>Base Trip Cost per Person:</span>
                      <span>₹{friendsCount > 0 ? Math.round(baseCost / friendsCount).toLocaleString() : 0}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="flex items-center">
                        <FaUserTie className="mr-2" />
                        <span>Guide Service per Person:</span>
                      </div>
                      <span>₹{friendsCount > 0 ? Math.round(guideCost / friendsCount).toLocaleString() : 0}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Split Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/50 rounded-xl p-4 border border-white">
                  <h4 className="font-bold text-[#0D1E46] mb-2 flex items-center">
                    <FaUserShield className="text-blue-500 mr-2" /> How It Works
                  </h4>
                  <ul className="text-[#0D1E46]/80 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">1.</span>
                      <span>Enter the number of people sharing the cost</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">2.</span>
                      <span>We calculate each person's share automatically</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">3.</span>
                      <span>Send payment links to your friends</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">4.</span>
                      <span>Track payments in real-time</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white/50 rounded-xl p-4 border border-white">
                  <h4 className="font-bold text-[#0D1E46] mb-2 flex items-center">
                    <FaStar className="text-yellow-500 mr-2" /> Benefits
                  </h4>
                  <ul className="text-[#0D1E46]/80 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>No need to collect money manually</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Automatic reconciliation of payments</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Reminders for pending payments</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Group chat for trip coordination</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center">
                  <FaUserShield className="mr-2" />
                  Split Cost & Invite Friends (₹{Math.round(totalTripCost / friendsCount).toLocaleString()} each)
                </button>
                <p className="text-center text-[#0D1E46]/60 text-sm mt-3">
                  Make group travel planning simple and stress-free
                </p>
              </div>
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#0D1E46] mb-4">Pay with Wallet</h2>
              <p className="text-[#0D1E46]/80 mb-6">
                Use your TravelEase wallet balance to pay for your trip. Add funds to your wallet for convenient future payments.
              </p>
              
              {/* Wallet Balance */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">Your Wallet Balance</h3>
                    <p className="text-indigo-100">Use your wallet credits for this trip</p>
                  </div>
                  <div className="text-3xl font-bold">₹{walletAmount.toLocaleString()}</div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-indigo-400/30">
                  <div className="flex justify-between mb-2">
                    <span>Trip Cost:</span>
                    <span>₹{totalTripCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Wallet Balance:</span>
                    <span>₹{walletAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-indigo-400/30 font-bold">
                    <span>
                      {walletAmount >= totalTripCost 
                        ? 'Remaining Balance:' 
                        : 'Additional Amount Needed:'}
                    </span>
                    <span>
                      ₹{Math.abs(walletAmount - totalTripCost).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Quick Add Options */}
              <div>
                <h3 className="text-xl font-bold text-[#0D1E46] mb-4">Quick Add to Wallet</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1000, 2000, 5000, 10000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => addToWallet(amount)}
                      className="bg-white/50 hover:bg-white/70 rounded-xl p-4 border border-white transition-all text-[#0D1E46] font-bold"
                    >
                      + ₹{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Add Custom Amount */}
              <div className="bg-white/50 rounded-xl p-6 border border-white">
                <h3 className="font-bold text-[#0D1E46] mb-4">Add Custom Amount</h3>
                <div className="flex">
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="flex-grow py-3 px-4 rounded-l-xl border border-r-0 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-r-xl font-bold transition-colors">
                    Add
                  </button>
                </div>
              </div>
              
              {/* Payment Options */}
              <div className="mt-8">
                {walletAmount >= totalTripCost ? (
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center">
                    <FaWallet className="mr-2" />
                    Pay ₹{totalTripCost.toLocaleString()} from Wallet
                  </button>
                ) : (
                  <div className="space-y-4">
                    <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center">
                      <FaWallet className="mr-2" />
                      Pay ₹{walletAmount.toLocaleString()} from Wallet
                    </button>
                    <div className="text-center text-[#0D1E46] font-bold">
                      +
                    </div>
                    <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-500 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center">
                      <FaCreditCard className="mr-2" />
                      Pay Remaining ₹{totalTripCost > walletAmount ? (totalTripCost - walletAmount).toLocaleString() : 0} via Card
                    </button>
                  </div>
                )}
                <p className="text-center text-[#0D1E46]/60 text-sm mt-3">
                  Secure and convenient wallet payments
                </p>
              </div>
            </div>
          )}

          {/* Premium Add-ons Tab */}
          {activeTab === 'addons' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#0D1E46] mb-4">Premium Add-ons</h2>
              <p className="text-[#0D1E46]/80 mb-6">
                Enhance your travel experience with our premium add-ons. Select the services you'd like to include in your trip.
              </p>
              
              {/* Add-ons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {premiumAddons.map((addon) => (
                  <div 
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`bg-white/50 rounded-2xl p-5 border-2 cursor-pointer transition-all hover:shadow-lg ${
                      selectedAddons.includes(addon.id)
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-white hover:border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          {addon.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-[#0D1E46]">{addon.name}</h3>
                          <p className="text-sm text-[#0D1E46]/70">{addon.description}</p>
                        </div>
                      </div>
                      {addon.popular && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-lg font-bold text-[#0D1E46]">₹{addon.price.toLocaleString()}</div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAddons.includes(addon.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedAddons.includes(addon.id) && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Selected Add-ons Summary */}
              {selectedAddons.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Your Selected Add-ons</h3>
                  <div className="space-y-3">
                    {selectedAddons.map((addonId) => {
                      const addon = premiumAddons.find(a => a.id === addonId);
                      return addon ? (
                        <div key={addonId} className="flex justify-between">
                          <span>{addon.name}</span>
                          <span>₹{addon.price.toLocaleString()}</span>
                        </div>
                      ) : null;
                    })}
                    <div className="flex justify-between pt-3 border-t border-amber-400/30 font-bold">
                      <span>Total Add-ons Cost:</span>
                      <span>₹{calculateAddonsTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>New Total Trip Cost:</span>
                      <span>₹{(totalTripCost + calculateAddonsTotal()).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Add-ons Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/50 rounded-xl p-4 border border-white">
                  <h4 className="font-bold text-[#0D1E46] mb-2 flex items-center">
                    <FaStar className="text-yellow-500 mr-2" /> Why Add-ons?
                  </h4>
                  <ul className="text-[#0D1E46]/80 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Personalize your travel experience</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Save money with bundled services</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Enjoy exclusive perks and benefits</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Peace of mind with premium services</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white/50 rounded-xl p-4 border border-white">
                  <h4 className="font-bold text-[#0D1E46] mb-2 flex items-center">
                    <FaLock className="text-blue-500 mr-2" /> Quality Guarantee
                  </h4>
                  <ul className="text-[#0D1E46]/80 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>All add-ons are verified and trusted</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Full refund if service is not delivered</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>24/7 customer support for all services</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Easy cancellation and modification</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <button 
                  onClick={() => {
                    if (selectedAddons.length > 0) {
                      // Update total cost with add-ons
                      const newTotal = totalTripCost + calculateAddonsTotal();
                      // In a real app, you would update the trip data with the selected add-ons
                      alert(`Add-ons added! New total: ₹${newTotal.toLocaleString()}`);
                    } else {
                      alert('Please select at least one add-on');
                    }
                  }}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center"
                  disabled={selectedAddons.length === 0}
                >
                  <FaCrown className="mr-2" />
                  Add Selected Services (₹{calculateAddonsTotal().toLocaleString()})
                </button>
                <p className="text-center text-[#0D1E46]/60 text-sm mt-3">
                  Enhance your trip with premium services
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePageFinancingPanel;
              