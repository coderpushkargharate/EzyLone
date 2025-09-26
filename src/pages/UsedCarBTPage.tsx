import React from 'react';
import { Car, ArrowRight, Percent, Clock, Shield } from 'lucide-react';

const UsedCarBTPage: React.FC = () => {
  const features = ['Lower EMIs', 'Better interest rates', 'Hassle-free process'];
  
  return (
    <div className="pt-20 pb-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
              Used Car Balance Transfer
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Save more with our Used Car Balance Transfer, offering lower EMIs and better rates.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-center mb-8 sm:mb-12 lg:mb-16">
          <div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <Car className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Transfer & Save</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              Our Used Car Balance Transfer program allows you to transfer your existing car loan to us at a lower interest rate, reducing your monthly EMIs and overall interest burden. It's a smart financial move that can save you thousands over the remaining loan term.
            </p>
            
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
            
            <button className="group flex items-center space-x-2 text-white font-semibold bg-orange-500 hover:bg-orange-600 transition-colors py-2.5 sm:py-3 px-5 sm:px-6 rounded-full text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start">
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl mt-6 md:mt-0">
            <img 
              src="/car-bt.jpg" 
              alt="Used Car Balance Transfer" 
              className="w-full h-auto object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1000&auto=format&fit=crop';
              }}
            />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/30 shadow-xl mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">
            <span className="bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
              Benefits of Balance Transfer
            </span>
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <Percent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Lower Interest Rates</h3>
              <p className="text-sm sm:text-base text-gray-600">Get interest rates up to 2-3% lower than your current loan, significantly reducing your interest burden.</p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Reduced EMIs</h3>
              <p className="text-sm sm:text-base text-gray-600">Lower your monthly payments and free up cash flow for other financial priorities.</p>
            </div>

            <div className="text-center group sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Simple Process</h3>
              <p className="text-sm sm:text-base text-gray-600">Enjoy a hassle-free transfer process with minimal documentation and quick approval.</p>
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-green-100 shadow-xl mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
            <span className="bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
              See How Much You Can Save
            </span>
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-green-100">
                  <th className="p-3 sm:p-4 rounded-tl-lg sm:rounded-tl-xl text-sm sm:text-base">Loan Details</th>
                  <th className="p-3 sm:p-4 text-sm sm:text-base">Your Current Loan</th>
                  <th className="p-3 sm:p-4 rounded-tr-lg sm:rounded-tr-xl text-sm sm:text-base">With Balance Transfer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100">
                <tr className="bg-white">
                  <td className="p-3 sm:p-4 font-medium text-sm sm:text-base">Interest Rate</td>
                  <td className="p-3 sm:p-4 text-sm sm:text-base">11.5% p.a.</td>
                  <td className="p-3 sm:p-4 text-green-600 font-medium text-sm sm:text-base">8.99% p.a.</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-3 sm:p-4 font-medium text-sm sm:text-base">Monthly EMI (on ₹5 Lakh)</td>
                  <td className="p-3 sm:p-4 text-sm sm:text-base">₹11,032</td>
                  <td className="p-3 sm:p-4 text-green-600 font-medium text-sm sm:text-base">₹10,383</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-3 sm:p-4 font-medium text-sm sm:text-base">Total Interest Paid (5 years)</td>
                  <td className="p-3 sm:p-4 text-sm sm:text-base">₹1,61,920</td>
                  <td className="p-3 sm:p-4 text-green-600 font-medium text-sm sm:text-base">₹1,22,980</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-3 sm:p-4 font-medium rounded-bl-lg sm:rounded-bl-xl text-sm sm:text-base">Your Savings</td>
                  <td className="p-3 sm:p-4 text-sm sm:text-base">-</td>
                  <td className="p-3 sm:p-4 text-green-600 font-bold rounded-br-lg sm:rounded-br-xl text-sm sm:text-base">₹38,940</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-teal-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Transfer & Save?</h2>
          <p className="text-base sm:text-xl mb-4 sm:mb-6 max-w-2xl mx-auto px-4">Apply for a Used Car Balance Transfer today and start saving on your monthly EMIs.</p>
          <button className="bg-white text-green-600 font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-gray-100 transition-colors text-sm sm:text-base w-full sm:w-auto">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsedCarBTPage;