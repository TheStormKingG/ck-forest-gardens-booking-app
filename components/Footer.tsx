
import React, { useState } from 'react';

interface Settings {
  physical_address: string;
  contact_email: string;
  phone_number: string;
}

interface FooterProps {
  settings: Settings | null;
  onAdminLogin?: () => void;
}

const Footer: React.FC<FooterProps> = ({ settings, onAdminLogin }) => {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleTreeClick = () => {
    const now = Date.now();
    
    if (now - lastClickTime < 500) { // Double click within 500ms
      setClickCount(prev => prev + 1);
      if (clickCount === 1) { // Second click
        onAdminLogin?.();
        setClickCount(0);
      }
    } else {
      setClickCount(1);
    }
    
    setLastClickTime(now);
    
    // Reset click count after 1 second
    setTimeout(() => setClickCount(0), 1000);
  };

  return (
    <footer className="bg-green-500 text-white shadow-md mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-auto md:h-16 flex flex-col md:flex-row items-center justify-between py-4 md:py-0">
        <div className="text-sm text-center md:text-left mb-2 md:mb-0">
          <p>&copy; 2025 | CK Forest Gardens</p>
        </div>
        
        {/* Tree icon in center */}
        <div className="flex items-center justify-center mb-2 md:mb-0">
          <button
            onClick={handleTreeClick}
            className="text-2xl hover:text-green-200 transition-colors cursor-pointer"
          >
            🌳
          </button>
        </div>
        
        {settings && (
          <div className="text-sm text-center md:text-right">
            <p>{settings.physical_address}</p>
            <p>{settings.contact_email} &bull; {settings.phone_number}</p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
