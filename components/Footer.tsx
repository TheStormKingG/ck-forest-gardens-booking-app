import React, { useState } from 'react';

interface Settings {
  physical_address: string;
  contact_email: string;
  phone_number: string;
}

interface FooterProps {
  settings: Settings | null;
  logo: string | null;
  onAdminLogin?: () => void;
  navigate?: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ settings, logo, onAdminLogin, navigate }) => {
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

  const handleLinkClick = (page: string) => {
    if (navigate) {
      navigate(page);
    }
  };

  // Format phone number for WhatsApp link (remove spaces, dashes, etc.)
  const formatWhatsAppNumber = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const whatsAppLink = settings?.phone_number 
    ? `https://wa.me/${formatWhatsAppNumber(settings.phone_number)}`
    : '#';

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Logo and Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {logo ? (
                <img 
                  src={logo} 
                  alt="CK Forest Gardens Logo" 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-green-500"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-green-500">
                  <span className="text-white font-bold text-sm">CK</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">CK Forest Gardens</span>
                <span className="text-xs text-green-400">Nature's Paradise</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Experience the beauty of nature in Guyana's premier eco-tourism destination. Book your adventure today!
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleLinkClick('home')}
                  className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('home')}
                  className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('home')}
                  className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                >
                  Activities
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('home')}
                  className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                >
                  Packages
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('home')}
                  className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                >
                  Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('home')}
                  className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                >
                  Terms & Policies
                </button>
              </li>
              <li>
                <button
                  onClick={onAdminLogin}
                  className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                >
                  Admin Login
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Us */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              {settings?.physical_address && (
                <li className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-map-pin w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className="text-sm text-gray-400">{settings.physical_address}</span>
                </li>
              )}
              {settings?.phone_number && (
                <li className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-message-circle w-5 h-5 text-green-500 flex-shrink-0"
                  >
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                  </svg>
                  <a
                    href={whatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                  >
                    WhatsApp: {settings.phone_number}
                  </a>
                </li>
              )}
              {settings?.contact_email && (
                <li className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-mail w-5 h-5 text-green-500 flex-shrink-0"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {settings.contact_email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/CKForestGardens"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 transition-colors"
                aria-label="Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-facebook w-5 h-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 transition-colors"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-instagram w-5 h-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 transition-colors"
                aria-label="Twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-twitter w-5 h-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Stay connected for updates, special offers, and nature insights.
            </p>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">© 2025 CK Forest Gardens. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
