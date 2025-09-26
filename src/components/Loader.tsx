import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
      </div>
      
      <div className="flex flex-col items-center space-y-8 relative z-10">
        {/* Logo in Circle with Suspension Animation */}
        <div className="relative">
          {/* Outer Ring */}
          <div className="w-32 h-32 rounded-full border-4 border-gradient-to-r from-blue-400 to-cyan-400 animate-spin" style={{animationDuration: '3s'}}>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm"></div>
          </div>
          
          {/* Inner Circle with Logo */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white to-blue-50 shadow-2xl flex items-center justify-center animate-bounce" style={{animationDuration: '2s'}}>
            <img 
              src="/ezy-logo.png" 
              alt="EzyLoan Logo" 
              className="h-12 w-auto filter drop-shadow-lg transform hover:scale-110 transition-transform duration-300"
            />
          </div>
          
          {/* Glowing Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-400/20 animate-ping" style={{animationDuration: '2s'}}></div>
        </div>
        
        {/* Speaker Bass Effect Animation */}
        <div className="flex items-end space-x-1 h-16">
          <div 
            className="w-3 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg transform origin-bottom"
            style={{
              height: '20px',
              animation: 'bassEffect1 1.2s ease-in-out infinite'
            }}
          ></div>
          <div 
            className="w-3 bg-gradient-to-t from-blue-500 to-cyan-300 rounded-t-lg transform origin-bottom"
            style={{
              height: '35px',
              animation: 'bassEffect2 1.2s ease-in-out infinite 0.1s'
            }}
          ></div>
          <div 
            className="w-3 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg transform origin-bottom"
            style={{
              height: '50px',
              animation: 'bassEffect3 1.2s ease-in-out infinite 0.2s'
            }}
          ></div>
          <div 
            className="w-3 bg-gradient-to-t from-blue-500 to-cyan-300 rounded-t-lg transform origin-bottom"
            style={{
              height: '30px',
              animation: 'bassEffect4 1.2s ease-in-out infinite 0.3s'
            }}
          ></div>
          <div 
            className="w-3 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg transform origin-bottom"
            style={{
              height: '45px',
              animation: 'bassEffect5 1.2s ease-in-out infinite 0.4s'
            }}
          ></div>
        </div>
        
        {/* Loading Text with Gradient */}
        <div className="text-center space-y-2">
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent animate-pulse">
            EzyLoan
          </p>
          <p className="text-gray-500 font-medium text-sm tracking-wider animate-pulse">
            Loading your financial journey...
          </p>
          
          {/* Progress Dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;