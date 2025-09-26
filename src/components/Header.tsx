import React, { useState } from 'react';
import { Menu, X, ChevronDown, Calculator } from 'lucide-react';
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
            <Link to="/">
              <img src="/ezy-logo.png" alt="EzyLoan Logo" className="h-20 w-auto" />
            </Link>
          </div>
          
          {/* Mobile Apply Now Button */}
          <Link 
            to="/apply-now" 
            className="lg:hidden relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-1.5 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 group overflow-hidden text-sm whitespace-nowrap"
          >
            <span className="relative z-10">Apply Now</span>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full scale-0 group-hover:scale-110 transition-transform duration-500 ease-out"></div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4">
            <Link to="/" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group text-base whitespace-nowrap">
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
            </Link>
            <Link to="/about" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group text-base whitespace-nowrap">
              <span className="relative z-10">About</span>
              <div className="absolute inset-0 -mx-2 -my-1 bg-white/20 backdrop-blur-sm rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
            </Link>

            {/* Car Refinance Dropdown */}
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
              
              {isCarRefinanceOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 opacity-100 transform translate-y-0 transition-all duration-200 ease-out">
                  <Link to="/car-loan-refinance" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">Car Loan Refinance</Link>
                  <Link to="/car-loan-topup" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">Car Loan TopUp</Link>
                  <Link to="/car-loan-balance-transfer" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">Car Loan Balance Transfer</Link>
                </div>
              )}
            </div>

            <Link to="/new-car-loan" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group text-base whitespace-nowrap">New Car Loan</Link>
            <Link to="/personal-loan" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group text-base whitespace-nowrap">Personal Loan</Link>
            <Link to="/property-loan" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group text-base whitespace-nowrap">Property Loan</Link>
            <Link to="/commercial-vehicle-loan" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group text-base whitespace-nowrap">Commercial Vehicle Loan</Link>
            <Link to="/contact" className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium group text-base whitespace-nowrap">Contact</Link>
            
            <Link to="/apply-now" className="relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 group overflow-hidden text-base whitespace-nowrap">
              Apply Now
            </Link>
            
            <Link to="/emi-calculator" className="relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-colors font-medium group text-base whitespace-nowrap flex items-center p-2 rounded-lg ml-0 overflow-hidden">
              <Calculator className="w-6 h-6 text-white" />
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg backdrop-blur-sm bg-white/10 relative group overflow-hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 backdrop-blur-xl bg-white/10 rounded-2xl mt-2 border border-white/20 mx-2">
            <nav className="flex flex-col space-y-4 px-6">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
              
              <div className="border-l-2 border-blue-200 pl-3">
                <div className="text-sm font-semibold text-blue-600 mb-2">Car Refinance</div>
                <Link to="/car-loan-refinance" onClick={() => setIsMenuOpen(false)}>Car Loan Refinance</Link>
                <Link to="/car-loan-topup" onClick={() => setIsMenuOpen(false)}>Car Loan TopUp</Link>
                <Link to="/car-loan-balance-transfer" onClick={() => setIsMenuOpen(false)}>Car Loan Balance Transfer</Link>
              </div>

              <Link to="/new-car-loan" onClick={() => setIsMenuOpen(false)}>New Car Loan</Link>
              <Link to="/personal-loan" onClick={() => setIsMenuOpen(false)}>Personal Loan</Link>
              <Link to="/property-loan" onClick={() => setIsMenuOpen(false)}>Property Loan</Link>
              <Link to="/commercial-vehicle-loan" onClick={() => setIsMenuOpen(false)}>Commercial Vehicle Loan</Link>
              <Link to="/emi-calculator" onClick={() => setIsMenuOpen(false)}>EMI Calculator</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
              <Link to="/apply-now" onClick={() => setIsMenuOpen(false)} className="relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-3 rounded-full font-semibold mt-4 mb-2 text-center block group overflow-hidden max-w-[200px] mx-auto">Apply Now</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
