import React from 'react';
import { Car, ArrowRight, Percent, Clock, Shield, CheckCircle, Star, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from '../components/HeroSection';


const NewCarLoanPage: React.FC = () => {
  const features = [
    'Competitive Interest Rates',
    'Quick Approval Process', 
    'Flexible Repayment Options',
    'Minimal Documentation',
    'Fast Processing',
    'Transparent Terms'
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 max-sm:pt-32 relative z-10 ">

        {/* Hero Image Section */}
        <div className="relative mb-16 max-w-8xl mx-auto overflow-hidden rounded-2xl shadow-xl">
          <Hero
        page="new-car-loan"
        title="New Car Loan"
        subtitle="Drive your dream car today with our competitive car loan offers"
      />
        </div>
       
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="order-2 lg:order-1">
           
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
              Turn Your Dream Into Reality
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Drive home your dream car with EzyLoan! We offer flexible and convenient loan options tailored to your needs, making it easier than ever to own the car you've always wanted. With our quick approval process and competitive interest rates, you can enjoy a hassle-free experience from start to finish.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium text-sm">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/apply-now" className="group flex items-center justify-center space-x-2 text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105">
                <span>Apply Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/contact" className="flex items-center justify-center space-x-2 text-blue-600 font-semibold border-2 border-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 py-4 px-8 rounded-full">
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <img 
                src="/pic/car112.jpg" 
                alt="New Car" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>

        {/* Second Content Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 lg:p-12 mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="rounded-3xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop" 
                  alt="Car Finance" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
                Customized Loan Solutions
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Turn your dream of owning a new car into reality with EzyLoan! Our customized loan solutions are designed to fit your budget, ensuring you get behind the wheel of your favorite car without any financial stress. With fast processing and transparent terms, EzyLoan makes the journey to owning your new car smooth and effortless.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Percent className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Interest Rates from 7.99%</h4>
                    <p className="text-gray-600 text-sm">Competitive rates in the market</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">48 Hour Approval</h4>
                    <p className="text-gray-600 text-sm">Quick processing and disbursement</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Flexible Tenure</h4>
                    <p className="text-gray-600 text-sm">12 to 84 months repayment options</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Why Choose EzyLoan?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the difference with our customer-centric approach and industry-leading services.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Best Rates</h3>
              <p className="text-gray-600">Industry-leading interest rates starting from 7.99% per annum.</p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Quick Process</h3>
              <p className="text-gray-600">Get approved within 48 hours with minimal documentation.</p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Expert Support</h3>
              <p className="text-gray-600">Dedicated relationship managers for personalized assistance.</p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Trusted Brand</h3>
              <p className="text-gray-600">Over 10,000+ satisfied customers across India.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center text-white shadow-2xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Ready to Drive Your Dream Car?</h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
            Apply today and drive away with confidence! Choose EzyLoan and hit the road in your new car without any worries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/apply-now" className="bg-white text-blue-600 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base">
              Apply Now
            </Link>
            <Link to="/contact" className="border-2 border-white text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:bg-white hover:text-blue-600 transition-colors text-sm sm:text-base">
              Contact Us
            </Link>
          </div>
         </div>
       </div>
     </div>
   );
 };

export default NewCarLoanPage;