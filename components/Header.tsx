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
    <div className="flex items-center space-x-3">
      {logo && <img src={logo} alt="CK Forest Gardens Logo" className="h-10 object-contain" />}
      <span className="whitespace-nowrap">CK Forest Gardens</span>
    </div>
  );

  return (
    <header className="bg-green-500 text-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {isAdminView ? (
          // Simplified layout for Admin
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <button onClick={() => navigate('home')} className={textStyle}>
                <Brand />
              </button>
              {/* Install button inline with title (Admin view) */}
              <button
                id="installBtn"
                hidden={!installAvailable}
                onClick={onInstallClick}
                className="ml-2 px-3 py-1 bg-green-600 text-white rounded-md text-sm"
              >
                Install
              </button>
            </div>
            <div>
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
          // Original layout for Public/User
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <button onClick={() => navigate('home')} className={textStyle}>
                <Brand />
              </button>
              {/* Install button inline with title (Public/User view) */}
              <button
                id="installBtn"
                hidden={!installAvailable}
                onClick={onInstallClick}
                className="ml-2 px-3 py-1 bg-green-600 text-white rounded-md text-sm"
              >
                Install
              </button>
            </div>
            <nav className="flex items-center space-x-2">
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
                    className={`${textStyle} hover:opacity-80 transition-opacity`}
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={onLogout}
                    className={`${textStyle} hover:opacity-80 transition-opacity`}
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
