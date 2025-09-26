import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ArrowRight, Percent, Clock, Shield, DollarSign, FileText, User, TrendingUp, CheckCircle, Building, Zap, Award, Bus, Car } from 'lucide-react';
import Hero from '../components/HeroSection';


const CommercialVehicleLoanPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Banner Image Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 max-sm:pt-32">

{/* Hero Image Section */}
        <div className="relative mb-16 max-w-8xl mx-auto overflow-hidden rounded-2xl shadow-xl">
        <Hero 
        page="commercial-vehicle-loan" 
        title="Commercial Vehicle Loan" 
        subtitle="Expand your business with our commercial vehicle financing solutions"
      />
        </div>
        
        

        {/* Introduction Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-lg sm:shadow-xl border border-blue-100 mb-8 sm:mb-12 lg:mb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                Accelerate Your Business Growth
              </span>
            </h2>
            
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6 sm:mb-8 text-center max-w-4xl mx-auto px-4">
              At EzyLoan, we provide comprehensive commercial vehicle financing solutions to help your business thrive. Whether you need trucks, buses, or specialized commercial vehicles, we offer competitive rates and flexible terms tailored to your business needs.
            </p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-10 lg:mt-12">
              <div className="text-center p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">Fast Processing</h3>
                <p className="text-xs sm:text-sm text-gray-600">Quick loan approval and disbursement</p>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Percent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">Best Rates</h3>
                <p className="text-xs sm:text-sm text-gray-600">Competitive interest rates from 9.5%</p>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">Secure</h3>
                <p className="text-xs sm:text-sm text-gray-600">Safe and transparent process</p>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">Trusted</h3>
                <p className="text-xs sm:text-sm text-gray-600">Thousands of satisfied customers</p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl border border-gray-100 mb-8 sm:mb-12 lg:mb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
                Tailored Financing Solutions for Your Business
              </span>
            </h2>
            
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8 sm:mb-10 lg:mb-12 text-center max-w-4xl mx-auto px-4">
              At EzyLoan, we understand that having the right commercial vehicle is crucial for your business operations. That's why we provide tailored financing solutions designed to meet the unique needs of businesses, big or small. With our Commercial Vehicle Loan, you can choose from a variety of vehicles, enjoy flexible repayment plans, and benefit from low-interest rates.
            </p>
            
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Why Choose Commercial Vehicle Loan?</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6">
                  At EzyLoan, we offer affordable and flexible commercial vehicle loans to help you grow your business with ease. Whether you're purchasing a new truck, bus, van, or fleet of vehicles, our loans are designed to meet your financial needs efficiently.
                </p>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6 sm:mb-8">
                  Get the financial support you need to expand your fleet, boost your business, and increase profitability with EzyLoan's Commercial Vehicle Loan. Apply now and drive your business toward success!
                </p>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700 font-medium">Quick approval process</span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700 font-medium">Competitive interest rates</span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700 font-medium">Flexible repayment options</span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700 font-medium">Minimal documentation required</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 order-first lg:order-last">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Loan for All Types of Commercial Vehicles</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6">
                  Whether you need a truck, bus, van, pickup, or heavy-duty vehicle, our loans cover a wide range of commercial vehicles to support your business expansion.
                </p>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm">
                    <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Trucks</span>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm">
                    <Bus className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Buses</span>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm">
                    <Car className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Vans</span>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm">
                    <Building className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mx-auto mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Heavy Duty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Loan Details Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 lg:p-12 shadow-xl border border-indigo-100 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
              Commercial Vehicle Loan Details & Features
            </span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Loan Amount</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Minimum</span>
                  <span className="font-bold text-green-600">₹3,00,000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Maximum</span>
                  <span className="font-bold text-green-600">₹3 Crores</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">LTV Ratio</span>
                  <span className="font-bold text-green-600">Up to 90%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Percent className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Interest Rate</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Starting From</span>
                  <span className="font-bold text-blue-600">8.75% p.a.</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Rate Type</span>
                  <span className="font-bold text-blue-600">Fixed/Floating</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Rate Range</span>
                  <span className="font-bold text-blue-600">8.75% - 15%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Tenure & Fees</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Tenure</span>
                  <span className="font-bold text-purple-600">1 - 8 years</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Processing Fee</span>
                  <span className="font-bold text-purple-600">Up to 2.5%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Prepayment</span>
                  <span className="font-bold text-purple-600">Allowed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl border border-gray-100 mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-10 lg:mb-12">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
              Eligibility Criteria
            </span>
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Building className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg">Business Age</h3>
              <p className="text-gray-600 text-base sm:text-lg font-medium">2+ years</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">In business operation</p>
            </div>
            
            <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg">Annual Turnover</h3>
              <p className="text-gray-600 text-base sm:text-lg font-medium">₹50 Lakhs+</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Minimum annual turnover</p>
            </div>
            
            <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg">Business Type</h3>
              <p className="text-gray-600 text-base sm:text-lg font-medium">All Types</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Proprietorship, Partnership, LLP, Pvt Ltd</p>
            </div>
            
            <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl sm:rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg">Credit Score</h3>
              <p className="text-gray-600 text-base sm:text-lg font-medium">650+</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Good credit history required</p>
            </div>
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center text-white shadow-2xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Expand Your Fleet?
          </h2>
          <p className="text-base sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-indigo-100 max-w-3xl mx-auto px-4">
            Get the financial support you need to expand your fleet, boost your business, and increase profitability with EzyLoan's Commercial Vehicle Loan.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8">
            <div className="flex items-center space-x-2 text-indigo-100">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Quick Approval Process</span>
            </div>
            <div className="flex items-center space-x-2 text-indigo-100">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Competitive Interest Rates</span>
            </div>
            <div className="flex items-center space-x-2 text-indigo-100">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Flexible Repayment Options</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/apply-now" className="bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto">
              Apply Now - Get Instant Approval
            </Link>
            <Link to="/contact" className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:bg-white hover:text-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercialVehicleLoanPage;