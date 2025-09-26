import React from 'react';
import { Car, ArrowRight, Percent, Clock, Shield } from 'lucide-react';

const UsedCarRefinancePage: React.FC = () => {
  const features = ['Lower interest rates', 'Flexible tenure', 'Quick approval'];
  
  return (
    <div className="pt-12 sm:pt-16 lg:pt-20 max-sm:pt-32 pb-8 sm:pb-12 lg:pb-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Used Car Refinance
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Refinance your used car loan with us and enjoy better rates and flexible terms.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-center mb-8 sm:mb-12 lg:mb-16">
          <div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <Car className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Get More Value From Your Car</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              Our Used Car Refinance loan offers you the opportunity to leverage your car's value while enjoying lower interest rates and more flexible repayment terms. Whether you're looking to reduce your monthly payments or access additional funds, our refinance option is designed to meet your needs.
            </p>
            
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
            
            <button className="group flex items-center space-x-2 text-white font-semibold bg-orange-500 hover:bg-orange-600 transition-colors py-2.5 sm:py-3 px-5 sm:px-6 rounded-full text-sm sm:text-base w-full sm:w-auto justify-center">
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl max-sm:h-[129px]">
            <img 
              src="/car-refinance.jpg" 
              alt="Used Car Refinance" 
              className="w-full h-auto max-sm:h-[129px] object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1000&auto=format&fit=crop';
              }}
            />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/30 shadow-xl mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 lg:mb-10">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Benefits of Refinancing
            </span>
          </h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <Percent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Lower Interest Rates</h3>
              <p className="text-sm sm:text-base text-gray-600">Enjoy reduced interest rates compared to your current loan, potentially saving thousands over the loan term.</p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Flexible Repayment</h3>
              <p className="text-sm sm:text-base text-gray-600">Choose from various tenure options that fit your financial situation and goals.</p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Quick Processing</h3>
              <p className="text-sm sm:text-base text-gray-600">Get approved in as little as 24 hours with minimal documentation requirements.</p>
            </div>
          </div>
        </div>

        {/* Refinance Details Section */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 lg:mb-10">
            <span className="bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
              Refinance Details
            </span>
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <Percent className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
                  Loan Amount
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">Up to 90% of your car's current market value</p>
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-blue-800 font-semibold text-sm sm:text-base">₹2 Lakh - ₹50 Lakh</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <Percent className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2" />
                  Interest Rate
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">Competitive rates starting from</p>
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-green-800 font-semibold text-sm sm:text-base">8.5% per annum onwards</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-2" />
                  Loan Tenure
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">Flexible repayment options</p>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-purple-800 font-semibold text-sm sm:text-base">1 - 7 Years</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mr-2" />
                  Processing Fee
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">Minimal processing charges</p>
                <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-orange-800 font-semibold text-sm sm:text-base">Starting from ₹2,999</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              Ready to Refinance Your Used Car?
            </h2>
            <p className="text-base sm:text-xl mb-6 sm:mb-8 text-blue-100 px-4">
              Join thousands of satisfied customers who have saved money with our refinancing solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto">
                Apply for Refinance
              </button>
              <button className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto">
                Calculate Savings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsedCarRefinancePage;