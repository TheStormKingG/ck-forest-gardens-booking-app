import React, { useState, useEffect } from 'react';
import { useSelectedPackage } from '../contexts/SelectedPackageContext';
import { Package } from '../types';
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
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-green-900 mb-6">
          Small-Group Eco & Cultural Tours Across Guyana
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
          Locally led experiences built on safety, small groups, and real connection with Guyana's natural beauty.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('packages')}
            className="bg-green-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-green-700 transition-colors duration-300 text-lg"
          >
            View Tours
          </button>
          <button
            onClick={() => navigate('booking')}
            className="bg-white text-green-600 border-2 border-green-600 font-bold py-4 px-8 rounded-lg hover:bg-green-50 transition-colors duration-300 text-lg"
          >
            Plan My Trip
          </button>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-green-900 text-center mb-12">
          Featured Tours & Experiences
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.slice(0, 6).map(pkg => (
            <div key={pkg.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-green-900 mb-2">{pkg.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>
                <ul className="text-sm text-gray-700 space-y-1 mb-4">
                  <li>✓ Small group experience</li>
                  <li>✓ Local guides included</li>
                </ul>
                <button
                  onClick={() => handleBookNow(pkg)}
                  className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Tour Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-green-900 text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">1</span>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Discover</h3>
            <p className="text-gray-600">Browse our curated selection of eco-tours and cultural experiences across Guyana.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Plan</h3>
            <p className="text-gray-600">Choose your dates, group size, and any add-ons. We'll confirm availability within 24 hours.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">3</span>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Book</h3>
            <p className="text-gray-600">Secure your spot with a deposit. Receive confirmation and trip details via email.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">4</span>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Travel</h3>
            <p className="text-gray-600">Meet your local guide, join your small group, and immerse yourself in Guyana's natural beauty.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">5</span>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Return</h3>
            <p className="text-gray-600">Complete your experience with memories, photos, and a deeper connection to Guyana.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">6</span>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Share</h3>
            <p className="text-gray-600">Share your experience with others and help support sustainable tourism in Guyana.</p>
          </div>
        </div>
      </section>

      {/* Proof & Trust Signals */}
      <section className="bg-green-50 rounded-xl p-8 md:p-12 mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-green-900 text-center mb-12">
          Why Choose CK Forest Tours
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">5+</div>
            <p className="text-gray-700 font-semibold">Years Operating</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">1000+</div>
            <p className="text-gray-700 font-semibold">Guests Hosted</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">10</div>
            <p className="text-gray-700 font-semibold">Max Group Size</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
            <p className="text-gray-700 font-semibold">Local Guides</p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-700 mb-4">Licensed & Insured | Safety First Certified | Tourism Board Registered</p>
        </div>
      </section>

      {/* Risk-Reduction Offer */}
      <section className="bg-white border-2 border-green-200 rounded-xl p-8 md:p-12 mb-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
            Not Sure Which Tour Fits?
          </h2>
          <p className="text-xl text-gray-700 mb-6">
            Get a free custom itinerary proposal tailored to your group's interests, budget, and timeline.
          </p>
          <div className="bg-green-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-bold text-green-900 mb-2">What You Get:</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Personalized tour recommendations</li>
              <li>• Detailed itinerary with timing</li>
              <li>• Transparent pricing breakdown</li>
              <li>• Answers to all your questions</li>
            </ul>
          </div>
          <button
            onClick={() => navigate('booking')}
            className="bg-green-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-green-700 transition-colors duration-300 text-lg"
          >
            Request Custom Itinerary
          </button>
          <p className="text-sm text-gray-600 mt-4">Response within 48 hours | No obligation</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
