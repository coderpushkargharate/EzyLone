import React from 'react';
import { Menu, X, ChevronDown, Calculator } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCarRefinanceOpen, setIsCarRefinanceOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-0">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/ezy-logo.png" alt="EzyLoan Logo" className="h-20 w-auto" />
          </div>
          
          {/* Mobile Apply Now Button - Only visible on mobile */}
          <Link to="/apply-now" className="lg:hidden relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-1.5 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 group overflow-hidden text-sm whitespace-nowrap">
            <span className="relative z-10">Apply Now</span>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full scale-0 group-hover:scale-110 transition-transform duration-500 ease-out"></div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4">
            <a href="/" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group text-base whitespace-nowrap">
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
            </a>
            <a href="/about" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group text-base whitespace-nowrap">
              <span className="relative z-10">About</span>
              <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
            </a>
            <div 
              className="relative group"
              onMouseEnter={() => setIsCarRefinanceOpen(true)}
              onMouseLeave={() => setIsCarRefinanceOpen(false)}
            >
              <button 
                className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group text-base whitespace-nowrap flex items-center space-x-1"
              >
                <span className="relative z-10">Car Refinance</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isCarRefinanceOpen ? 'rotate-180' : ''}`} />
                <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
              </button>
              
              {/* Dropdown Menu */}
              {isCarRefinanceOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 opacity-100 transform translate-y-0 transition-all duration-200 ease-out">
                  <Link
                    to="/car-loan-refinance"
                    className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setIsCarRefinanceOpen(false)}
                  >
                    Car Loan Refinance
                  </Link>
                  <Link
                    to="/car-loan-topup"
                    className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setIsCarRefinanceOpen(false)}
                  >
                    Car Loan TopUp
                  </Link>
                  <Link
                    to="/car-loan-balance-transfer"
                    className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setIsCarRefinanceOpen(false)}
                  >
                    Car Loan Balance Transfer
                  </Link>
                </div>
              )}
            </div>
            <a href="/new-car-loan" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group text-base whitespace-nowrap">
              <span className="relative z-10">New Car Loan</span>
              <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
            </a>

            <a href="/personal-loan" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group text-base whitespace-nowrap">
              <span className="relative z-10">Personal Loan</span>
              <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
            </a>
            <a href="/property-loan" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group text-base whitespace-nowrap">
              <span className="relative z-10">Property Loan</span>
              <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
            </a>
            <a href="/commercial-vehicle-loan" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group text-base whitespace-nowrap">
              <span className="relative z-10">Commercial Vehicle Loan</span>
              <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
            </a>
            <a href="/contact" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group text-base whitespace-nowrap">
              <span className="relative z-10">Contact</span>
              <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
            </a>
            <Link to="/apply-now" className="relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 group overflow-hidden text-base whitespace-nowrap">
              <span className="relative z-10">Apply Now</span>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full scale-0 group-hover:scale-110 transition-transform duration-500 ease-out"></div>
            </Link>
            <a href="/emi-calculator" className="relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-colors font-medium group text-base whitespace-nowrap flex items-center p-2 rounded-lg ml-0 overflow-hidden">
              <span className="relative z-10">
                <Calculator className="w-6 h-6 text-white" />
              </span>
              <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
              {/* Shine effect */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-white/30 transform rotate-45 translate-x-[-100%] translate-y-[-100%] group-hover:translate-x-[300%] group-hover:translate-y-[300%] transition-transform duration-700 ease-out"></div>
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg backdrop-blur-sm bg-white/10 relative group overflow-hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="relative z-10">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </span>
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 backdrop-blur-xl bg-white/10 rounded-2xl mt-2 border border-white/20 mx-2">
            <nav className="flex flex-col space-y-4 px-6">
              <a href="/" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group">
                <span className="relative z-10">Home</span>
                <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
              </a>
              <a href="/about" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group">
                <span className="relative z-10">About</span>
                <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
              </a>
              
              {/* Car Refinance Section */}
              <div className="border-l-2 border-blue-200 pl-3">
                <div className="text-sm font-semibold text-blue-600 mb-2">Car Refinance</div>
                <a href="/car-loan-refinance" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group block mb-2">
                  <span className="relative z-10">Car Loan Refinance</span>
                  <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
                </a>
                <a href="/car-loan-topup" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group block mb-2">
                  <span className="relative z-10">Car Loan TopUp</span>
                  <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
                </a>
                <a href="/car-loan-balance-transfer" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group block">
                  <span className="relative z-10">Car Loan Balance Transfer</span>
                  <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
                </a>
              </div>
              
              <a href="/new-car-loan" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group">
                <span className="relative z-10">New Car Loan</span>
                <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
              </a>
              <a href="/personal-loan" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group">
                <span className="relative z-10">Personal Loan</span>
                <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
              </a>
              <a href="/property-loan" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group">
                <span className="relative z-10">Property Loan</span>
                <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
              </a>
              <a href="/commercial-vehicle-loan" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group">
                <span className="relative z-10">Commercial Vehicle Loan</span>
                <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
              </a>

              <a href="/emi-calculator" className="relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-colors font-medium group px-3 py-2 rounded-lg overflow-hidden">
                <span className="relative z-10 flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-white" />
                  <span>EMI Calculator</span>
                </span>
                <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
                {/* Shine effect */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-white/30 transform rotate-45 translate-x-[-100%] translate-y-[-100%] group-hover:translate-x-[300%] group-hover:translate-y-[300%] transition-transform duration-700 ease-out"></div>
              </a>
              <a href="/contact" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group">
                <span className="relative z-10">Contact</span>
                <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
              </a>
              <Link 
                to="/apply-now" 
                className="relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-3 rounded-full font-semibold mt-4 mb-2 text-center block group overflow-hidden max-w-[200px] mx-auto"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="relative z-10">Apply Now</span>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full scale-0 group-hover:scale-110 transition-transform duration-500 ease-out"></div>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;