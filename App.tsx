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
    console.log('=== PWA INSTALLATION SETUP ===');
    
    const onBIP = (e: Event) => {
      console.log('beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallAvailable(true);
    };
    
    const onInstalled = () => {
      console.log('App installed successfully!');
      setInstallAvailable(false);
      setDeferredPrompt(null);
    };

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is already installed');
      setInstallAvailable(false);
    } else {
      console.log('App not installed, setting up install button');
      
      // Always show install button after a short delay
      const timer = setTimeout(() => {
        console.log('Showing install button');
        setInstallAvailable(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }

    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('=== INSTALL BUTTON CLICKED ===');
    console.log('deferredPrompt available:', !!deferredPrompt);
    console.log('installAvailable:', installAvailable);
    
    try {
      // First check if already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App is already installed');
        setInstallAvailable(false);
        alert('App is already installed!');
        return;
      }
      
      if (deferredPrompt) {
        console.log('Using deferred prompt for installation');
        try {
          await deferredPrompt.prompt();
          const choiceResult = await deferredPrompt.userChoice;
          console.log('User choice:', choiceResult.outcome);
          
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted PWA installation');
            setInstallAvailable(false);
            setDeferredPrompt(null);
          } else {
            console.log('User dismissed PWA installation');
          }
        } catch (error) {
          console.error('Error during deferred prompt:', error);
          showManualInstallInstructions();
        }
      } else {
        console.log('No deferred prompt available');
        console.log('Attempting alternative installation methods...');
        
        // Simple fallback - just show instructions for now
        showManualInstallInstructions();
      }
    } catch (error) {
      console.error('Error in handleInstallClick:', error);
      alert('Installation error: ' + error.message);
    }
  };

  const tryInstallProgrammatically = () => {
    console.log('Attempting programmatic installation...');
    
    // Method 1: Try to trigger beforeinstallprompt by interacting with the page
    const triggerInstallPrompt = () => {
      // Create a temporary button that might trigger the install prompt
      const tempButton = document.createElement('button');
      tempButton.style.display = 'none';
      tempButton.textContent = 'Install App';
      document.body.appendChild(tempButton);
      
      // Try to click it programmatically
      tempButton.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(tempButton);
      }, 100);
    };
    
    // Method 2: Check if we can access the install prompt through other means
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        console.log('Service worker ready:', registration);
        
        // Try to trigger install prompt
        triggerInstallPrompt();
        
        // If still no prompt, try a different approach
        setTimeout(() => {
          if (!deferredPrompt) {
            console.log('Still no deferred prompt, trying alternative approach');
            
            // Try to create a user gesture that might trigger the prompt
            const userGesture = () => {
              // Simulate user interaction
              const event = new Event('click', { bubbles: true });
              document.dispatchEvent(event);
            };
            
            userGesture();
            
            // Last resort: show manual instructions
            setTimeout(() => {
              if (!deferredPrompt) {
                console.log('No install prompt available, showing manual instructions');
                showManualInstallInstructions();
              }
            }, 500);
          }
        }, 1000);
      });
    } else {
      console.log('Service worker not supported');
      showManualInstallInstructions();
    }
  };

  const showManualInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = '';
    
    if (userAgent.includes('chrome') || userAgent.includes('edge')) {
      instructions = 'To install this app:\n\n1. Look for the install icon (⬇️) in your browser\'s address bar\n2. Click the install icon\n3. Follow the installation prompts\n\nIf you don\'t see the install icon, try:\n- Refreshing the page\n- Using Chrome or Edge browser\n- Making sure you\'re not in incognito mode';
    } else if (userAgent.includes('safari')) {
      instructions = 'To install this app on Safari:\n\n1. Tap the Share button (📤) at the bottom\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm\n\nNote: This works on iPhone/iPad Safari';
    } else if (userAgent.includes('firefox')) {
      instructions = 'Firefox doesn\'t support PWA installation.\n\nPlease use Chrome, Edge, or Safari for the best experience.';
    } else {
      instructions = 'To install this app:\n\nChrome/Edge: Look for the install icon in the address bar\nSafari: Tap Share > Add to Home Screen\nFirefox: Not supported\n\nMake sure you\'re using a supported browser.';
    }
    
    alert(instructions);
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
