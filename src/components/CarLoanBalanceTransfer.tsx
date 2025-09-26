import React from 'react';
import { ArrowRight, CheckCircle, Calculator, Clock, Shield, RefreshCw, Percent, FileText, User, CreditCard, Car, MapPin, DollarSign, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const CarLoanBalanceTransfer = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Content starts here */}
      <div className="pt-28 max-sm:pt-20">
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-800">
            Looking to lower your monthly car loan payments?
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Our Car Loan Balance Transfer service offers you the perfect opportunity to switch your existing loan to a lower interest rate, helping you save money. With a hassle-free process and quick approval, you can enjoy reduced EMIs and better financial flexibility.
          </p>
        </div>

        {/* Why Choose EzyLoan Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 lg:p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
              Why choose EzyLoan for a Car Loan Balance Transfer?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Low-interest rates</h3>
              <p className="text-gray-600 leading-relaxed">
                Get significantly reduced interest rates compared to your current lender and save thousands on your monthly EMIs.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Quick approval process</h3>
              <p className="text-gray-600 leading-relaxed">
                Experience fast processing with minimal documentation and get approval within 24-48 hours.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Flexible repayment options</h3>
              <p className="text-gray-600 leading-relaxed">
                Choose from various repayment tenures and enjoy the flexibility to prepay without penalties.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Choose EzyLoan for your Car Loan Balance Transfer to benefit from competitive interest rates, quick processing, and a transparent transfer process. We prioritize your convenience, offering flexible repayment options and personalized support to ensure a seamless transition. With EzyLoan, you can reduce your financial burden and enjoy lower EMIs with ease.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
              Discover the Benefits of Car Loan Balance Transfer
            </h2>
            <p className="text-xl text-gray-600">
              Why take Car Loan Balance Transfer from us?
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Swift Online Process</h3>
                  <p className="text-gray-600">
                    No need to physically stand in line or wait for a call from the required lender. Directly apply online and get balance loan approval instantly.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Lower Interest Rate</h3>
                  <p className="text-gray-600">
                    Get a new loan balance transfer with a lower interest rate. Our industry expert lenders will offer you competitive rates for your current financial requirement.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Fast and Efficient</h3>
                  <p className="text-gray-600">
                    Our streamlined online process gets your balance transfer for car loan approved quickly, so you can start saving from the word go.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Clear and Transparent</h3>
                  <p className="text-gray-600">
                    We are clear with our terms and conditions upfront. Therefore, you will be guided properly by our experts and will know what you are getting into.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 lg:p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
              Documents you require for Balance Loan Transfer?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Complete application</h3>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Recent Passport Size Photograph</h3>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Identity Proof</h3>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Valid Car Registration Copy</h3>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Address Proof</h3>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Income Proof</h3>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Loan Track Statement</h3>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-gray-700 mb-6">
              Ready to escape a high-interest rate? Upgrade now to a more relaxing loan. Contact Ezyloan to resolve all your financial needs.
            </p>
            <Link to="/apply-now" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Apply Now
            </Link>
            <Link to="/contact" className="inline-block ml-4 bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Contact Us
            </Link>
          </div>
        </div>

        {/* Eligibility Section */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-800">
                ELIGIBILITY
              </h2>
              <h3 className="text-2xl font-semibold mb-6 text-blue-600">
                for Car Loan Balance Transfer
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-semibold mb-3 text-gray-800">Salaried Individuals:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-600">Minimum 20 and maximum 60 years of age.</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-600">Minimum employment of 2 years in the current company.</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-600">Minimum income of Rs 3,00,000 a year</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-600">Valid Car Registration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Car Loan Eligibility" 
                className="relative w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Make the Smart Switch?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands who have saved money by transferring their car loan to EzyLoan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/apply-now" className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
              <span>Apply Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center space-x-2">
              <Calculator className="w-5 h-5" />
              <span>Calculate Savings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarLoanBalanceTransfer;