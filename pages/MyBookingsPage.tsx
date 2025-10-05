
import React, { useState, useEffect, useCallback } from 'react';
import { User, Booking, BookingStatus } from '../types';
import { api } from '../services/apiMock';

interface MyBookingsPageProps {
  currentUser: User | null;
}

const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const statusStyles = {
    [BookingStatus.PendingDeposit]: 'bg-yellow-100 text-yellow-800',
    [BookingStatus.DepositPaid]: 'bg-blue-100 text-blue-800',
    [BookingStatus.Confirmed]: 'bg-green-100 text-green-800',
    [BookingStatus.Cancelled]: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const UploadReceiptForm: React.FC<{ booking: Booking, onUploadSuccess: (bookingId: string) => void }> = ({ booking, onUploadSuccess }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        // Simulate file upload and API call
        await api.updateBooking(booking.id, { 
            status: BookingStatus.DepositPaid, 
            receiptUrl: `mock-drive-link/${file.name}`,
            depositPaidAmount: booking.depositDue
        });
        setIsUploading(false);
        onUploadSuccess(booking.id);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
            <input type="file" onChange={handleFileChange} required className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
            <button type="submit" disabled={isUploading || !file} className="bg-green-600 text-white px-3 py-1 text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400">
                {isUploading ? 'Uploading...' : 'Upload'}
            </button>
        </form>
    );
}

const BookingRow: React.FC<{ booking: Booking, onUploadSuccess: (bookingId: string) => void }> = ({ booking, onUploadSuccess }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center">
        <div>
          <h3 className="text-xl font-bold text-green-800">{booking.package}</h3>
          <p className="text-sm text-gray-500">Booked on: {new Date(booking.createdAt).toLocaleDateString()}</p>
          <p className="text-md text-gray-700">Check-in: <span className="font-semibold">{new Date(booking.checkinDate).toDateString()}</span></p>
          <p className="text-md text-gray-700">{booking.headcountTotal} Guests ({booking.adults} Adults, {booking.children} Children)</p>
        </div>
        <div className="mt-4 md:mt-0 md:text-right">
          <StatusBadge status={booking.status} />
          <p className="text-lg font-semibold mt-2">Subtotal: GYD {booking.subtotal.toLocaleString()}</p>
          <p className="text-md font-semibold text-green-700">Deposit Due: GYD {booking.depositDue.toLocaleString()}</p>
        </div>
      </div>
      {booking.status === BookingStatus.PendingDeposit && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-semibold text-gray-800">Action Required: Upload Deposit Receipt</h4>
          <UploadReceiptForm booking={booking} onUploadSuccess={onUploadSuccess}/>
        </div>
      )}
      {booking.receiptUrl && (
        <p className="mt-2 text-sm text-blue-600">Receipt uploaded.</p>
      )}
    </div>
  );
};

const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ currentUser }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (currentUser) {
      setIsLoading(true);
      const userBookings = await api.getBookings(currentUser, 'User');
      setBookings(userBookings);
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  
  const handleUploadSuccess = (bookingId: string) => {
    // Re-fetch bookings to show updated status
    fetchBookings();
  };

  if (!currentUser) {
    return <div className="text-center text-xl">Please log in to view your bookings.</div>;
  }
  
  if (isLoading) {
    return <div className="text-center text-xl">Loading your bookings...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-green-900 mb-6">My Bookings</h1>
      {bookings.length > 0 ? (
        <div>
          {bookings.map(booking => (
            <BookingRow key={booking.id} booking={booking} onUploadSuccess={handleUploadSuccess} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <p className="text-xl text-gray-700">You have no bookings yet.</p>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
