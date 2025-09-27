import React, { useState, useEffect } from 'react';
import LoadingScreen from './main/loader';
// import PhotoEditor from './photo';
// import EffectsPanel from './defualt';

const MainPage:React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="min-h-screen relative"
    >
      <LoadingScreen isLoaded={isLoaded} />
      
      {/* Content overlay */}
      <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* <PhotoEditor /> */}
        {/* <EffectsPanel /> */}
      </div>
    </div>
  );
}

export default MainPage;