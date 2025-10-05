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
            // Pass the saved tab to AdminPage via a custom prop or state
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
        // Add cache-busting timestamp to ensure fresh data
        const timestamp = Date.now();
        console.log(`Fetching settings with timestamp: ${timestamp}`);
        
        // Try Supabase first
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
        // Don't fallback to mock API - just set empty settings
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

  // Wire up beforeinstallprompt → show the Install button in Header
  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallAvailable(true);
    };
    const onInstalled = () => setInstallAvailable(false);

    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstallAvailable(false);
  };

  const navigate = (next: string) => {
    setPage(next);
    // Save current page to localStorage for persistence
    localStorage.setItem('currentPage', next);
    
    // Update navigation history
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
    // If logo was updated, clear it first to force refresh
    if (updatedSettings.logo !== undefined) {
      setSettings(prev => (prev ? { ...prev, logo: null } : null));
      
      try {
        const logoData = await getLogoSettings();
        if (logoData) {
          const newLogo = logoData.logo_data || logoData.logo_url || null;
          setSettings(prev => (prev ? { 
            ...prev, 
            logo: newLogo 
          } : null));
          // Update cache key to force logo refresh
          setLogoCacheKey(Date.now());
        }
      } catch (error) {
        console.error('Failed to refresh logo from Supabase:', error);
      }
    } else {
      // For non-logo updates, just update normally
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
          // NEW: pass install controls to render the button inline with the title
          installAvailable={installAvailable}
          onInstallClick={handleInstallClick}
          // Navigation history
          history={history}
          onBack={historyIndex > 0 ? handleBack : undefined}
          onForward={historyIndex < history.length - 1 ? handleForward : undefined}
        />
        <main className="p-4 sm:p-6 lg:p-8 flex-grow">
          {renderPage()}
        </main>
        <Footer settings={settings} onAdminLogin={handleAdminLogin} />
      </div>
    </SelectedPackageProvider>
  );
};

export default App;
