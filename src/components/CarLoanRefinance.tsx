import React from 'react';
import { ArrowRight, CheckCircle, Calculator, Clock, Shield, TrendingDown, Star, Users, Award, Phone, Mail, MapPin, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const CarLoanRefinance = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Banner Image Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 max-sm:pt-32">
        <div className="relative mb-8 sm:mb-12 lg:mb-16 overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl">
          <img 
            src="/banner/1.png" 
            alt="Car Loan Refinance Banner" 
            className="w-full h-[250px] sm:h-[300px] lg:h-[370px] max-sm:h-[110px] object-cover"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full border border-blue-200 mb-6">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Car Loan Refinance</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-800">
                Take control of your finances with EzyLoan's Car Refinance Loan!
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                If you're looking to lower your monthly payments, reduce your interest rate, or access funds for other expenses, refinancing your car loan can be a smart move. Our easy and efficient refinancing process allows you to replace your existing loan with one that better suits your financial goals.
              </p>
              <p className="text-lg text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                With competitive rates and flexible terms, EzyLoan helps you save money while improving your cash flow. Discover how our Car Refinance Loan can provide you with the financial relief you need and get started today!
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/apply-now" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Apply for Refinancing
                </Link>
                <Link to="/contact" className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Car Loan Refinance Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Car Loan Refinance</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Refinancing your car loan with EzyLoan offers multiple benefits, including lower monthly payments and reduced interest rates. By improving your loan terms, you can save money over time and enhance your cash flow. Whether you want to shorten your loan term or extend it for affordability, EzyLoan makes refinancing simple and efficient. Take control of your finances today!
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-100 hover:border-green-200">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                Swift
              </h3>
              <h4 className="text-lg font-semibold mb-3 text-green-600">
                Digital Application Process
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Say goodbye to endless paperwork and a long waiting period. We offer a completely online process for quick and easy refinance approvals.
              </p>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-100 hover:border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                Unlock
              </h3>
              <h4 className="text-lg font-semibold mb-3 text-blue-600">
                For Higher Funding Amount
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Get substantial additional funds against your current vehicle's worth. Refinance your car loans up to 200% of the value of your vehicle.
              </p>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-100 hover:border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                Flexible
              </h3>
              <h4 className="text-lg font-semibold mb-3 text-purple-600">
                Repayment Tenure
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Select a payment plan between 12 to 60 months according to your budget. Choose a longer repayment period in order to lower your EMI for enhanced financial flexibility.
              </p>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-orange-100 hover:border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                Hassles
              </h3>
              <h4 className="text-lg font-semibold mb-3 text-orange-600">
                Documentation Process
              </h4>
              <p className="text-gray-600 leading-relaxed">
                To apply, simply submit your valid ID, address, and income proof. Get additional funds over your existing loan with minimum documentation.
              </p>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-teal-100 hover:border-teal-200">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-teal-600 transition-colors duration-300">
                Tailor
              </h3>
              <h4 className="text-lg font-semibold mb-3 text-teal-600">
                Repayment Structure
              </h4>
              <p className="text-gray-600 leading-relaxed">
                You can choose a repayment plan that suits your financial needs from our diverse portfolio of partners, offering step-up and balance transfer options.
              </p>
            </div>
          </div>

          {/* Ready to Experience Section */}
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">
              <span className="text-gray-800">Ready to Experience the Benefits of </span>
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Car Loan Refinance</span>
              <span className="text-gray-800">?</span>
            </h2>
            <Link to="/apply-now" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-4 rounded-full text-xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-block">
              Apply Now
            </Link>
          </div>

            {/* Eligibility & Documents */}
            <div className="grid lg:grid-cols-2 gap-12 mb-20">
              {/* Eligibility Criteria */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-green-100">
                <h3 className="text-3xl font-bold mb-8">
                  <span className="text-gray-800">ELIGIBILITY</span>
                  <br />
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">FOR LOAN AGAINST CAR</span>
                </h3>
                
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-bold mb-4 text-blue-600">Salaried Individuals:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">Age criteria: 21 to 60 years</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">Minimum employment of 2 years</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">Income proof</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">Car ownership detail</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-bold mb-4 text-purple-600">Self-Employed Individuals:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">Age criteria: 25 to 60 years</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">Minimum Business setup of 2 years</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">Income proof</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Required Documents */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-blue-100">
                <h3 className="text-3xl font-bold mb-8">
                  <span className="text-gray-800">Documents</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Required for Loan Against CAR</span>
                </h3>
                
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-bold mb-4 text-green-600">Salaried Individuals:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">Completed Application Form</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">A Recent Passport Size Photograph</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">Identity Proof (ID) (Any One)</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">Address Proof (Any One)</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">Income Proof (3 months Salary Slip)</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">Vehicle RC Copy</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">Loan Track Statement</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12">
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Get Started?</h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of satisfied customers who have saved money with our car loan refinancing solutions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <div className="flex items-center text-white">
                    <Phone className="w-6 h-6 mr-3" />
                    <span className="text-lg font-medium">+91 9324973748</span>
                  </div>
                  <div className="flex items-center text-white">
                    <Mail className="w-6 h-6 mr-3" />
                    <span className="text-lg font-medium">info@ezyloan.co.in</span>
                  </div>
                </div>
                <Link to="/apply-now" className="bg-white text-blue-600 font-bold py-4 px-12 rounded-2xl text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl inline-block">
                  Apply for Car Loan Refinancing
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-gray-800">Frequently Asked </span>
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Questions</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                If you have additional questions, please give us a call at +91 6372977626 or email us at Contact@ezyloan.co.in
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-100">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">Q</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                      What type of loan can I get against a used car?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      You can apply for a secured loan where your used car is used as collateral. The loan amount typically depends on the car's market value, age, and condition.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-100">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">Q</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                      What are the eligibility criteria for getting a loan against a used car?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      The eligibility criteria may include a minimum age requirement, proof of income, and ownership of the car. The car should also meet specific age and condition standards.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-100">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">Q</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                      How much loan can I get against my used car?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      The loan amount can vary, but it is usually a percentage of your car's current market value, often ranging between 50% to 80%.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-orange-100">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">Q</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                      What is the interest rate on a loan against a used car?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      The interest rate on a loan against a used car depends on factors such as the car's value, your credit score, and the lender's policies. T ypically, the rates are lower for secured loans.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-indigo-100">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">Q</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                      How long does it take to process a loan against a used car?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      The processing time may vary by lender but generally takes a few days once all required documents are submitted and verified.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-pink-100">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">Q</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-pink-600 transition-colors duration-300">
                      What documents are required to apply for a loan against a used car?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Commonly required documents include proof of car ownership, car insurance, identity proof, address proof, and proof of income.
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      
  );
};

export default CarLoanRefinance;