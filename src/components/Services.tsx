import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Building2, 
  Home, 
  Car, 
  GraduationCap, 
  CreditCard,
  ArrowRight,
  Percent,
  Clock,
  Shield,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Car,
      title: 'Used Car Refinance',
      description: 'Refinance your used car loan with us and enjoy better rates and flexible terms.',
      features: ['Lower interest rates', 'Flexible terms', 'Quick approval'],
      amount: '₹1L - ₹75L',
      tenure: '12-84 months',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      link: '/car-loan-refinance'
    },
    {
      icon: Car,
      title: 'New Car Loan',
      description: 'Drive your dream car today with our competitive rates and flexible repayment options available.',
      features: ['Hassle-free process', 'Top-up facility', 'Designed for your needs'],
      amount: '₹2L - ₹1Cr',
      tenure: '12-84 months',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      link: '/new-car-loan'
    },
    {
      icon: Car,
      title: 'Used Car BT',
      description: 'Save more with our Used Car Balance Transfer, offering lower EMIs and better rates.',
      features: ['Lower EMIs', 'Better rates', 'Save more money'],
      amount: '₹1L - ₹50L',
      tenure: '12-60 months',
      color: 'from-green-500 to-teal-500',
      bgColor: 'from-green-50 to-teal-50',
      link: '/car-loan-balance-transfer'
    },
    {
      icon: User,
      title: 'Personal Loan',
      description: 'Fulfill your dreams with our hassle-free Personal Loan, designed to meet your needs.',
      features: ['Hassle-free process', 'Quick disbursement', 'Designed for your needs'],
      amount: '₹50K - ₹40L',
      tenure: '12-60 months',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      link: '/personal-loan'
    },
    {
      icon: Home,
      title: 'Property Loan',
      description: 'Expand your business fleet with our tailored Commercial Vehicle Loan, designed for growth.',
      features: ['Tailored solutions', 'Business growth', 'Flexible terms'],
      amount: '₹5L - ₹10Cr',
      tenure: '60-360 months',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'from-indigo-50 to-purple-50',
      link: '/property-loan'
    },
    {
      icon: Building2,
      title: 'Commercial Vehicle Loan',
      description: 'Get behind the wheel of your dream vehicle with our easy and quick loan approval process.',
      features: ['Easy approval', 'Quick process', 'Dream vehicle financing'],
      amount: '₹2L - ₹2Cr',
      tenure: '12-96 months',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50',
      link: '/commercial-vehicle-loan'
    }
  ];

  const faqs = [
    {
      question: 'What type of loan can I get against my car?',
      answer: 'You can get a secured loan against your car with competitive interest rates and flexible repayment options.'
    },
    {
      question: 'How much loan can I get against my used car?',
      answer: 'You can get up to 80% of your car\'s current market value depending on the car\'s age, condition, and model.'
    },
    {
      question: 'How long does it take to process a loan against a car?',
      answer: 'Loan processing typically takes 24-48 hours once all required documents are submitted.'
    },
    {
      question: 'What documents are required to apply for a loan against a car?',
      answer: 'You\'ll need your ID proof, address proof, income documents, car registration certificate, and insurance papers.'
    }
  ];

  return (
    <section id="services" className="py-12 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Products We Offer
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Whether you're looking to fund personal expenses, grow your business, or buy your dream home, 
            we have the perfect loan solution for you.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Link
                key={index}
                to={service.link}
                className={`group relative bg-gradient-to-br ${service.bgColor} rounded-3xl p-6 border border-white/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer flex flex-col`}
              >
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-4 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-gray-800">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed flex-grow">{service.description}</p>
                  
                  {/* Amount and Tenure */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/60 rounded-lg p-3">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Loan Amount</div>
                      <div className="font-bold text-gray-800">{service.amount}</div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Tenure</div>
                      <div className="font-bold text-gray-800">{service.tenure}</div>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 bg-gradient-to-r ${service.color} rounded-full`}></div>
                        <span className="text-sm font-medium text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA - Always at bottom */}
                  <div className="mt-auto">
                    <div className="group/btn flex items-center justify-center space-x-2 text-white font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 py-3 px-6 rounded-full w-full shadow-lg hover:shadow-xl">
                      <span>Apply Now</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}></div>
              </Link>
            );
          })}
        </div>

        {/* Apply Online Section */}
        <div className="relative h-[250px] max-sm:h-[129px] w-full overflow-hidden rounded-3xl mb-10">
          <img 
            src="/apply-online.jpg" 
            alt="Apply Online" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* FAQ Section */}
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/30 shadow-xl mb-10">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h3>
            <p className="text-gray-600">Find answers to the most common questions about our loan services</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <HelpCircle className="w-5 h-5 text-blue-500 mr-2" />
                    {faq.question}
                  </h4>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </div>
                <div className="p-4 bg-white">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-6 border border-blue-100/50 shadow-lg mb-10">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Get In Touch With Us
              </span>
            </h3>
            <p className="text-gray-600">Ready to get started? Contact our loan experts today!</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Call Us</h4>
                <p className="text-blue-600 font-medium">+91 6372977626</p>
                <p className="text-sm text-gray-500">Mon-Sat: 9AM to 7PM</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Email Us</h4>
                <p className="text-blue-600 font-medium">contact@ezyloan.co.in</p>
                <p className="text-sm text-gray-500">Quick response guaranteed</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Visit Us</h4>
                <p className="text-blue-600 font-medium">1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur, Cuttack, Odisha - 753011, India</p>
                <p className="text-sm text-gray-500">Head Office Location</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/30 shadow-xl">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Why Choose EzyLoan?
              </span>
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We make borrowing simple, transparent, and hassle-free with our customer-first approach.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Percent className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Competitive Rates</h4>
              <p className="text-gray-600">Industry-leading interest rates starting from 8.99% with transparent pricing.</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Quick Processing</h4>
              <p className="text-gray-600">Get approved in as little as 24 hours with our streamlined digital process.</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Secure & Trusted</h4>
              <p className="text-gray-600">Bank-grade security and trusted by over 100,000 satisfied customers.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;