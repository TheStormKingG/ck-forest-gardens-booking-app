
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Package } from '../types';

interface SelectedPackageContextType {
  selectedPackage: Package | null;
  setSelectedPackage: (pkg: Package | null) => void;
}

const SelectedPackageContext = createContext<SelectedPackageContextType | undefined>(undefined);

export const SelectedPackageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  // Restore selected package from localStorage on mount
  useEffect(() => {
    const savedPackage = localStorage.getItem('selectedPackage');
    if (savedPackage) {
      try {
        const packageData = JSON.parse(savedPackage);
        setSelectedPackage(packageData);
      } catch (error) {
        console.error('Failed to restore selected package:', error);
        localStorage.removeItem('selectedPackage');
      }
    }
  }, []);

  // Save selected package to localStorage whenever it changes
  const handleSetSelectedPackage = (pkg: Package | null) => {
    setSelectedPackage(pkg);
    if (pkg) {
      localStorage.setItem('selectedPackage', JSON.stringify(pkg));
    } else {
      localStorage.removeItem('selectedPackage');
    }
  };

  return (
    <SelectedPackageContext.Provider value={{ selectedPackage, setSelectedPackage: handleSetSelectedPackage }}>
      {children}
    </SelectedPackageContext.Provider>
  );
};

export const useSelectedPackage = (): SelectedPackageContextType => {
  const context = useContext(SelectedPackageContext);
  if (context === undefined) {
    throw new Error('useSelectedPackage must be used within a SelectedPackageProvider');
  }
  return context;
};
