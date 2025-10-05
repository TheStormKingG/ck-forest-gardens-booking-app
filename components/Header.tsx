import React from 'react';
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
  const isAdminView = currentUser?.role === 'Management';
  const textStyle = 'text-base font-semibold'; // Unified text style

  const Brand: React.FC = () => (
    <div className="flex items-center space-x-2">
      {logo && <img src={logo} alt="CK Forest Gardens Logo" className="h-8 sm:h-10 object-contain" />}
      <span className="text-sm sm:text-base whitespace-nowrap">CK Forest Gardens</span>
    </div>
  );

  return (
    <header className="bg-green-500 text-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {isAdminView ? (
          // Simplified layout for Admin
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <button onClick={() => navigate('home')} className={`${textStyle} min-w-0`}>
                <Brand />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              {/* Install button (Admin view) */}
              {installAvailable ? (
                <button
                  id="installBtn"
                  onClick={onInstallClick}
                  className="px-2 py-1 bg-green-600 text-white rounded text-xs sm:text-sm hover:bg-green-700 transition-colors"
                >
                  Install
                </button>
              ) : (
                <button
                  id="manualInstallBtn"
                  onClick={onInstallClick}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs sm:text-sm hover:bg-blue-700 transition-colors"
                >
                  Install
                </button>
              )}
              <nav>
                <button
                  onClick={onLogout}
                  className={`${textStyle} hover:opacity-80 transition-opacity`}
                >
                  Logout
                </button>
              </nav>
            </div>
          </div>
        ) : (
          // Responsive layout for Public/User
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-2 sm:py-0">
            {/* Top row: Brand and Install button */}
            <div className="flex items-center justify-between w-full sm:w-auto mb-2 sm:mb-0">
              <button onClick={() => navigate('home')} className={`${textStyle} min-w-0`}>
                <Brand />
              </button>
              {/* Install button (Public/User view) */}
              {installAvailable ? (
                <button
                  id="installBtn"
                  onClick={onInstallClick}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  Install App
                </button>
              ) : (
                <button
                  id="manualInstallBtn"
                  onClick={onInstallClick}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Install App
                </button>
              )}
            </div>
            
            {/* Bottom row: Navigation buttons and user actions */}
            <nav className="flex items-center space-x-2 sm:space-x-3">
              {/* Navigation buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={onBack}
                  disabled={!onBack}
                  className={`w-8 h-8 flex items-center justify-center rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                  title="Back"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
                <button
                  onClick={onForward}
                  disabled={!onForward}
                  className={`w-8 h-8 flex items-center justify-center rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                  title="Forward"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
                <button
                  onClick={() => navigate('home')}
                  className={`w-8 h-8 flex items-center justify-center rounded-md hover:bg-green-600 transition-colors`}
                  title="Home"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                </button>
              </div>
              
              {/* User-specific navigation */}
              {currentUser ? (
                <>
                  <button
                    onClick={() => navigate('my-bookings')}
                    className={`text-sm sm:text-base font-semibold hover:opacity-80 transition-opacity`}
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={onLogout}
                    className={`text-sm sm:text-base font-semibold hover:opacity-80 transition-opacity`}
                  >
                    Logout
                  </button>
                </>
              ) : null}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
