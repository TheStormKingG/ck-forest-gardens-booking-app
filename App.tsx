import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PackagesPage from './pages/PackagesPage';
import AboutPage from './pages/AboutPage';
import PoliciesPage from './pages/PoliciesPage';
import BookingFormPage from './pages/BookingFormPage';
import { SelectedPackageProvider } from './contexts/SelectedPackageContext';
import { User, AppSettings } from './types';
import LoginPage from './pages/LoginPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminPage from './pages/AdminPage';
import CalendarPage from './pages/CalendarPage';
import GamificationPage from './pages/GamificationPage';
import { api } from './services/apiMock';
import { getGeneralSettings, getLogoSettings } from './src/services/settings';
import { supabase } from './src/supabase-client';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const App: React.FC = () => {
  const [page, setPage] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [logoCacheKey, setLogoCacheKey] = useState<number>(Date.now());
  const [history, setHistory] = useState<string[]>(['home']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // PWA install state
  const [installAvailable, setInstallAvailable] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  // Restore session on page reload and handle PWA standalone mode
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedPage = localStorage.getItem('currentPage');
    const savedAdminTab = localStorage.getItem('adminTab');
    
    // If app is installed (standalone mode), redirect to admin/login
    if (isAppInstalled()) {
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          if (user.role === 'management') {
            setPage('admin');
            localStorage.setItem('currentPage', 'admin');
            // Restore admin tab if available
            if (savedAdminTab) {
              // @ts-ignore
              window.adminTab = savedAdminTab;
            }
          } else {
            // Not an admin user, redirect to login
            setPage('login');
            localStorage.setItem('currentPage', 'login');
          }
        } catch (error) {
          console.error('Failed to restore user session:', error);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('currentPage');
          localStorage.removeItem('adminTab');
          setPage('login');
          localStorage.setItem('currentPage', 'login');
        }
      } else {
        // No saved user, redirect to login in standalone mode
        setPage('login');
        localStorage.setItem('currentPage', 'login');
      }
    } else {
      // Normal browser mode - restore session normally
      if (savedUser && savedPage) {
        try {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          if (user.role === 'management' && savedPage === 'admin') {
            setPage('admin');
            // Restore admin tab if available
            if (savedAdminTab) {
              // @ts-ignore
              window.adminTab = savedAdminTab;
            }
          }
        } catch (error) {
          console.error('Failed to restore user session:', error);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('currentPage');
          localStorage.removeItem('adminTab');
        }
      } else if (savedPage) {
        // Restore page even without user (for booking form persistence)
        setPage(savedPage);
      }
    }
    
    // Clear any cached settings/logo from localStorage to ensure fresh load from Supabase
    localStorage.removeItem('cachedLogo');
    localStorage.removeItem('cachedSettings');
    localStorage.removeItem('appSettings');
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const timestamp = Date.now();
        console.log(`Fetching settings with timestamp: ${timestamp}`);
        
        const [generalData, logoData] = await Promise.all([
          getGeneralSettings(),
          getLogoSettings()
        ]);
        
        console.log('Supabase settings loaded:', { generalData, logoData, timestamp });
        
        setSettings({
          logo: logoData?.logo_data || logoData?.logo_url || null,
          physical_address: generalData?.physical_address || '',
          contact_email: generalData?.contact_email || '',
          phone_number: generalData?.phone_number || '',
        });
      } catch (error) {
        console.error('Failed to load settings from Supabase:', error);
        setSettings({
          logo: null,
          physical_address: '',
          contact_email: '',
          phone_number: '',
        });
      }
    };
    fetchSettings();
  }, []);

  // Helper function to check if app is installed
  const isAppInstalled = (): boolean => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    );
  };

  // PWA: register listeners and only show Install button when BIP fires (admin users only)
  useEffect(() => {
    console.log('=== PWA INSTALLATION SETUP ===');

    const onBIP = (e: Event) => {
      console.log('beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Only set install available if app is not already installed AND user is admin
      if (!isAppInstalled() && currentUser?.role === 'management') {
        setInstallAvailable(true);
      }
    };

    const onInstalled = () => {
      console.log('App installed successfully!');
      setInstallAvailable(false);
      setDeferredPrompt(null);
      setShowInstallModal(false);
    };

    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);

    // Hide button if already installed (Chrome + iOS Safari) or user is not admin
    if (isAppInstalled() || currentUser?.role !== 'management') {
      setInstallAvailable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [currentUser]);

  const handleInstallClick = async () => {
    console.log('=== INSTALL BUTTON CLICKED ===');
    
    if (isAppInstalled()) {
      console.log('App is already installed');
      setInstallAvailable(false);
      setDeferredPrompt(null);
      alert('App is already installed!');
      return;
    }

    if (!deferredPrompt) {
      console.log('No deferred prompt available — showing manual instructions');
      showManualInstallInstructions();
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      console.log('User choice:', choiceResult.outcome);

      // After calling prompt(), Chrome allows it only once.
      setDeferredPrompt(null);
      setInstallAvailable(false);
      setShowInstallModal(false);
    } catch (error: any) {
      console.error('Error during install prompt:', error);
      showManualInstallInstructions();
    }
  };

  const handleInstallFromModal = async () => {
    if (!deferredPrompt) {
      showManualInstallInstructions();
      setShowInstallModal(false);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      console.log('User choice:', choiceResult.outcome);
      
      setDeferredPrompt(null);
      setInstallAvailable(false);
      setShowInstallModal(false);
      
      if (choiceResult.outcome === 'accepted') {
        // User accepted, modal will close when appinstalled fires
      } else {
        // User dismissed, remember this choice
        localStorage.setItem('installModalDismissed', 'true');
      }
    } catch (error: any) {
      console.error('Error during install prompt:', error);
      showManualInstallInstructions();
      setShowInstallModal(false);
    }
  };

  const handleDismissInstallModal = () => {
    setShowInstallModal(false);
    localStorage.setItem('installModalDismissed', 'true');
  };

  const showManualInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = '';
    
    if (userAgent.includes('chrome') || userAgent.includes('edge')) {
      instructions =
        'To install this app:\n\n1. Look for the install icon (⬇️) in your browser\'s address bar\n2. Click the install icon\n3. Follow the installation prompts\n\nIf you don\'t see the install icon, try:\n- Refreshing the page\n- Using Chrome or Edge browser\n- Making sure you\'re not in incognito mode';
    } else if (userAgent.includes('safari')) {
      instructions =
        'To install this app on Safari:\n\n1. Tap the Share button (📤)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm';
    } else if (userAgent.includes('firefox')) {
      instructions = 'Firefox does not support PWA installation. Please use Chrome, Edge, or Safari.';
    } else {
      instructions =
        'To install this app:\n\nChrome/Edge: Click the install icon in the address bar\nSafari: Share → Add to Home Screen\nFirefox: Not supported';
    }
    
    alert(instructions);
  };

  const navigate = (next: string) => {
    setPage(next);
    localStorage.setItem('currentPage', next);
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(next);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPage(history[newIndex]);
      localStorage.setItem('currentPage', history[newIndex]);
      window.scrollTo(0, 0);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPage(history[newIndex]);
      localStorage.setItem('currentPage', history[newIndex]);
      window.scrollTo(0, 0);
    }
  };

  const handleAdminLogin = () => {
    navigate('login');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (user.role === 'management') {
      navigate('admin');
      localStorage.setItem('currentPage', 'admin');
      
      // Show install modal for admin users if app is not installed
      const appInstalled = isAppInstalled();
      const installModalDismissed = localStorage.getItem('installModalDismissed');
      
      console.log('Admin login - Modal check:', { 
        appInstalled, 
        installModalDismissed, 
        shouldShow: !appInstalled && !installModalDismissed 
      });
      
      if (!appInstalled && !installModalDismissed) {
        // Small delay to ensure page navigation completes
        setTimeout(() => {
          console.log('Showing install modal');
          setShowInstallModal(true);
        }, 500);
      }
    } else {
      navigate('my-bookings');
      localStorage.setItem('currentPage', 'my-bookings');
    }
  };

  const handleLogout = async () => {
    // Sign out from Supabase
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase sign out error:', error);
    }
    
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentPage');
    localStorage.removeItem('adminTab');
    navigate('home');
  };

  const handleSettingsChange = async (updatedSettings: Partial<AppSettings>) => {
    if (updatedSettings.logo !== undefined) {
      setSettings(prev => (prev ? { ...prev, logo: null } : null));
      try {
        const logoData = await getLogoSettings();
        if (logoData) {
          const newLogo = logoData.logo_data || logoData.logo_url || null;
          setSettings(prev => (prev ? { ...prev, logo: newLogo } : null));
          setLogoCacheKey(Date.now());
        }
      } catch (error) {
        console.error('Failed to refresh logo from Supabase:', error);
      }
    } else {
      setSettings(prev => (prev ? { ...prev, ...updatedSettings } : null));
    }
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage navigate={navigate} />;
      case 'packages':
        return <PackagesPage navigate={navigate} />;
      case 'about':
        return <AboutPage navigate={navigate} />;
      case 'policies':
        return <PoliciesPage navigate={navigate} />;
      case 'booking':
        return <BookingFormPage navigate={navigate} />;
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case 'my-bookings':
        return <MyBookingsPage currentUser={currentUser} />;
      case 'public-calendar':
        return <CalendarPage />;
      case 'leaderboard':
        return <GamificationPage currentUser={currentUser} />;
      case 'admin':
        if (currentUser?.role === 'management') {
          return <AdminPage currentUser={currentUser} onSettingsChange={handleSettingsChange} />;
        }
        navigate('home');
        return <HomePage navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  // Install Modal Component
  const InstallModal: React.FC = () => {
    if (!showInstallModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Cover Image */}
          <div className="w-full h-48 overflow-hidden">
            <img 
              src="/Untitled design (15).png" 
              alt="CK Forest Tours" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Install CK Forest Tours Admin App</h2>
            <p className="text-gray-700 text-center mb-6">
              Install our app for quick access to the admin panel and better performance on your device.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleInstallFromModal}
                className="flex-1 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Install Now
              </button>
              <button
                onClick={handleDismissInstallModal}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SelectedPackageProvider>
      <div className="min-h-screen bg-green-50 flex flex-col">
        <InstallModal />
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          navigate={navigate}
          currentPage={page}
          logo={settings?.logo || null}
          logoCacheKey={logoCacheKey}
          installAvailable={installAvailable}
          onInstallClick={handleInstallClick}
          history={history}
          onBack={historyIndex > 0 ? handleBack : undefined}
          onForward={historyIndex < history.length - 1 ? handleForward : undefined}
        />
        <main className="p-4 sm:p-6 lg:p-8 flex-grow">
          {renderPage()}
        </main>
        <Footer settings={settings} logo={settings?.logo || null} onAdminLogin={handleAdminLogin} navigate={navigate} />
      </div>
    </SelectedPackageProvider>
  );
};

export default App;
