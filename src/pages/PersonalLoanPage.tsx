import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ArrowRight, Clock, Shield, Zap, CheckCircle, DollarSign, FileText, User, CreditCard, TrendingUp, Award, Star } from 'lucide-react';
import Hero from '../components/HeroSection';


const PersonalLoanPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Banner Image Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 max-sm:pt-32">

  {/* Hero Image Section */}
        <div className="relative mb-16 max-w-8xl mx-auto overflow-hidden rounded-2xl shadow-xl">
        <Hero
        page="personal-loan"
        title="Personal Loan"
        subtitle="Fulfill your personal financial needs with our hassle-free personal loans"
      />
        </div>

     
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction Section */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                Fulfill Your Dreams with Personal Loans
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
              At EzyLoan, we understand that life is full of opportunities and unexpected expenses. Whether you're planning a wedding, going on a vacation, handling medical emergencies, or consolidating debt, our Personal Loan is designed to provide you with the financial flexibility you need.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 lg:p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
              Why Choose Personal Loan?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Instant Loan Approval</h3>
              <p className="text-gray-600 leading-relaxed">
                Get quick approval with minimal documentation, ensuring you receive the funds you need without unnecessary delays.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Flexible Loan Amounts</h3>
              <p className="text-gray-600 leading-relaxed">
                Choose a loan amount that fits your needs – from ₹50,000 to ₹50 lakhs, giving you the financial freedom to achieve your goals.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Attractive Interest Rates</h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy competitive interest rates starting as low as 10.5% p.a., making your EMIs affordable and easy to manage.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Content Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-800">
              Tailored Financing Solutions for Every Need
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              At EzyLoan, we understand that having the right financial support is crucial for achieving your personal goals. That's why we provide tailored financing solutions designed to meet the unique needs of individuals, whether you're planning a major purchase, consolidating debt, or handling unexpected expenses.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              With our Personal Loan, you can access funds quickly, enjoy flexible repayment plans, and benefit from competitive interest rates that make your financial journey smoother and more manageable.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Quick Processing</h3>
                <p className="text-sm text-gray-600">24-48 hours approval</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Secure Process</h3>
                <p className="text-sm text-gray-600">100% safe & secure</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="/personal-side.png" 
              alt="Personal Loan Benefits" 
              className="w-full h-auto object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1000&auto=format&fit=crop';
              }}
            />
          </div>
        </div>

        {/* Loan Details Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 lg:p-12 border border-blue-100 shadow-xl mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Loan Details & Features
            </span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Loan Amount</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum</span>
                  <span className="font-medium text-green-600">₹50,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maximum</span>
                  <span className="font-medium text-green-600">₹50,00,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Based on</span>
                  <span className="font-medium">Income & Profile</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Interest Rate</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Starting from</span>
                  <span className="font-medium text-blue-600">10.5% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Up to</span>
                  <span className="font-medium text-blue-600">18.0% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">Reducing Rate</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Tenure & Fees</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tenure</span>
                  <span className="font-medium text-purple-600">1 - 5 years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-medium text-purple-600">Up to 2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prepayment</span>
                  <span className="font-medium">Allowed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
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
              <p className="text-gray-600 text-lg font-medium">₹25,000+</p>
              <p className="text-sm text-gray-500 mt-2">Net monthly income</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">Employment</h3>
              <p className="text-gray-600 text-lg font-medium">Salaried/Self-employed</p>
              <p className="text-sm text-gray-500 mt-2">Stable employment history</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">Credit Score</h3>
              <p className="text-gray-600 text-lg font-medium">650+</p>
              <p className="text-sm text-gray-500 mt-2">Higher scores get better rates</p>
            </div>
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-center text-white shadow-2xl mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Dreams into Reality?
            </h2>
            <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
              Join thousands of satisfied customers who chose EzyLoan for their personal financing needs. 
              Get instant approval with competitive rates and flexible terms!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="flex items-center text-lg">
                <CheckCircle className="w-6 h-6 mr-2 text-green-300" />
                <span>Instant Approval</span>
              </div>
              <div className="flex items-center text-lg">
                <CheckCircle className="w-6 h-6 mr-2 text-green-300" />
                <span>Minimal Documentation</span>
              </div>
              <div className="flex items-center text-lg">
                <CheckCircle className="w-6 h-6 mr-2 text-green-300" />
                <span>Competitive Rates</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/apply-now" className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Apply Now - Get Instant Approval
              </Link>
              <Link to="/contact" className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300">
                Contact Us
              </Link>
            </div>
            
            <p className="text-sm opacity-75 mt-6">
              *Subject to credit approval. Terms and conditions apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalLoanPage;