import React, { useState, useEffect, useCallback, useRef } from 'react';
// FIX: Aliased imported 'AdminPage' enum to 'AdminPageEnum' to avoid conflict with the component name.
import { Booking, BookingStatus, AdminPage as AdminPageEnum, Package, User, AppSettings } from '../types';
import { api } from '../services/apiMock';
import { PACKAGES } from '../constants';
import { listPackages } from '../src/services/public';
import { adminUpsertPackage, adminDeletePackage } from '../src/services/admin';
import { getGeneralSettings, upsertGeneralSettings, getLogoSettings, upsertLogoSettings, getPasswordSettings, upsertPasswordSettings } from '../src/services/settings';
import { hashPassword, verifyPassword } from '../src/utils/password';
import { getDashboardStats, getBookingTrends } from '../src/services/dashboard';

/* NEW: Supabase admin service for bookings */
import { adminListBookings } from '../src/services/admin';

// --- HELPER COMPONENTS ---

const BookingDetailModal: React.FC<{ booking: Booking, onClose: () => void }> = ({ booking, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl relative">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 transition-colors" aria-label="Close booking details">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-green-800">{booking.package}</h2>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-sm text-gray-600">Check-in: {new Date(booking.checkinDate).toDateString()}</p>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Left Column */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-xs">Customer</h3>
              <p className="text-gray-900 font-medium">{booking.fullName}</p>
              <p className="text-gray-700">{booking.email}</p>
              <p className="text-gray-700">{booking.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-xs">Guests</h3>
              <p className="text-gray-900">{booking.headcountTotal} Total ({booking.adults} Adults, {booking.children} Children)</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-xs">Add-ons</h3>
              <ul className="text-gray-700">
                {booking.wantsMeals && <li>Meals</li>}
                {booking.wantsTransportation && <li>Transportation</li>}
                {booking.wantsTourGuide && <li>Tour Guide</li>}
                {(!booking.wantsMeals && !booking.wantsTransportation && !booking.wantsTourGuide) && <li>None</li>}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-xs">Nature Preference</h3>
              <p className="text-gray-700 italic">"{booking.favoriteNatureThing}"</p>
            </div>
          </div>
        </div>
        
        {/* Footer / Financials */}
        <div className="mt-4 border-t pt-4 space-y-2">
          {booking.receiptUrl ? (
            <a 
              href={booking.receiptUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg inline-block transition-colors"
            >
              View Deposit Receipt
            </a>
          ) : (
            <button 
              disabled 
              className="w-full text-center bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed"
            >
              View Deposit Receipt
            </button>
          )}
          <button 
            disabled 
            className="w-full text-center bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed"
          >
            View Full Payment Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

// PackageFormModal Component
const PackageFormModal: React.FC<{
  packageToEdit: Package | null;
  isCreating: boolean;
  onClose: () => void;
  onSave: (pkgData: Partial<Package>) => Promise<void>;
}> = ({ packageToEdit, isCreating, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Package>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const initialData = {
      name: packageToEdit?.name || '',
      description: packageToEdit?.description || '',
      pricePerPerson: packageToEdit?.pricePerPerson || 0,
      minHeadcount: packageToEdit?.minHeadcount || 10,
      timing: packageToEdit?.timing || '',
      imageUrl: packageToEdit?.imageUrl || '',
    };
    setFormData(initialData);
    setImagePreviewUrl(packageToEdit?.imageUrl || null);
  }, [packageToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = name === 'pricePerPerson' || name === 'minHeadcount';
    setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImageUrl = reader.result as string;
        setImagePreviewUrl(newImageUrl);
        setFormData(prev => ({ ...prev, imageUrl: newImageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-100 text-black p-2";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl relative">
        <h2 className="text-2xl font-bold text-green-800 mb-4">{isCreating ? 'Create New Package' : 'Edit Package'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pkg-name" className="block text-sm font-medium text-gray-700">Package Name</label>
            <input id="pkg-name" type="text" name="name" value={formData.name || ''} onChange={handleChange} required className={inputStyle} autoComplete="off" />
          </div>
          <div>
            <label htmlFor="pkg-description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="pkg-description" name="description" value={formData.description || ''} onChange={handleChange} required rows={3} className={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pkg-price" className="block text-sm font-medium text-gray-700">Price per Person</label>
              <input id="pkg-price" type="number" name="pricePerPerson" value={formData.pricePerPerson || ''} onChange={handleChange} required className={inputStyle} autoComplete="off" />
            </div>
            <div>
              <label htmlFor="pkg-min" className="block text-sm font-medium text-gray-700">Min Headcount</label>
              <input id="pkg-min" type="number" name="minHeadcount" value={formData.minHeadcount || ''} onChange={handleChange} required className={inputStyle} autoComplete="off" />
            </div>
          </div>
          <div>
            <label htmlFor="pkg-timing" className="block text-sm font-medium text-gray-700">Timing</label>
            <input id="pkg-timing" type="text" name="timing" value={formData.timing || ''} onChange={handleChange} required className={inputStyle} autoComplete="off" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Package Image</label>
            <div className="mt-1 flex items-center space-x-4">
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="Package Preview" className="h-20 w-20 object-cover rounded-md bg-gray-100" />
              ) : (
                <div className="h-20 w-20 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">
                  No Image
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                {imagePreviewUrl ? 'Change Image' : 'Upload Image'}
              </button>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSaving} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// DeleteConfirmationModal Component
const DeleteConfirmationModal: React.FC<{
  packageName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}> = ({ packageName, onClose, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
        <p className="text-gray-600 mb-6">Are you sure you want to delete the package "<span className="font-semibold">{packageName}</span>"? This action cannot be undone.</p>
        <div className="flex justify-center space-x-4">
          <button onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300">Cancel</button>
          <button onClick={handleConfirm} disabled={isDeleting} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- TAB COMPONENTS ---
// Helper to display human-friendly package titles on admin views
const resolvePackageTitle = (storedPackage: string | undefined) => {
  if (!storedPackage) return 'Package';
  const match = PACKAGES.find(p => p.id === storedPackage);
  return match ? match.name : storedPackage;
};

const BookingTrendChart: React.FC<{ data: { month: string, bookings: number }[] }> = ({ data }) => {
  if (!data || data.length < 2) {
    return <div className="text-center p-4 text-gray-500">Not enough data to display trend.</div>;
  }

  const svgWidth = 500;
  const svgHeight = 200;
  const padding = 30;
  const chartWidth = svgWidth - padding * 2;
  const chartHeight = svgHeight - padding * 2;

  const maxBooking = Math.max(...data.map(d => d.bookings), 0);
  const yScaleMax = maxBooking === 0 ? 10 : Math.ceil(maxBooking * 1.2 / 5) * 5;

  const pathData = data.map((point, i) => {
    const x = (chartWidth / (data.length - 1)) * i + padding;
    const y = chartHeight - (point.bookings / yScaleMax) * chartHeight + padding;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const yAxisLabels = Array.from({ length: 3 }, (_, i) => Math.round(yScaleMax / 2 * i));

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto" role="img" aria-labelledby="chart-title">
      <title id="chart-title">A line chart showing the number of bookings over the last 3 months.</title>
      {yAxisLabels.map((label) => {
        const y = chartHeight - (label / yScaleMax) * chartHeight + padding;
        return (
          <g key={`y-label-${label}`}>
            <text x={padding - 10} y={y} textAnchor="end" alignmentBaseline="middle" className="text-xs fill-current text-gray-500">
              {label}
            </text>
            <line x1={padding} y1={y} x2={svgWidth - padding} y2={y} className="stroke-current text-gray-200" strokeWidth="0.5" />
          </g>
        );
      })}
      {data.map((point, i) => {
        const x = (chartWidth / (data.length - 1)) * i + padding;
        return (
          <text key={`x-label-${point.month}`} x={x} y={svgHeight - padding + 15} textAnchor="middle" className="text-xs fill-current text-gray-500">
            {point.month}
          </text>
        );
      })}
      <path d={pathData} className="stroke-current text-green-600" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((point, i) => {
        const x = (chartWidth / (data.length - 1)) * i + padding;
        const y = chartHeight - (point.bookings / yScaleMax) * chartHeight + padding;
        return (
          <circle key={`point-${i}`} cx={x} cy={y} r="3" className="fill-current text-green-700" />
        );
      })}
    </svg>
  );
};

const DashboardView: React.FC = () => {
  const [stats, setStats] = useState<{ nextBookingDate: string | null; bookingsLastMonth: number; bookingsNext30Days: number; }>({ nextBookingDate: null, bookingsLastMonth: 0, bookingsNext30Days: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [trendData, setTrendData] = useState<{ month: string, bookings: number }[]>([]);
  const [isTrendLoading, setIsTrendLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Try Supabase first
        const data = await getDashboardStats();
        setStats(data);
        console.log('Dashboard stats loaded from Supabase:', data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats from Supabase", error);
        // Fallback to mock API
        try {
          const data = await api.getDashboardStats();
          setStats(data);
          console.log('Dashboard stats loaded from mock API:', data);
        } catch (mockError) {
          console.error("Failed to fetch dashboard stats from mock API", mockError);
        }
      }
    };
    
    const fetchTrends = async () => {
      setIsTrendLoading(true);
      try {
        // Try Supabase first
        const data = await getBookingTrends();
        setTrendData(data);
        console.log('Booking trends loaded from Supabase:', data);
      } catch (error) {
        console.error("Failed to fetch booking trends from Supabase", error);
        // Fallback to mock API
        try {
          const data = await api.getBookingTrends();
          setTrendData(data);
          console.log('Booking trends loaded from mock API:', data);
        } catch (mockError) {
          console.error("Failed to fetch booking trends from mock API", mockError);
        }
      } finally {
        setIsTrendLoading(false);
      }
    };
    
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStats(), fetchTrends()]);
      setIsLoading(false);
    }
    
    loadData();
  }, []);

  const formatNextBooking = (dateString: string | null) => {
    if (!dateString) {
      return <p className="text-2xl font-bold text-gray-500 mt-2">None</p>;
    }
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
      <>
        <p className="text-3xl font-bold text-green-600 mt-2">{dayOfWeek}</p>
        <p className="text-sm text-gray-500">({formattedDate})</p>
      </>
    );
  };

  if (isLoading) return <div className="text-center p-8">Loading dashboard...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-medium text-gray-500">Next Booking</h3>
        {formatNextBooking(stats.nextBookingDate)}
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-medium text-gray-500">Bookings Last Month</h3>
        <p className="text-4xl font-bold text-blue-600 mt-2">{stats.bookingsLastMonth}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-medium text-gray-500">Bookings Next 30 Days</h3>
        <p className="text-4xl font-bold text-orange-500 mt-2">{stats.bookingsNext30Days}</p>
      </div>
      <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-500 mb-4">Booking Trends (Last 3 Months)</h3>
        {isTrendLoading ? (
          <div className="text-center p-8 text-gray-500">Loading trends...</div>
        ) : (
          <BookingTrendChart data={trendData} />
        )}
      </div>
    </div>
  );
};

const QueueView: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllBookings = useCallback(async () => {
    setIsLoading(true);
    /* NEW: load from Supabase and map to UI Booking */
    const rows: any[] = await adminListBookings();
    const mapped: Booking[] = rows.map((r: any) => ({
      id: r.id,
      createdAt: r.created_at || r.createdAt || new Date().toISOString(),
      fullName: r.full_name,
      email: r.email,
      phone: r.phone,
      checkinDate: r.checkin_date || r.check_in_date,
      package: resolvePackageTitle(r.package || r.package_name || r.packages?.title),
      adults: r.adults ?? 0,
      children: r.children ?? 0,
      wantsMeals: r.wants_meals ?? false,
      wantsTransportation: r.wants_transportation ?? false,
      wantsTourGuide: r.wants_tour_guide ?? false,
      favoriteNatureThing: r.favorite_nature_thing ?? '',
      headcountTotal: r.headcount_total ?? (r.adults ?? 0) + (r.children ?? 0),
      pricePerPerson: r.price_per_person ?? 0,
      subtotal: r.subtotal ?? 0,
      depositDue: r.deposit_due ?? 0,
      receiptUrl: r.receipt_url || null,
      status: BookingStatus.PendingDeposit, // Default status since schema doesn't have status column
    }));
    setBookings(mapped);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  if (isLoading) {
    return <div className="text-center p-8">Loading bookings...</div>;
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adults</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kids</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meals</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guide</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Nature Preference</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{booking.fullName}</div>
                <div className="text-sm text-gray-500">{booking.email}</div>
                <div className="text-sm text-gray-500">{booking.phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(booking.checkinDate).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{booking.package}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{booking.adults}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{booking.children}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{booking.wantsMeals ? 'Yes' : 'No'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{booking.wantsTransportation ? 'Yes' : 'No'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{booking.wantsTourGuide ? 'Yes' : 'No'}</td>
              <td className="px-6 py-4 text-sm text-gray-700 whitespace-normal">{booking.favoriteNatureThing}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {booking.receiptUrl ? (
                  <a href={booking.receiptUrl} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-1 px-3 rounded-full whitespace-nowrap">View Receipt</a>
                ) : (
                  'N/A'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ManagementCalendarView: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const statusColors: Record<BookingStatus, string> = {
    [BookingStatus.PendingDeposit]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    [BookingStatus.DepositPaid]: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    [BookingStatus.Confirmed]: 'bg-green-100 text-green-800 hover:bg-green-200',
    [BookingStatus.Cancelled]: 'bg-red-100 text-red-800 hover:bg-red-200',
  };

  const fetchAllBookings = useCallback(async () => {
    setIsLoading(true);
    /* NEW: load from Supabase and map to UI Booking */
    const rows: any[] = await adminListBookings();
    const mapped: Booking[] = rows.map((r: any) => ({
      id: r.id,
      createdAt: r.created_at || r.createdAt || new Date().toISOString(),
      fullName: r.full_name,
      email: r.email,
      phone: r.phone,
      checkinDate: r.checkin_date || r.check_in_date,
      package: resolvePackageTitle(r.package || r.package_name || r.packages?.title),
      adults: r.adults ?? 0,
      children: r.children ?? 0,
      wantsMeals: r.wants_meals ?? false,
      wantsTransportation: r.wants_transportation ?? false,
      wantsTourGuide: r.wants_tour_guide ?? false,
      favoriteNatureThing: r.favorite_nature_thing ?? '',
      headcountTotal: r.headcount_total ?? (r.adults ?? 0) + (r.children ?? 0),
      pricePerPerson: r.price_per_person ?? 0,
      subtotal: r.subtotal ?? 0,
      depositDue: r.deposit_due ?? 0,
      receiptUrl: r.receipt_url || null,
      status: BookingStatus.PendingDeposit, // Default status since schema doesn't have status column
    }));
    setBookings(mapped);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  const bookingsByDate = React.useMemo(() => {
    const grouped: { [key: string]: Booking[] } = {};
    bookings.forEach(booking => {
      const dateKey = new Date(booking.checkinDate).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(booking);
    });
    return grouped;
  }, [bookings]);

  const handlePrevMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1));
  };

  const renderCalendarGrid = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const grid = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      grid.push(<div key={`empty-${i}`} className="border-r border-b border-gray-200"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateKey = currentDate.toDateString();
      const dayBookings = bookingsByDate[dateKey] || [];
      const isToday = currentDate.getTime() === today.getTime();

      grid.push(
        <div key={day} className={`border-r border-b border-gray-200 p-2 min-h-[120px] flex flex-col ${isToday ? 'bg-green-50' : ''}`}>
          <span className={`font-semibold ${isToday ? 'text-green-700' : 'text-gray-700'}`}>{day}</span>
          <div className="mt-1 space-y-1 overflow-y-auto">
            {dayBookings.map(booking => (
              <div 
                key={booking.id} 
                className={`text-xs p-1 rounded-md truncate cursor-pointer transition-colors ${statusColors[booking.status]}`} 
                title={`${booking.package} - ${booking.fullName}`}
                onClick={() => setSelectedBooking(booking)}
              >
                {booking.package}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return grid;
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return <div className="text-center p-8 bg-white rounded-lg shadow-md">Loading calendar...</div>;
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Previous month">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h3 className="text-xl font-bold text-gray-800">
            {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Next month">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <div className="grid grid-cols-7 border-t border-l border-gray-200">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2 border-r border-b border-gray-200 bg-gray-50">
              {day}
            </div>
          ))}
          {renderCalendarGrid()}
        </div>
      </div>
      {selectedBooking && (
        <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </>
  );
};

const PackagesView: React.FC = () => {
  // State for packages, loading, and modals
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch packages from Supabase (fallback to mock if needed)
  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows: any[] = await listPackages();
      const mapped: Package[] = (rows || []).map((r: any) => ({
        id: r.id,
        name: r.title,
        description: r.description || '',
        pricePerPerson: r.price_gyd,
        minHeadcount: r.minimum,
        timing: r.timing || '',
        imageUrl: r.image_url || ''
      }));
      setPackages(mapped);
    } catch (error) {
      console.error("Failed to fetch packages from Supabase", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Modal handlers
  const handleOpenCreateModal = () => {
    setSelectedPackage(null);
    setIsCreating(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsCreating(false);
    setIsModalOpen(true);
  };
  
  const handleOpenDeleteConfirm = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsDeleteConfirmOpen(true);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setIsDeleteConfirmOpen(false);
    setSelectedPackage(null);
  };
  
  // Create/Update via Supabase
  const handleSavePackage = async (pkgData: Partial<Package>) => {
    const supabasePayload: any = {
      // map UI fields -> Supabase columns
      title: pkgData.name || '',
      description: pkgData.description || '',
      price_gyd: Number(pkgData.pricePerPerson) || 0,
      minimum: Number(pkgData.minHeadcount) || 10,
      timing: pkgData.timing || '',
      image_url: pkgData.imageUrl || '',
    };
    if (!isCreating && selectedPackage) {
      supabasePayload.id = selectedPackage.id;
    }
    await adminUpsertPackage(supabasePayload);
    await fetchPackages();
    handleCloseModals();
  };

  const handleDeletePackage = async () => {
    if (selectedPackage) {
      await adminDeletePackage(selectedPackage.id);
      await fetchPackages();
      handleCloseModals();
    }
  };
  
  if (isLoading) return <div className="text-center p-8 bg-white rounded-lg shadow-md">Loading packages...</div>;

  return (
    <div>
      <div className="flex justify-center mb-4">
        <button
          onClick={handleOpenCreateModal}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Create New Package
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
            <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-48 object-cover" />
            <div className="p-6 flex-grow flex flex-col">
              <h3 className="text-2xl font-bold text-green-800 mb-2">{pkg.name}</h3>
              <p className="text-gray-600 mb-4 flex-grow">{pkg.description}</p>
              <div className="text-gray-700 space-y-2 mb-4">
                <p><span className="font-semibold">Timing:</span> {pkg.timing}</p>
                <p><span className="font-semibold">Minimum:</span> {pkg.minHeadcount} people</p>
                <p className="text-xl font-semibold text-green-700">GYD {pkg.pricePerPerson.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ person</span></p>
              </div>
              <div className="mt-auto pt-4 border-t flex justify-end space-x-2">
                <button onClick={() => handleOpenEditModal(pkg)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Edit</button>
                <button onClick={() => handleOpenDeleteConfirm(pkg)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {isModalOpen && (
        <PackageFormModal
          packageToEdit={selectedPackage}
          isCreating={isCreating}
          onClose={handleCloseModals}
          onSave={handleSavePackage}
        />
      )}
      
      {isDeleteConfirmOpen && selectedPackage && (
        <DeleteConfirmationModal
          packageName={selectedPackage.name}
          onClose={handleCloseModals}
          onConfirm={handleDeletePackage}
        />
      )}
    </div>
  );
};

const SettingsView: React.FC<{ currentUser: User, onSettingsChange: (settings: Partial<AppSettings>) => void }> = ({ currentUser, onSettingsChange }) => {
  const [settings, setSettings] = useState({ contact_email: '', phone_number: '', deposit_instructions: '', physical_address: '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingLogo, setIsSavingLogo] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50 text-black p-2";
  const buttonStyle = "bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400";

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [generalData, logoData] = await Promise.all([
          getGeneralSettings(),
          getLogoSettings()
        ]);
        
        if (generalData) {
          setSettings({
            contact_email: generalData.contact_email || '',
            phone_number: generalData.phone_number || '',
            deposit_instructions: generalData.deposit_instructions || '',
            physical_address: generalData.physical_address || '',
          });
        }
        
        if (logoData) {
          setLogoPreview(logoData.logo_data || logoData.logo_url || null);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Fallback to mock API
        api.getSettings().then(data => {
          if (data) {
            setSettings({
              contact_email: data.contact_email || '',
              phone_number: data.phone_number || '',
              deposit_instructions: data.deposit_instructions || '',
              physical_address: data.physical_address || '',
            });
            setLogoPreview(data.logo || null);
          }
        });
      }
    };
    
    loadSettings();
  }, []);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const updatedSettings = await upsertGeneralSettings(settings);
      await onSettingsChange(updatedSettings);
      alert('Contact and Payment info saved!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSavingSettings(false);
    }
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      alert("New passwords do not match.");
      return;
    }
    setIsSavingPassword(true);
    
    try {
      // Get current password from Supabase
      const currentPasswordSettings = await getPasswordSettings();
      
      if (!currentPasswordSettings?.password_hash) {
        // No password set yet, just set the new one
        const newPasswordHash = await hashPassword(passwordData.new);
        await upsertPasswordSettings(newPasswordHash);
        alert('Password set successfully!');
        setPasswordData({ current: '', new: '', confirm: '' });
        return;
      }
      
      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(passwordData.current, currentPasswordSettings.password_hash);
      
      if (!isCurrentPasswordValid) {
        alert('Current password does not match.');
        return;
      }
      
      // Hash and save new password
      const newPasswordHash = await hashPassword(passwordData.new);
      await upsertPasswordSettings(newPasswordHash);
      alert('Password updated successfully!');
      setPasswordData({ current: '', new: '', confirm: '' });
      
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password. Please try again.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLogoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoPreview) {
      alert("No logo to save.");
      return;
    }
    setIsSavingLogo(true);
    try {
      const logoData = { logo_data: logoPreview };
      await upsertLogoSettings(logoData);
      await onSettingsChange({ logo: logoPreview });
      alert('Logo updated successfully!');
    } catch (error) {
      console.error('Failed to save logo:', error);
      alert('Failed to save logo. Please try again.');
    } finally {
      setIsSavingLogo(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* General Settings */}
      <form onSubmit={handleSettingsSave} className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-green-800 mb-4">General Settings</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="deposit-instructions" className="block text-sm font-medium text-gray-700">Payment Instructions</label>
            <textarea id="deposit-instructions" name="deposit_instructions" rows={4} value={settings.deposit_instructions} onChange={handleSettingsChange} className={inputStyle} />
            <p className="mt-1 text-xs text-gray-500">This message is shown to customers after they start a booking.</p>
          </div>
          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700">Contact Email</label>
            <input id="contact-email" type="email" name="contact_email" value={settings.contact_email} onChange={handleSettingsChange} className={inputStyle} autoComplete="email" />
          </div>
          <div>
            <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700">Contact Phone</label>
            <input id="phone-number" type="tel" name="phone_number" value={settings.phone_number} onChange={handleSettingsChange} className={inputStyle} autoComplete="tel" />
          </div>
          <div>
            <label htmlFor="physical-address" className="block text-sm font-medium text-gray-700">Physical Address</label>
            <input id="physical-address" type="text" name="physical_address" value={settings.physical_address} onChange={handleSettingsChange} className={inputStyle} autoComplete="street-address" />
          </div>
        </div>
        <div className="mt-6 text-right">
          <button type="submit" className={buttonStyle} disabled={isSavingSettings}>{isSavingSettings ? 'Saving...' : 'Save Settings'}</button>
        </div>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePasswordSave} className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-green-800 mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Current Password</label>
            <input id="current-password" type="password" name="current" value={passwordData.current} onChange={handlePasswordChange} required className={inputStyle} autoComplete="current-password" />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</label>
            <input id="new-password" type="password" name="new" value={passwordData.new} onChange={handlePasswordChange} required className={inputStyle} autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input id="confirm-password" type="password" name="confirm" value={passwordData.confirm} onChange={handlePasswordChange} required className={inputStyle} autoComplete="new-password" />
          </div>
        </div>
        <div className="mt-6 text-right">
          <button type="submit" className={buttonStyle} disabled={isSavingPassword}>{isSavingPassword ? 'Saving...' : 'Update Password'}</button>
        </div>
      </form>

      {/* Update Logo */}
      <form onSubmit={handleLogoSave} className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-green-800 mb-4">Application Logo</h3>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo Preview" className="h-20 w-40 bg-gray-100 p-2 rounded-md object-contain" />
            ) : (
              <div className="h-20 w-40 bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-400">
                No Logo
              </div>
            )}
            <div>
              <input type="file" ref={fileInputRef} onChange={handleLogoFileChange} className="hidden" accept="image/*" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">
                Upload Image
              </button>
              <p className="mt-1 text-xs text-gray-500">Recommended size: transparent background, max 200px width.</p>
            </div>
          </div>
          <div>
            <button type="submit" className={buttonStyle} disabled={isSavingLogo}>
              {isSavingLogo ? 'Saving...' : 'Save Logo'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// --- ICONS ---
const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {children}
  </svg>
);

const DashboardIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></IconWrapper>;
const BookingsIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></IconWrapper>;
const CalendarIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></IconWrapper>;
const PackagesIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></IconWrapper>;
const SettingsIcon = () => <IconWrapper><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></IconWrapper>;

const navItems = [
  { name: 'Dashboard', page: AdminPageEnum.Dashboard, icon: <DashboardIcon /> },
  { name: 'Bookings', page: AdminPageEnum.Queue, icon: <BookingsIcon /> },
  { name: 'Calendar', page: AdminPageEnum.Calendar, icon: <CalendarIcon /> },
  { name: 'Packages', page: AdminPageEnum.Packages, icon: <PackagesIcon /> },
  { name: 'Settings', page: AdminPageEnum.Settings, icon: <SettingsIcon /> },
];

interface AdminPageProps {
  currentUser: User;
  onSettingsChange: (settings: Partial<AppSettings>) => Promise<void>;
}

const AdminPage: React.FC<AdminPageProps> = ({ currentUser, onSettingsChange }) => {
  const [activePage, setActivePage] = useState<AdminPageEnum>(AdminPageEnum.Dashboard);

  // Restore admin tab on component mount
  useEffect(() => {
    const savedTab = localStorage.getItem('adminTab');
    if (savedTab && Object.values(AdminPageEnum).includes(savedTab as AdminPageEnum)) {
      setActivePage(savedTab as AdminPageEnum);
    }
  }, []);

  // Save admin tab when it changes
  const handleTabChange = (tab: AdminPageEnum) => {
    setActivePage(tab);
    localStorage.setItem('adminTab', tab);
  };

  const renderContent = () => {
    switch (activePage) {
      case AdminPageEnum.Dashboard:
        return <DashboardView />;
      case AdminPageEnum.Queue:
        return <QueueView />;
      case AdminPageEnum.Calendar:
        return <ManagementCalendarView />;
      case AdminPageEnum.Packages:
        return <PackagesView />;
      case AdminPageEnum.Settings:
        return <SettingsView currentUser={currentUser} onSettingsChange={onSettingsChange} />;
      default:
        return <DashboardView />;
    }
  };

  const currentPageName = navItems.find(item => item.page === activePage)?.name || 'Admin';

  return (
    <div className="max-w-7xl mx-auto">
      <nav className="bg-green-900 text-white shadow-lg rounded-lg mb-6">
        <div className="flex justify-between items-center p-3 px-6">
          <h2 className="text-xl font-bold whitespace-nowrap">
            {currentPageName}
          </h2>
          <div className="flex items-center space-x-2">
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => handleTabChange(item.page)}
                className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
                  activePage === item.page
                    ? 'bg-green-600'
                    : 'hover:bg-green-800'
                }`}
                title={item.name}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>
      </nav>
      {renderContent()}
    </div>
  );
};

export default AdminPage;
