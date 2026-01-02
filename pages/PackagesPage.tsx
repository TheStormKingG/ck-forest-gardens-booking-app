import React, { useState, useEffect } from 'react';
import { useSelectedPackage } from '../contexts/SelectedPackageContext';
import { Package } from '../types';
import { listPackages } from '../src/services/public';

interface PackagesPageProps {
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

const PackagesPage: React.FC<PackagesPageProps> = ({ navigate }) => {
  const { setSelectedPackage } = useSelectedPackage();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      try {
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
        <h2 className="text-2xl font-semibold text-gray-600">Loading tours...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12 py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-900 mb-4">Our Tours & Packages</h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Choose from our carefully curated selection of eco-tours and cultural experiences across Guyana. 
          All tours are led by certified local guides with small group sizes for personalized experiences.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map(pkg => (
          <PackageCard key={pkg.id} pkg={pkg} onBook={() => handleBookNow(pkg)} />
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600 text-lg">No packages available at this time.</p>
          <p className="text-gray-500 mt-2">Please check back soon or contact us for custom tour options.</p>
        </div>
      )}

      <div className="mt-12 bg-green-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-green-900 mb-4">Looking for Something Custom?</h2>
        <p className="text-gray-700 mb-6">
          We can create a personalized itinerary tailored to your group's interests, timeline, and budget.
        </p>
        <a
          href="https://wa.me/5927122534"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors inline-block"
        >
          Request Custom Tour
        </a>
      </div>
    </div>
  );
};

export default PackagesPage;

