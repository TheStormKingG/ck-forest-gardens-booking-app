import { supabase } from "../supabase-client";

export interface DashboardStats {
  nextBookingDate: string | null;
  bookingsLastMonth: number;
  bookingsNext30Days: number;
}

export interface BookingTrend {
  month: string;
  bookings: number;
}

// Get dashboard statistics from Supabase bookings table
export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  try {
    // Get next booking (earliest future booking) - use array result to avoid 406
    const { data: nextBookingArray, error: nextError } = await supabase
      .from("bookings")
      .select("checkin_date")
      .gte("checkin_date", now.toISOString())
      .order("checkin_date", { ascending: true })
      .limit(1);

    if (nextError) {
      console.error('Error fetching next booking:', nextError);
    }

    // Get bookings from last month
    const { data: lastMonthBookings, error: lastMonthError } = await supabase
      .from("bookings")
      .select("id")
      .gte("checkin_date", oneMonthAgo.toISOString())
      .lt("checkin_date", now.toISOString());

    if (lastMonthError) {
      console.error('Error fetching last month bookings:', lastMonthError);
    }

    // Get bookings for next 30 days
    const { data: next30DaysBookings, error: next30DaysError } = await supabase
      .from("bookings")
      .select("id")
      .gte("checkin_date", now.toISOString())
      .lte("checkin_date", thirtyDaysFromNow.toISOString());

    if (next30DaysError) {
      console.error('Error fetching next 30 days bookings:', next30DaysError);
    }

    return {
      nextBookingDate: nextBookingArray?.[0]?.checkin_date ?? null,
      bookingsLastMonth: lastMonthBookings?.length || 0,
      bookingsNext30Days: next30DaysBookings?.length || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      nextBookingDate: null,
      bookingsLastMonth: 0,
      bookingsNext30Days: 0,
    };
  }
}

// Get booking trends for the last 3 months
export async function getBookingTrends(): Promise<BookingTrend[]> {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  try {
    // Get all bookings from the last 3 months
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("checkin_date")
      .gte("checkin_date", threeMonthsAgo.toISOString())
      .order("checkin_date", { ascending: true });

    if (error) {
      console.error('Error fetching booking trends:', error);
      return [];
    }

    // Group bookings by month
    const monthlyBookings: { [key: string]: number } = {};
    
    bookings?.forEach(booking => {
      const date = new Date(booking.checkin_date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      monthlyBookings[monthKey] = (monthlyBookings[monthKey] || 0) + 1;
    });

    // Convert to array format and ensure we have the last 3 months
    const trends: BookingTrend[] = [];
    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      trends.push({
        month: date.toLocaleDateString('en-US', { month: 'long' }),
        bookings: monthlyBookings[monthKey] || 0
      });
    }

    return trends;
  } catch (error) {
    console.error('Error fetching booking trends:', error);
    return [];
  }
}
