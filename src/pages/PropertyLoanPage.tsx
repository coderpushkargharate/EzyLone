import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowRight, Percent, Clock, Shield, DollarSign, FileText, User, TrendingUp, CheckCircle, Building, Zap, Award } from 'lucide-react';
import Hero from '../components/HeroSection';


const PropertyLoanPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Banner Image Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 max-sm:pt-32">

{/* Hero Image Section */}
        <div className="relative mb-16 max-w-8xl mx-auto overflow-hidden rounded-2xl shadow-xl">
        <Hero
        page="property-loan" 
        title="Property Loan" 
        subtitle="Unlock the value of your property for your financial needs"
      />
        </div>

        

        {/* Introduction Section */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                Transform Your Property Dreams into Reality
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
              At EzyLoan, we offer hassle-free property loans tailored to meet your financial needs. Whether you want to buy, renovate, or expand your property, we've got you covered. Leverage your property's value to get funds for personal or business expenses.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-blue-100">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Why Choose EzyLoan?</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                  At EzyLoan, we offer easy and flexible property loans to meet your financial needs. Get funds for buying, renovating, or expanding your property effortlessly. Leverage your property's value for personal or business expenses.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">Low-interest rates and flexible repayment options</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">Quick approvals with minimal documentation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">Reliable and hassle-free property financing</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-2">Quick Process</h4>
                <p className="text-xs sm:text-sm text-gray-600">Fast approvals and seamless disbursement</p>
              </div>
              
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                  <Percent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-2">Best Rates</h4>
                <p className="text-xs sm:text-sm text-gray-600">Competitive interest rates starting from 8.5%</p>
              </div>
              
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-2">Secure</h4>
                <p className="text-xs sm:text-sm text-gray-600">Safe and transparent loan process</p>
              </div>
              
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-2">Trusted</h4>
                <p className="text-xs sm:text-sm text-gray-600">Thousands of satisfied customers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose EzyLoan Property Loan Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-indigo-100 shadow-xl mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-10 lg:mb-12">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
              Why Choose EzyLoan Property Loan?
            </span>
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">High Loan Amount</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Avail loans up to 75% of your property's market value, whether it's residential, commercial, or industrial.
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Percent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Competitive Interest Rates</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Enjoy attractive interest rates starting as low as 8.5% p.a., ensuring affordable EMIs.
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Flexible Repayment Tenure</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Choose repayment terms ranging from 5 to 20 years based on your convenience.
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Building className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Loan for Multiple Purposes</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Use the loan amount for business expansion, education, weddings, medical emergencies, or debt consolidation.
              </p>
            </div>
          </div>
        </div>

        {/* Loan Details Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-blue-100 shadow-xl mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-10 lg:mb-12">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Property Loan Details & Features
            </span>
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">Loan Amount</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Minimum</span>
                  <span className="text-sm sm:text-base font-medium text-green-600">₹5,00,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Maximum</span>
                  <span className="text-sm sm:text-base font-medium text-green-600">₹5 Crore+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">LTV Ratio</span>
                  <span className="text-sm sm:text-base font-medium">Up to 75%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Percent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">Interest Rate</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Starting from</span>
                  <span className="text-sm sm:text-base font-medium text-blue-600">8.5% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Up to</span>
                  <span className="text-sm sm:text-base font-medium text-blue-600">12.0% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Type</span>
                  <span className="text-sm sm:text-base font-medium">Reducing Rate</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">Tenure & Fees</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Tenure</span>
                  <span className="text-sm sm:text-base font-medium text-purple-600">5 - 20 years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Processing Fee</span>
                  <span className="text-sm sm:text-base font-medium text-purple-600">Up to 1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Prepayment</span>
                  <span className="text-sm sm:text-base font-medium">Allowed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
              Eligibility Criteria
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">Age Criteria</h3>
              <p className="text-gray-600 text-lg font-medium">21 - 65 years</p>
              <p className="text-sm text-gray-500 mt-2">At the time of loan maturity</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">Monthly Income</h3>
              <p className="text-gray-600 text-lg font-medium">₹50,000+</p>
              <p className="text-sm text-gray-500 mt-2">Net monthly income</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">Property Ownership</h3>
              <p className="text-gray-600 text-lg font-medium">Clear Title</p>
              <p className="text-sm text-gray-500 mt-2">Property documents required</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">Credit Score</h3>
              <p className="text-gray-600 text-lg font-medium">700+</p>
              <p className="text-sm text-gray-500 mt-2">Higher scores get better rates</p>
            </div>
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 lg:p-12 text-center text-white shadow-2xl mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Ready to Unlock Your Property's Potential?
            </h2>
            <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
              Join thousands of satisfied customers who chose EzyLoan for their property financing needs. 
              Get instant approval with competitive rates and flexible terms!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="flex items-center text-lg">
                <CheckCircle className="w-6 h-6 mr-2 text-green-300" />
                <span>Quick Approval</span>
              </div>
              <div className="flex items-center text-lg">
                <CheckCircle className="w-6 h-6 mr-2 text-green-300" />
                <span>Minimal Documentation</span>
              </div>
              <div className="flex items-center text-lg">
                <CheckCircle className="w-6 h-6 mr-2 text-green-300" />
                <span>Best Interest Rates</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/apply-now" className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Apply Now - Get Instant Approval
              </Link>
              <Link to="/contact" className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-300">
                Contact Us
              </Link>
            </div>
            
            <p className="text-sm opacity-75 mt-6">
              *Subject to credit approval and property valuation. Terms and conditions apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyLoanPage;