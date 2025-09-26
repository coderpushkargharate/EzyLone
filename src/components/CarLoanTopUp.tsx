import React from 'react';
import { ArrowRight, CheckCircle, Calculator, Clock, Shield, TrendingUp, CreditCard } from 'lucide-react';
import Hero from './HeroSection';

const CarLoanTopUp = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Banner Image Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 max-sm:pt-32">
        <Hero 
        page="car-top-up" 
        title="Car Top-Up Loan" 
        subtitle="Get additional funds against your existing car loan"
      />
      </div>

      {/* Content Section */}
      <div className="">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full border border-green-200 mb-6">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Car Loan Top-Up</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-800">
                Car Loan Top-Up
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                Unlock extra funds with our Car Loan Top-Up option! service, designed to meet your additional financial needs without the hassle of a new loan. EzyLoan offers quick approvals, competitive interest rates, and flexible repayment terms, allowing you to access more funds while keeping your existing car loan intact.
              </p>

              <div className="mb-12">
                <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-800">
                  Why EzyLoan's Car Loan Top-Up?
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Low-interest rates</h3>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick approval process</h3>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Flexible repayment options</h3>
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
                Apply today and get the additional funds you need with ease!
              </p>

              <button className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Apply for Top-Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Car Loan Top-Up Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Car Loan Top-Up</span>
            </h2>
          </div>

          {/* Ready to Experience Section */}
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">
              <span className="text-gray-800">Ready to Experience the Benefits of </span>
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Car Loan Refinance</span>
              <span className="text-gray-800">?</span>
            </h2>
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-4 rounded-full text-xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              Apply Now
            </button>
          </div>

          {/* Eligibility Section */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-green-100 max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left Side - Content */}
              <div>
                <h3 className="text-3xl font-bold mb-8">
                  <span className="text-gray-800">ELIGIBILITY</span>
                  <br />
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">for Car Loan Top Up</span>
                </h3>
                
                <div>
                  <h4 className="text-xl font-bold mb-4 text-blue-600">Salaried Individuals:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Minimum 20 and maximum 60 years of age.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Minimum employment of 2 years in the current company.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Minimum income of Rs 3,00,000 a year</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Valid Car Registration</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Right Side - Image */}
               <div className="flex justify-center lg:justify-end">
                 <div className="relative">
                   <div className="absolute -inset-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur opacity-20"></div>
                   <img 
                     src="/car_image.png" 
                     alt="Car Loan Eligibility" 
                     className="relative w-full h-96 object-cover rounded-2xl shadow-2xl"
                   />
                   <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg">
                     <CheckCircle className="w-6 h-6" />
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Instant Liquidity</h3>
              <p className="text-gray-600 leading-relaxed">
                Get immediate access to funds without the hassle of applying for a new loan from scratch.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Quick Approval</h3>
              <p className="text-gray-600 leading-relaxed">
                Faster processing since you're already our customer. Get approved in just 24 hours.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Same Interest Rate</h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy the same competitive interest rate as your existing car loan with no additional charges.
              </p>
            </div>
          </div>

          {/* TopUp Amount Calculator */}
          <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl p-8 lg:p-12 border border-green-100/50 shadow-xl mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                  How Much Can You Get?
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                TopUp amount depends on your loan repayment history and current vehicle value
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">TopUp Calculation Factors</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800">Current Vehicle Value:</span>
                      <p className="text-gray-600 text-sm">Based on current market price of your vehicle</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800">Outstanding Loan Amount:</span>
                      <p className="text-gray-600 text-sm">Remaining principal amount on your existing loan</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800">Repayment History:</span>
                      <p className="text-gray-600 text-sm">Your track record of timely EMI payments</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800">Income Stability:</span>
                      <p className="text-gray-600 text-sm">Current income and employment stability</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/30">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Typical TopUp Amounts</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                    <span className="font-medium text-gray-700">Excellent Credit</span>
                    <span className="font-bold text-green-600">Up to ₹10 Lakhs</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                    <span className="font-medium text-gray-700">Good Credit</span>
                    <span className="font-bold text-blue-600">Up to ₹7 Lakhs</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-xl">
                    <span className="font-medium text-gray-700">Average Credit</span>
                    <span className="font-bold text-yellow-600">Up to ₹5 Lakhs</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  *Actual amount subject to eligibility and vehicle valuation
                </p>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                  Perfect For Your Needs
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Use your car loan top-up for various financial requirements
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-lg text-center hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">🏠</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Home Renovation</h3>
                <p className="text-gray-600 text-sm">Upgrade your home with the extra funds</p>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-lg text-center hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">🎓</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Education</h3>
                <p className="text-gray-600 text-sm">Fund your or your child's education</p>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-lg text-center hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">💼</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Business</h3>
                <p className="text-gray-600 text-sm">Invest in your business growth</p>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-lg text-center hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">🚨</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Emergency</h3>
                <p className="text-gray-600 text-sm">Handle unexpected financial needs</p>
              </div>
            </div>
          </div>

          {/* Eligibility */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/30 shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Eligibility Criteria</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Existing car loan customer with EzyLoan</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Minimum 12 months of loan repayment history</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">No EMI defaults in the last 12 months</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Current income should support additional EMI</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Vehicle should have sufficient market value</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/30 shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Required Documents</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Latest salary slips (3 months)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Bank statements (6 months)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Current loan statement</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Vehicle valuation report</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Updated KYC documents</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl p-8 lg:p-12 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Need Extra Funds? We've Got You Covered!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Get instant access to additional funds with our car loan top-up facility
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Apply for TopUp
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-green-600 transition-all duration-300">
                Check Eligibility
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarLoanTopUp;