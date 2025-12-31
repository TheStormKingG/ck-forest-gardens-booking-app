import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
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

  // Restore session on page reload
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedPage = localStorage.getItem('currentPage');
    const savedAdminTab = localStorage.getItem('adminTab');
    
    if (savedUser && savedPage) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        if (user.role === 'Management' && savedPage === 'admin') {
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

  // PWA: register listeners and only show Install button when BIP fires
  useEffect(() => {
    console.log('=== PWA INSTALLATION SETUP ===');

    const onBIP = (e: Event) => {
      console.log('beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallAvailable(true); // show button only when prompt is available
    };

    const onInstalled = () => {
      console.log('App installed successfully!');
      setInstallAvailable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);

    // Hide button if already installed (Chrome + iOS Safari)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    if (isStandalone) {
      setInstallAvailable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('=== INSTALL BUTTON CLICKED ===');
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    if (isStandalone) {
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
    } catch (error: any) {
      console.error('Error during install prompt:', error);
      showManualInstallInstructions();
    }
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
    if (user.role === 'Management') {
      navigate('admin');
      localStorage.setItem('currentPage', 'admin');
    } else {
      navigate('my-bookings');
      localStorage.setItem('currentPage', 'my-bookings');
    }
  };

  const handleLogout = () => {
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
        if (currentUser?.role === 'Management') {
          return <AdminPage currentUser={currentUser} onSettingsChange={handleSettingsChange} />;
        }
        navigate('home');
        return <HomePage navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <SelectedPackageProvider>
      <div className="min-h-screen bg-green-50 flex flex-col">
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
