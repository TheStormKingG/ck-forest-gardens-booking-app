import React, { useState } from 'react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  navigate: (page: string) => void;
  currentPage: string;
  logo: string | null;
  logoCacheKey?: number;
  // ADDED (to match App.tsx)
  installAvailable?: boolean;
  onInstallClick?: () => void | Promise<void>;
  // Navigation history for back/forward buttons
  history?: string[];
  onBack?: () => void;
  onForward?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  navigate,
  currentPage,
  logo,
  logoCacheKey,
  installAvailable = false,
  onInstallClick,
  history = [],
  onBack,
  onForward,
}) => {
  const isAdminView = currentUser?.role === 'management';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation links
  const navigationLinks = [
    { label: 'Home', page: 'home' },
    { label: 'Packages', page: 'packages' },
    { label: 'Policies', page: 'policies' },
    { label: 'About', page: 'about' },
  ];

  const handleLinkClick = (page: string) => {
    navigate(page);
    setMobileMenuOpen(false);
  };

  const handleAdminLogin = () => {
    navigate('login');
    setMobileMenuOpen(false);
  };

  // Admin view - simplified header
  if (isAdminView) {
    return (
      <header className="bg-white shadow-md sticky top-0 z-40">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button 
              onClick={() => navigate('home')}
              className="flex items-center gap-3 group"
            >
              {logo ? (
                <img 
                  src={logo} 
                  alt="CK Forest Tours Logo" 
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-green-500 group-hover:ring-green-600 transition-all"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-green-500 group-hover:ring-green-600 transition-all">
                  <span className="text-white font-bold text-lg">CK</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">CK Forest Tours</span>
                <span className="text-xs text-green-600">Nature's Paradise</span>
              </div>
            </button>
            <nav className="flex items-center gap-4">
              {installAvailable && (
                <button
                  id="installBtn"
                  onClick={onInstallClick}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  Install
                </button>
              )}
              <button
                onClick={onLogout}
                className="font-medium transition-colors text-gray-700 hover:text-green-600"
              >
                Logout
              </button>
            </nav>
          </div>
        </nav>
      </header>
    );
  }

  // Public/User view - full navigation
  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button 
            onClick={() => navigate('home')}
            className="flex items-center gap-3 group"
          >
            {logo ? (
              <img 
                src={logo} 
                alt="CK Forest Tours Logo" 
                className="w-12 h-12 rounded-full object-cover ring-2 ring-green-500 group-hover:ring-green-600 transition-all"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-green-500 group-hover:ring-green-600 transition-all">
                <span className="text-white font-bold text-lg">CK</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">CK Forest Tours</span>
              <span className="text-xs text-green-600">Nature's Paradise</span>
            </div>
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigationLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.page)}
                className={`font-medium transition-colors ${
                  currentPage === link.page
                    ? 'text-green-600'
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-700 hover:text-green-600 transition-colors"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
              className="lucide lucide-menu w-6 h-6"
            >
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <div className="flex flex-col gap-2 pt-4">
              {navigationLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleLinkClick(link.page)}
                  className={`text-left px-4 py-2 font-medium transition-colors ${
                    currentPage === link.page
                      ? 'text-green-600'
                      : 'text-gray-700 hover:text-green-600'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              {currentUser && (
                <>
                  <button
                    onClick={() => handleLinkClick('my-bookings')}
                    className="text-left px-4 py-2 font-medium transition-colors text-gray-700 hover:text-green-600 border-t border-gray-200 pt-2 mt-2"
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={onLogout}
                    className="text-left px-4 py-2 font-medium transition-colors text-gray-700 hover:text-green-600"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
