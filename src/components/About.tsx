import React from 'react';
import { 
  Users, 
  Award, 
  TrendingUp, 
  Heart,
  Target,
  Lightbulb,
  Globe
} from 'lucide-react';
import Hero from './HeroSection';


const About = () => {
  const stats = [
    { number: '100K+', label: 'Happy Customers', icon: Users },
    { number: '₹500Cr+', label: 'Loans Disbursed', icon: TrendingUp },
    { number: '4.8/5', label: 'Customer Rating', icon: Award },
    { number: '24/7', label: 'Customer Support', icon: Heart }
  ];

  const values = [
    {
      icon: Target,
      title: 'Customer First',
      description: 'Every decision we make is centered around providing the best experience for our customers.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We leverage cutting-edge technology to simplify and enhance the lending experience.'
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Making financial services accessible to everyone, everywhere, anytime.'
    }
  ];

  // बैंकिंग पार्टनर्स की सूची - Hero component के समान
  const bankLogos = [
    '/banks/AU-Small-Finance-Bank.webp',
    '/banks/Axis_Bank_logo.svg.png',
    '/banks/Bajaj-Finsery-Logo.png',
    '/banks/chola-logo.jpg',
    
    '/banks/Tata-Capital.png',
    '/banks/HDB.png',
    '/banks/boi.png',
    '/banks/Hero-Fincorp.png',
    '/banks/ICICI-Bank-logo.png',
    '/banks/IDFC-logo.png',
    '/banks/Kotak_Mahindra_Bank_logo.png',
    '/banks/Mahindra_Finance_Logo.png',
    '/banks/Piramal-Logo.png'
  ];

  const bankingPartners = bankLogos.map((logo, index) => ({
    name: `Bank Partner ${index + 1}`,
    logo: logo
  }));

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/10 to-cyan-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-200/10 to-blue-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        

        {/* Hero Image Section */}
        <div className="relative mb-16 max-w-7xl mx-auto overflow-hidden rounded-2xl shadow-xl">
          <Hero
            page="about"
            title="About EzyLoan"
            subtitle="Your trusted financial partner for all loan needs"
          />
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-blue-100/50 shadow-xl mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full backdrop-blur-sm border border-blue-200/50 mb-6">
                <span className="text-sm font-medium text-blue-700">Our Mission</span>
              </div>
              <h3 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  OUR MISSION IS SIMPLE
                </span>
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                At EzyLoan, we redefine the way you access finance in the market era. Our mission is to enhance financial 
                services for cars, trucks & bikes, providing fast and efficient collateral-based loans 
                to deliver maximum value for our customers.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                We transform the financial landscape with a straightforward and transparent 
                approach to securing loans for pre-owned vehicles, ensuring instant 
                and hassle-free experiences.
              </p>
              <div className="flex space-x-4">
                <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
                  ✓ Fast Approval
                </div>
                <div className="bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold">
                  ✓ Transparent Process
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur opacity-20"></div>
              <img 
                src="/pic/mision.jpg" 
                alt="Car Finance" 
                className="relative w-full h-96 max-sm:h-[129px] object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Banking Partners Section */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-blue-100/50 shadow-2xl mb-20">
          <div className="text-center mb-8">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Our Banking Partners
              </span>
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We collaborate with India's leading financial institutions to bring you the best loan offers.
            </p>
          </div>
          
          {/* Scrollable Partners Grid with Auto-Scroll Animation */}
          <div className="relative overflow-hidden py-2">
            <div className="flex animate-scroll pb-4 space-x-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                @keyframes scroll {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(calc(-150px * 12)); }
                }
                .animate-scroll {
                  animation: scroll 40s linear infinite;
                  width: calc(150px * 24);
                }
                .animate-scroll:hover {
                  animation-play-state: paused;
                }
              `}</style>
              
              {/* Double the partners for seamless looping */}
              {[...bankingPartners, ...bankingPartners].map((partner, index) => (
                <div key={index} className="flex-shrink-0 w-40 h-24 bg-gradient-to-br from-white to-blue-50/50 rounded-xl p-3 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110 border border-blue-100/30">
                  <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
              ))}
            </div>
            
            {/* Gradient Overlays to indicate scrolling */}
            <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-blue-50 to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-blue-50 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* What We Specialize In */}
        <div className="bg-gradient-to-br from-cyan-50 via-white to-blue-50 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-cyan-100/50 shadow-xl mb-16">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-100 to-blue-100 px-4 py-2 rounded-full backdrop-blur-sm border border-cyan-200/50 mb-6">
                <span className="text-sm font-medium text-cyan-700">Our Services</span>
              </div>
              <h3 className="text-4xl font-bold mb-8">
                <span className="bg-gradient-to-r from-cyan-600 to-blue-500 bg-clip-text text-transparent">
                  WHAT WE SPECIALIZE IN
                </span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  🚗 Car Loan Against Car
                </div>
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  🚙 Loan Against Car
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  💼 Car Loan Business Purpose
                </div>
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  👤 Personal Loan
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  🚛 Commercial Vehicle Loan
                </div>
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  🏢 Business Loan
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  🏠 Home Loan
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full backdrop-blur-sm border border-purple-200/50 mb-6">
                <span className="text-sm font-medium text-purple-700">Why Choose Us</span>
              </div>
              <h4 className="text-3xl font-bold mb-8">
                <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  WHY CHOOSE US?
                </span>
              </h4>
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">💡</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg mb-2">Expertise</p>
                      <p className="text-gray-600 leading-relaxed">We are committed to delivering exceptional service with years of experience. No challenge is too big or too small for our expert team.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">⭐</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg mb-2">Quality</p>
                      <p className="text-gray-600 leading-relaxed">Providing best-in-class service and value for automotive dealers and customers with flexible, competitive rates tailored to your needs.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">🤝</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg mb-2">Customer Service</p>
                      <p className="text-gray-600 leading-relaxed">Customer-first approach with experienced professionals offering flexible and competitive rates tailored to your specific requirements.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-green-100/50 shadow-xl mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full backdrop-blur-sm border border-green-200/50 mb-6">
              <span className="text-sm font-medium text-green-700">Customer Reviews</span>
            </div>
            <h3 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                TESTIMONIALS
              </span>
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-green-100/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex mb-4">
                <span className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-700 italic mb-6 text-lg leading-relaxed">
                "Fast car financing experience with EzyLoan. We have been using their services for years and they have always been professional and reliable."
              </p>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  A
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">Ankit Sharma</p>
                  <p className="text-green-600 font-medium">Satisfied Customer</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-green-100/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex mb-4">
                <span className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-700 italic mb-6 text-lg leading-relaxed">
                "Straightforward loan approval process. Professional team with excellent customer service. Highly recommended for vehicle financing."
              </p>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  P
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">Priya Patel</p>
                  <p className="text-emerald-600 font-medium">Business Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Automotive News */}
        <div className="bg-gradient-to-br from-orange-50 via-white to-red-50 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-orange-100/50 shadow-xl mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2 rounded-full backdrop-blur-sm border border-orange-200/50 mb-6">
              <span className="text-sm font-medium text-orange-700">Industry Updates</span>
            </div>
            <h3 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
                LATEST AUTOMOTIVE NEWS
              </span>
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-orange-100/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                  alt="Electric Vehicle News" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  🔋 EV News
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-gray-800 mb-3 text-lg">Electric Vehicle Market Growth</h4>
                <p className="text-gray-600 leading-relaxed">Latest trends in electric vehicle adoption and financing options for sustainable transportation...</p>
                <div className="mt-4 text-orange-600 font-medium text-sm">📅 Dec 2024</div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-orange-100/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                  alt="Car Finance News" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  💰 Finance
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-gray-800 mb-3 text-lg">Auto Loan Interest Rates</h4>
                <p className="text-gray-600 leading-relaxed">Current market rates and best practices for vehicle financing with competitive loan options...</p>
                <div className="mt-4 text-orange-600 font-medium text-sm">📅 Dec 2024</div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-orange-100/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                  alt="Used Car Market" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  📊 Market
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-gray-800 mb-3 text-lg">Used Car Market Insights</h4>
                <p className="text-gray-600 leading-relaxed">Market analysis and valuation trends for pre-owned vehicles with expert recommendations...</p>
                <div className="mt-4 text-orange-600 font-medium text-sm">📅 Dec 2024</div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-white/30 shadow-2xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Our Core Values
              </span>
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do and shape our company culture.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div
                  key={index}
                  className="text-center group hover:transform hover:scale-105 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;