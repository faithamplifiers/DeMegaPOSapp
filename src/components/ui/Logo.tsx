import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {/* Light Theme Logo (Hidden in dark mode) */}
      <img 
        src="/logo-light.png" 
        alt="Faith Amplifiers" 
        className="block dark:hidden w-full h-full object-contain drop-shadow-sm"
        onError={(e) => {
          // Fallback just in case the file isn't physically in the public folder yet
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement?.classList.add('bg-secondary', 'rounded-full', 'p-1');
        }}
      />
      {/* Dark Theme Logo (Hidden in light mode) */}
      <img 
        src="/logo-dark.png" 
        alt="Faith Amplifiers" 
        className="hidden dark:block w-full h-full object-contain drop-shadow-sm"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export default Logo;