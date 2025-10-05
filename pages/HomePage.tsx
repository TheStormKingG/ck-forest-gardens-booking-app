import React, { useState, useEffect } from 'react';
import { useSelectedPackage } from '../contexts/SelectedPackageContext';
import { Package } from '../types';
import { api } from '../services/apiMock';
import { listPackages } from '../src/services/public';


interface HomePageProps {
  navigate: (page: string) => void;
}

const PackageCard: React.FC<{ pkg: Package, onBook: () => void }> = ({ pkg, onBook }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
    <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-48 object-cover" />
    <div className="p-6">
      <h3 className="text-2xl font-bold text-green-800 mb-2">{pkg.name}</h3>
      <p className="text-gray-600 mb-4">{pkg.description}</p>
      <div className="text-gray-700 space-y-2 mb-4">
        <p><span className="font-semibold">Timing:</span> {pkg.timing}</p>
        <p><span className="font-semibold">Minimum:</span> {pkg.minHeadcount} people</p>
        <p className="text-xl font-semibold text-green-700">GYD {pkg.pricePerPerson.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ person</span></p>
      </div>
      <button onClick={onBook} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300">
        Book Now
      </button>
    </div>
  </div>
);

const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { setSelectedPackage } = useSelectedPackage();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      try {
        // Fetch from Supabase (single source of truth)
        const supabasePackages = await listPackages();
        const mappedPackages: Package[] = (supabasePackages || []).map((pkg: any) => ({
          id: pkg.id,
          name: pkg.title,
          description: pkg.description || '',
          pricePerPerson: pkg.price_gyd,
          minHeadcount: pkg.minimum,
          timing: pkg.timing || '',
          imageUrl: pkg.image_url || ''
        }));
        setPackages(mappedPackages);
      } catch (supabaseError) {
        console.error('Failed to fetch packages from Supabase:', supabaseError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleBookNow = (pkg: Package) => {
    setSelectedPackage(pkg);
    navigate('booking');
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-gray-600">Loading adventures...</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-900">Choose Your Adventure!</h1>
        <p className="mt-4 text-lg text-gray-600">Unforgettable experiences await in the heart of nature.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {packages.map(pkg => (
          <PackageCard key={pkg.id} pkg={pkg} onBook={() => handleBookNow(pkg)} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;