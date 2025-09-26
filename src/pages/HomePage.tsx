import React from 'react';
import HeroSection from '../components/HeroSection';
import Services from '../components/Services';


const HomePage: React.FC = () => {
  return (
    <div>
      <HeroSection page="home" />
      <Services />
      
    </div>
  );
};

export default HomePage;