import { Booking, BookingStatus, User, Package, GamificationProfile, RankTier, Badge } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { PACKAGES } from '../constants';

// --- MOCK DATABASE ---
let mockBookings: Booking[] = [
    {
        id: 'aaa-111',
        createdAt: new Date('2024-07-20T10:00:00Z').toISOString(),
        status: BookingStatus.Confirmed,
        package: 'Day Stay',
        checkinDate: new Date('2024-08-15').toISOString(),
        fullName: 'Alice Wonder',
        email: 'user@example.com',
        phone: '123-456-7890',
        adults: 10,
        children: 2,
        favoriteNatureThing: 'The sound of birds',
        headcountTotal: 12,
        pricePerPerson: 5000,
        subtotal: 60000,
        depositDue: 30000,
        receiptUrl: 'mock-drive-link/receipt1.pdf',
        depositPaidAmount: 30000
    },
    {
        id: 'bbb-222',
        createdAt: new Date('2024-07-21T11:00:00Z').toISOString(),
        status: BookingStatus.PendingDeposit,
        package: 'Overnight Stay (Evening Start)',
        checkinDate: new Date('2024-09-01').toISOString(),
        fullName: 'Bob Builder',
        email: 'user@example.com',
        phone: '987-654-3210',
        adults: 8,
        children: 0,
        favoriteNatureThing: 'Stargazing',
        headcountTotal: 8,
        pricePerPerson: 10000,
        subtotal: 80000,
        depositDue: 40000,
    },
    {
        id: 'ccc-333',
        createdAt: new Date('2024-07-22T12:00:00Z').toISOString(),
        status: BookingStatus.DepositPaid,
        package: 'Book 2 Days + Free Night',
        checkinDate: new Date('2024-09-10').toISOString(),
        fullName: 'Charlie Chocolate',
        email: 'charlie@factory.com',
        phone: '555-555-5555',
        adults: 15,
        children: 5,
        favoriteNatureThing: 'Everything!',
        headcountTotal: 20,
        pricePerPerson: 10000,
        subtotal: 200000,
        depositDue: 100000,
        receiptUrl: 'mock-drive-link/receipt2.pdf',
        depositPaidAmount: 100000
    }
];
let mockPackages: Package[] = [...PACKAGES];
let mockSettings = {
    contact_email: 'info@ckforestgardens.com',
    phone_number: '+592-123-4567',
    deposit_instructions: 'Please pay via MMG/BillEasy using your booking ID as reference.',
};
let mockGamificationProfiles: GamificationProfile[] = [
    { userEmail: 'user@example.com', points: 650, rankTier: RankTier.Ranger, badges: [Badge.FirstSteps, Badge.CampfireCrew] },
    { userEmail: 'charlie@factory.com', points: 2200, rankTier: RankTier.Guardian, badges: [Badge.FirstSteps, Badge.CampfireCrew, Badge.Trailblazer] },
    { userEmail: 'admin@example.com', points: 100, rankTier: RankTier.Explorer, badges: [] }
];

// --- MOCK API SERVICE ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  // Bookings
  createBooking: async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> => {
    await delay(1000); // Simulate network delay
    
    const newBooking: Booking = {
      ...bookingData,
      id: uuidv4().substring(0, 8),
      createdAt: new Date().toISOString(),
      status: BookingStatus.PendingDeposit,
    };

    mockBookings.push(newBooking);
    
    console.log("Created booking:", newBooking);
    // In a real app, an email would be sent here.
    console.log("Simulating: Payment instruction email sent for booking:", newBooking.id);

    return newBooking;
  },

  // Fix: Implement missing API functions
  updateBooking: async (bookingId: string, updateData: Partial<Booking>): Promise<Booking> => {
    await delay(500);
    const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) throw new Error('Booking not found');
    mockBookings[bookingIndex] = { ...mockBookings[bookingIndex], ...updateData };
    return mockBookings[bookingIndex];
  },

  getBookings: async (user: User | undefined, role: 'User' | 'Management'): Promise<Booking[]> => {
    await delay(800);
    if (role === 'Management' || !user) {
      return [...mockBookings].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return mockBookings.filter(b => b.email === user.email)
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getConfirmedBookings: async (): Promise<Booking[]> => {
    await delay(600);
    return mockBookings.filter(b => b.status === BookingStatus.Confirmed);
  },

  getDashboardStats: async () => {
    await delay(700);
    return {
      pendingDeposit: mockBookings.filter(b => b.status === BookingStatus.PendingDeposit).length,
      upcomingBookings: mockBookings.filter(b => b.status === BookingStatus.Confirmed && new Date(b.checkinDate) > new Date()).length,
      totalConfirmed: mockBookings.filter(b => b.status === BookingStatus.Confirmed).length,
    };
  },

  getPackages: async (): Promise<Package[]> => {
    await delay(300);
    return mockPackages;
  },
  
  updatePackage: async (packageId: string, updateData: Partial<Package>): Promise<Package> => {
    await delay(500);
    const packageIndex = mockPackages.findIndex(p => p.id === packageId);
    if (packageIndex === -1) throw new Error('Package not found');
    mockPackages[packageIndex] = { ...mockPackages[packageIndex], ...updateData };
    return mockPackages[packageIndex];
  },

  getSettings: async (): Promise<any> => {
    await delay(200);
    return mockSettings;
  },

  updateSettings: async (newSettings: any): Promise<any> => {
    await delay(500);
    mockSettings = { ...mockSettings, ...newSettings };
    return mockSettings;
  },

  getGamificationData: async (): Promise<GamificationProfile[]> => {
    await delay(900);
    return [...mockGamificationProfiles].sort((a,b) => b.points - a.points);
  },

  getGamificationProfile: async (email: string): Promise<GamificationProfile | null> => {
    await delay(400);
    const profile = mockGamificationProfiles.find(p => p.userEmail === email);
    return profile || null;
  }
};
