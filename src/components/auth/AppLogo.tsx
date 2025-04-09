// components/auth/AppLogo.tsx
import React, { useState } from 'react';

interface AppLogoProps {
  src: string;
  alt: string;
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ src, alt, className = "h-12" }) => {
  const [imageError, setImageError] = useState(false);
  
  if (imageError) {
    return <div className={`${className} flex items-center font-bold text-white`}>NeuraVerse</div>;
  }
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={(e) => {
        console.error('Failed to load logo');
        setImageError(true);
      }}
    />
  );
};

export default AppLogo;