import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  _id: string;
  image: string;
  page: string;
  isActive: boolean;
}

interface HeroProps {
  page: string;
  title?: string;
  subtitle?: string;
}

const Hero: React.FC<HeroProps> = ({ page, title, subtitle }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
    '/banks/Piramal-Logo.png',
    '/banks/esaf-seeklogo.png',
    '/banks/indostar.png',
  ];

  const [bankLogoPosition, setBankLogoPosition] = useState(0);

  // Fetch banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:3001/api/banners?page=${page}`);
        const activeBanners = response.data.filter((banner: Banner) => banner.isActive);
        setBanners(activeBanners);
      } catch (error) {
        console.error('Error fetching banners:', error);
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, [page]);

  // Auto rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Auto scroll banking partners
  useEffect(() => {
    if (page !== 'home') return;
    const interval = setInterval(() => {
      setBankLogoPosition((prev) => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(interval);
  }, [page]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % Math.max(banners.length, 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + Math.max(banners.length, 1)) % Math.max(banners.length, 1));

  // Loading state
  if (isLoading) {
    return (
      <section className={`relative overflow-hidden min-h-[50vh] bg-gradient-to-br from-blue-50 via-white to-cyan-50 ${page === 'home' ? 'mt-24' : ''}`}>
        <div className="w-full relative z-10">
          <div className="relative w-full h-[50vh] bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      </section>
    );
  }

  // No banners
  if (banners.length === 0) {
    return (
      <section className={`relative overflow-hidden min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 ${page === 'home' ? 'mt-24' : ''}`}>
        <h1 className="text-4xl md:text-5xl font-bold text-white">{title || 'EzyLoan'}</h1>
      </section>
    );
  }

  return (
    <section className={`relative overflow-hidden ${page === 'home' ? 'mt-24' : ''}`}>
      {/* Banner carousel */}
      <div className="relative w-full h-[50vh]">
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className={`absolute top-0 left-0 w-full h-full transition-all duration-1000 ${
              currentSlide === index ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={`http://localhost:3001${banner.image}`}
              alt={`Banner ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            {title && page === 'home' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
                  {subtitle && <p className="text-lg md:text-xl">{subtitle}</p>}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center z-20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center z-20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Banking Partners (home page only) */}
      {page === 'home' && (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">
          <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-4">Our Banking Partners</h2>
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-1000"
                style={{ transform: `translateX(-${bankLogoPosition * (100 / 6)}%)` }}
              >
                {[...bankLogos, ...bankLogos].map((logo, index) => (
                  <div key={index} className="flex-none w-1/3 md:w-1/6 px-2 md:px-4">
                    <img
                      src={logo}
                      alt={`Bank ${index + 1}`}
                      className="h-16 md:h-20 object-contain mx-auto"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
