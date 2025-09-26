import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRight, Info, TrendingUp, PieChart, DollarSign, Clock, Zap } from 'lucide-react';

const EMICalculatorPage: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(10);
  const [loanTenure, setLoanTenure] = useState<number>(36); // in months
  const [emi, setEmi] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Calculate EMI, total interest, and total amount
  useEffect(() => {
    const calculateEMI = () => {
      const principal = loanAmount;
      const ratePerMonth = interestRate / 12 / 100;
      const time = loanTenure;

      // EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
      const emiValue = principal * ratePerMonth * Math.pow(1 + ratePerMonth, time) / (Math.pow(1 + ratePerMonth, time) - 1);
      
      setEmi(emiValue);
      setTotalAmount(emiValue * time);
      setTotalInterest(emiValue * time - principal);
    };

    calculateEMI();
  }, [loanAmount, interestRate, loanTenure]);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate percentage for pie chart
  const principalPercentage = (loanAmount / totalAmount) * 100;
  const interestPercentage = (totalInterest / totalAmount) * 100;

  return (
    <div className="pt-32 pb-16 bg-gradient-to-br from-blue-50 via-white to-orange-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl md:rounded-2xl mb-4 md:mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <Calculator className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight px-4">
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent animate-pulse">
              EMI Calculator
            </span>
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6 md:mb-8 px-4">
            Plan your loan repayments with our <span className="font-semibold text-orange-600">smart & interactive</span> EMI calculator.
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500 px-4">
            <div className="flex items-center space-x-1 md:space-x-2 bg-white/80 backdrop-blur-sm px-2 md:px-4 py-1 md:py-2 rounded-full shadow-lg">
              <Zap className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
              <span>Instant Calculation</span>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2 bg-white/80 backdrop-blur-sm px-2 md:px-4 py-1 md:py-2 rounded-full shadow-lg">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
              <span>Real-time Updates</span>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2 bg-white/80 backdrop-blur-sm px-2 md:px-4 py-1 md:py-2 rounded-full shadow-lg">
              <PieChart className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
              <span>Visual Breakdown</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-4 md:gap-8 mb-16">
          {/* Calculator Inputs */}
          <div className="md:col-span-5 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                Loan Details
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Real-time</span>
              </div>
            </div>

            <div className="space-y-8">
              {/* Loan Amount */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="text-sm font-bold text-orange-500 mr-2">₹</span>
                  Loan Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 text-lg font-semibold bg-gray-50/50 hover:bg-white group-hover:border-orange-300"
                    placeholder="Enter loan amount"
                  />
                </div>
                <div className="relative mt-4">
                  <input
                    type="range"
                    min="50000"
                    max="10000000"
                    step="10000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full appearance-none cursor-pointer slider hover:from-orange-200 hover:to-amber-200 transition-all duration-300"
                    style={{
                      background: `linear-gradient(to right, #f97316 0%, #f59e0b ${((loanAmount - 50000) / (10000000 - 50000)) * 100}%, #e5e7eb ${((loanAmount - 50000) / (10000000 - 50000)) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-600 mt-2">
                  <span className="bg-orange-100 px-2 py-1 rounded-lg">₹50K</span>
                  <span className="text-orange-600 font-bold">{formatCurrency(loanAmount)}</span>
                  <span className="bg-orange-100 px-2 py-1 rounded-lg">₹1Cr</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                  Interest Rate (% per annum)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    step="0.1"
                    min="5"
                    max="25"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg font-semibold bg-gray-50/50 hover:bg-white group-hover:border-blue-300"
                    placeholder="Enter interest rate"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
                </div>
                <div className="relative mt-4">
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full appearance-none cursor-pointer slider hover:from-blue-200 hover:to-cyan-200 transition-all duration-300"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #06b6d4 ${((interestRate - 5) / (25 - 5)) * 100}%, #e5e7eb ${((interestRate - 5) / (25 - 5)) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-600 mt-2">
                  <span className="bg-blue-100 px-2 py-1 rounded-lg">5%</span>
                  <span className="text-blue-600 font-bold">{interestRate}%</span>
                  <span className="bg-blue-100 px-2 py-1 rounded-lg">25%</span>
                </div>
              </div>

              {/* Loan Tenure */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-green-500" />
                  Loan Tenure (in months)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                    min="1"
                    max="360"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg font-semibold bg-gray-50/50 hover:bg-white group-hover:border-green-300"
                    placeholder="Enter tenure in months"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">months</span>
                </div>
                <div className="relative mt-4">
                  <input
                    type="range"
                    min="1"
                    max="360"
                    step="1"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full appearance-none cursor-pointer slider hover:from-green-200 hover:to-emerald-200 transition-all duration-300"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #059669 ${((loanTenure - 1) / (360 - 1)) * 100}%, #e5e7eb ${((loanTenure - 1) / (360 - 1)) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-600 mt-2">
                  <span className="bg-green-100 px-2 py-1 rounded-lg">1 month</span>
                  <span className="text-green-600 font-bold">{loanTenure} months</span>
                  <span className="bg-green-100 px-2 py-1 rounded-lg">360 months</span>
                </div>
              </div>

              <div className="pt-4">
                <button className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 transition-all duration-500 flex items-center justify-center group shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Zap className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  Apply for This Loan
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="md:col-span-7 grid grid-cols-1 gap-4 md:gap-6">
            {/* EMI Result */}
            <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-2xl md:rounded-3xl p-4 md:p-8 text-white shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-2 right-2 md:top-4 md:right-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg md:text-2xl font-bold text-white">₹</span>
                </div>
              </div>
              <h3 className="text-lg md:text-2xl font-semibold mb-2 md:mb-3 flex items-center">
                <Zap className="w-4 h-4 md:w-6 md:h-6 mr-2" />
                Your Monthly EMI
              </h3>
              <div className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 animate-pulse">{formatCurrency(emi)}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 text-white/95">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4">
                  <p className="text-xs md:text-sm font-medium opacity-90">Total Principal</p>
                  <p className="text-lg md:text-xl font-bold">{formatCurrency(loanAmount)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4">
                  <p className="text-xs md:text-sm font-medium opacity-90">Total Interest</p>
                  <p className="text-lg md:text-xl font-bold">{formatCurrency(totalInterest)}</p>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
              <h3 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 md:mb-6 flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg md:rounded-xl flex items-center justify-center mr-2 md:mr-3 shadow-lg">
                  <PieChart className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                Payment Breakdown
              </h3>
              
              <div className="mb-4 md:mb-8">
                {/* Enhanced Visual representation */}
                <div className="relative">
                  <div className="w-full h-6 md:h-8 rounded-xl md:rounded-2xl overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl md:rounded-2xl transition-all duration-1000 ease-out shadow-lg" 
                      style={{ width: `${principalPercentage}%` }}
                    ></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs md:text-sm font-bold text-white drop-shadow-lg">
                      {principalPercentage.toFixed(1)}% Principal | {interestPercentage.toFixed(1)}% Interest
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-orange-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-2 md:mb-3">
                    <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 mr-2 md:mr-3 shadow-lg"></div>
                    <p className="text-xs md:text-sm font-semibold text-gray-700">Principal Amount</p>
                  </div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 mb-1">{formatCurrency(loanAmount)}</p>
                  <p className="text-xs md:text-sm text-orange-600 font-medium">{principalPercentage.toFixed(1)}% of total</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-2 md:mb-3">
                    <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mr-2 md:mr-3 shadow-lg"></div>
                    <p className="text-xs md:text-sm font-semibold text-gray-700">Interest Amount</p>
                  </div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 mb-1">{formatCurrency(totalInterest)}</p>
                  <p className="text-xs md:text-sm text-blue-600 font-medium">{interestPercentage.toFixed(1)}% of total</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl md:rounded-2xl p-4 md:p-6 border-2 border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600 mr-2 md:mr-3" />
                    <p className="text-base md:text-lg font-bold text-gray-800">Total Amount Payable</p>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-2xl md:rounded-3xl p-4 md:p-8 border border-blue-200 shadow-xl">
              <div className="flex items-start">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl md:rounded-2xl flex items-center justify-center mr-3 md:mr-4 mt-1 shadow-lg">
                  <Info className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3 md:mb-4">How is EMI calculated?</h3>
                  <p className="text-gray-700 mb-3 md:mb-4 text-base md:text-lg leading-relaxed">
                    EMI stands for Equated Monthly Installment. It's the amount you pay every month until your loan is fully paid off. The EMI includes both principal and interest components.
                  </p>
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    The formula used to calculate EMI is: <span className="font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)</span> where P is the principal, r is the monthly interest rate, and n is the number of installments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Comparison */}
        <div className="mt-20 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30 rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-10 border border-white/20 backdrop-blur-sm mb-16">
          <div className="flex items-center justify-center mb-6 md:mb-10">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl md:rounded-2xl flex items-center justify-center mr-3 md:mr-4 shadow-2xl">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-orange-600 to-amber-600 bg-clip-text text-transparent">Loan Comparison</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm md:text-base">
              <thead>
                <tr className="bg-orange-50">
                  <th className="p-2 md:p-4 rounded-tl-xl">Loan Type</th>
                  <th className="p-2 md:p-4">Interest Rate Range</th>
                  <th className="p-2 md:p-4">Max Tenure</th>
                  <th className="p-2 md:p-4">Processing Fee</th>
                  <th className="p-2 md:p-4 rounded-tr-xl">Pre-payment Penalty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="p-2 md:p-4 font-medium">New Car Loan</td>
                  <td className="p-2 md:p-4">7.25% - 11.50%</td>
                  <td className="p-2 md:p-4">7 years</td>
                  <td className="p-2 md:p-4">Up to 1%</td>
                  <td className="p-2 md:p-4">Nil to 2%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-2 md:p-4 font-medium">Used Car Loan</td>
                  <td className="p-2 md:p-4">9.50% - 15.00%</td>
                  <td className="p-2 md:p-4">5 years</td>
                  <td className="p-2 md:p-4">Up to 2%</td>
                  <td className="p-2 md:p-4">Up to 3%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-2 md:p-4 font-medium">Personal Loan</td>
                  <td className="p-2 md:p-4">10.99% - 18.00%</td>
                  <td className="p-2 md:p-4">5 years</td>
                  <td className="p-2 md:p-4">Up to 2.5%</td>
                  <td className="p-2 md:p-4">Up to 4%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-2 md:p-4 font-medium">Property Loan</td>
                  <td className="p-2 md:p-4">8.50% - 12.00%</td>
                  <td className="p-2 md:p-4">20 years</td>
                  <td className="p-2 md:p-4">Up to 1%</td>
                  <td className="p-2 md:p-4">Nil to 2%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-2 md:p-4 font-medium rounded-bl-xl">Commercial Vehicle</td>
                  <td className="p-2 md:p-4">9.50% - 14.00%</td>
                  <td className="p-2 md:p-4">7 years</td>
                  <td className="p-2 md:p-4">Up to 2%</td>
                  <td className="p-2 md:p-4 rounded-br-xl">Up to 3%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-10 border border-white/20 backdrop-blur-sm">
          <div className="flex items-center justify-center mb-6 md:mb-10">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center mr-3 md:mr-4 shadow-2xl">
              <Info className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-purple-600 to-pink-600 bg-clip-text text-transparent">Frequently Asked Questions</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 md:gap-8 max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="flex items-center mb-3 md:mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg md:rounded-xl flex items-center justify-center mr-2 md:mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-sm md:text-lg font-bold text-white">₹</span>
                </div>
                <h3 className="text-base md:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">What factors affect my EMI?</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm md:text-lg">Your EMI is affected by three main factors: the loan amount, interest rate, and loan tenure. A higher loan amount or interest rate increases your EMI, while a longer tenure reduces it but increases the total interest paid.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="flex items-center mb-3 md:mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg md:rounded-xl flex items-center justify-center mr-2 md:mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <h3 className="text-base md:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Can I pay more than my EMI amount?</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm md:text-lg">Yes, you can make partial prepayments on your loan. However, some loans may have prepayment penalties or restrictions on when you can make additional payments. Check your loan agreement for details.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="flex items-center mb-3 md:mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg md:rounded-xl flex items-center justify-center mr-2 md:mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <h3 className="text-base md:text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">How accurate is this EMI calculator?</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm md:text-lg">This calculator provides a close approximation of your EMI based on the information you provide. The actual EMI may vary slightly depending on the exact terms of your loan, including the method of interest calculation used by your lender.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="flex items-center mb-3 md:mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg md:rounded-xl flex items-center justify-center mr-2 md:mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <h3 className="text-base md:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Should I choose a longer or shorter loan tenure?</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm md:text-lg">A longer tenure reduces your monthly EMI but increases the total interest paid over the loan period. A shorter tenure means higher monthly payments but less total interest. Choose based on your monthly budget and long-term financial goals.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMICalculatorPage;