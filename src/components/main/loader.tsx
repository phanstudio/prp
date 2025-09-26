import React from 'react';

type LoadingScreenProps = {
  isLoaded: boolean;
};

const LoadingScreen:React.FC<LoadingScreenProps> = ({ isLoaded }) => {
  
  return (
    <div className={`fixed inset-0 bg-black z-50 flex items-center 
      justify-center transition-all duration-1000 ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`
    }>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-4 mx-auto"></div>
        <p className="text-white text-xl font-light tracking-wider">Initializing Investigation...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;