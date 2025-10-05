
import React, { useState, useEffect, useCallback } from 'react';
import { Booking } from '../types';
import { api } from '../services/apiMock';

const CalendarPage: React.FC = () => {
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfirmedBookings = useCallback(async () => {
    setIsLoading(true);
    const bookings = await api.getConfirmedBookings();
    // Sort by check-in date
    const sortedBookings = bookings.sort((a, b) => new Date(a.checkinDate).getTime() - new Date(b.checkinDate).getTime());
    setConfirmedBookings(sortedBookings);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchConfirmedBookings();
  }, [fetchConfirmedBookings]);

  if (isLoading) {
    return <div className="text-center">Loading calendar...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-green-900 mb-6 text-center">CKFG Public Bookings Calendar</h1>
      {confirmedBookings.length > 0 ? (
        <div className="space-y-4">
          {confirmedBookings.map((booking) => (
            <div key={booking.id} className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
              <div className="flex-shrink-0 bg-green-600 text-white rounded-lg p-3 text-center w-24">
                <p className="text-sm font-bold uppercase">{new Date(booking.checkinDate).toLocaleString('default', { month: 'short' })}</p>
                <p className="text-3xl font-bold">{new Date(booking.checkinDate).getDate()}</p>
                <p className="text-xs">{new Date(booking.checkinDate).getFullYear()}</p>
              </div>
              <div>
                <h2 className="text-lg font-bold text-green-800">{`CKFG – ${booking.package}`}</h2>
                <p className="text-gray-600">{`Booked by ${booking.fullName.split(' ')[0]}'s group (${booking.headcountTotal} people)`}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 bg-white p-6 rounded-lg shadow">No confirmed bookings to display.</p>
      )}
    </div>
  );
};

export default CalendarPage;
