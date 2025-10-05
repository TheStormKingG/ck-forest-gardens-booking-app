
import { Booking, BookingStatus, User, Package, GamificationProfile, RankTier, Badge } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { PACKAGES } from '../constants';

// --- UTILITIES ---

const getDateRelative = (days: number): Date => {
    const date = new Date();
    date.setHours(0,0,0,0);
    date.setDate(date.getDate() + days);
    return date;
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- PERSISTENCE HELPERS ---

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            return JSON.parse(storedValue);
        }
    } catch (error) {
        console.error(`Failed to parse ${key} from localStorage. Resetting.`, error);
        localStorage.removeItem(key);
    }
    // If nothing in storage or parsing failed, set initial data
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
};

const saveToStorage = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Failed to save ${key} to localStorage`, error);
    }
};

// --- STORAGE KEYS ---
const PACKAGES_STORAGE_KEY = 'ckfg_packages';
const BOOKINGS_STORAGE_KEY = 'ckfg_bookings';
const SETTINGS_STORAGE_KEY = 'ckfg_settings';
const GAMIFICATION_STORAGE_KEY = 'ckfg_gamification_profiles';
const PASSWORDS_STORAGE_KEY = 'ckfg_passwords';


// --- INITIAL MOCK DATA (used if localStorage is empty) ---

const initialUsers: User[] = [
    { id: 'user-1', email: 'user@example.com', fullName: 'Alice Wonder', role: 'User' },
    { id: 'user-2', email: 'charlie@factory.com', fullName: 'Charlie Chocolate', role: 'User' },
    { id: 'admin-1', email: 'ckforestgardens@gmail.com', fullName: 'Admin CKFG', role: 'Management' }
];

const initialPasswords: Record<string, string> = {
    'user@example.com': 'password',
    'charlie@factory.com': 'password',
    'ckforestgardens@gmail.com': 'password123'
};

const initialBookings: Booking[] = [
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
        depositPaidAmount: 30000,
        wantsMeals: true,
        wantsTransportation: false,
        wantsTourGuide: true,
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
        wantsMeals: false,
        wantsTransportation: true,
        wantsTourGuide: false,
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
        depositPaidAmount: 100000,
        wantsMeals: true,
        wantsTransportation: true,
        wantsTourGuide: true,
    },
    {
        id: 'lw-1', createdAt: getDateRelative(-10).toISOString(), status: BookingStatus.Confirmed, package: 'Day Stay',
        checkinDate: getDateRelative(-6).toISOString(), fullName: 'Last Week User 1', email: 'lw1@test.com', phone: '111',
        adults: 10, children: 0, favoriteNatureThing: 'a', headcountTotal: 10, pricePerPerson: 5000, subtotal: 50000, depositDue: 25000,
    },
    {
        id: 'lw-2', createdAt: getDateRelative(-10).toISOString(), status: BookingStatus.DepositPaid, package: 'Day Stay',
        checkinDate: getDateRelative(-4).toISOString(), fullName: 'Last Week User 2', email: 'lw2@test.com', phone: '111',
        adults: 10, children: 0, favoriteNatureThing: 'a', headcountTotal: 10, pricePerPerson: 5000, subtotal: 50000, depositDue: 25000,
    },
    {
        id: 'lw-3', createdAt: getDateRelative(-10).toISOString(), status: BookingStatus.PendingDeposit, package: 'Day Stay',
        checkinDate: getDateRelative(-2).toISOString(), fullName: 'Last Week User 3', email: 'lw3@test.com', phone: '111',
        adults: 10, children: 0, favoriteNatureThing: 'a', headcountTotal: 10, pricePerPerson: 5000, subtotal: 50000, depositDue: 25000,
    },
    {
        id: 'n7-6', createdAt: getDateRelative(-10).toISOString(), status: BookingStatus.Confirmed, package: 'Day Stay',
        checkinDate: getDateRelative(1).toISOString(), fullName: 'Next Week User 6', email: 'nw6@test.com', phone: '111', adults: 10, children: 0, favoriteNatureThing: 'a', headcountTotal: 10, pricePerPerson: 5000, subtotal: 50000, depositDue: 25000,
    },
    { 
        id: 'n7-1', createdAt: getDateRelative(-10).toISOString(), status: BookingStatus.Confirmed, package: 'Day Stay',
        checkinDate: getDateRelative(2).toISOString(), fullName: 'Next Week User 1', email: 'nw1@test.com', phone: '111',
        adults: 10, children: 0, favoriteNatureThing: 'a', headcountTotal: 10, pricePerPerson: 5000, subtotal: 50000, depositDue: 25000,
    },
    {
        id: 'n7-2', createdAt: getDateRelative(-10).toISOString(), status: BookingStatus.Confirmed, package: 'Day Stay',
        checkinDate: getDateRelative(3).toISOString(), fullName: 'Next Week User 2', email: 'nw2@test.com', phone: '111', adults: 10, children: 0, favoriteNatureThing: 'a', headcountTotal: 10, pricePerPerson: 5000, subtotal: 50000, depositDue: 25000,
    },
    {
        id: 'n7-3', createdAt: getDateRelative(-10).toISOString(), status: BookingStatus.Confirmed, package: 'Day Stay',
        checkinDate: getDateRelative(4).toISOString(), fullName: 'Next Week User 3', email: 'nw3@test.com', phone: '111', adults: 10, children: 0, favoriteNatureThing: 'a', headcountTotal: 10, pricePerPerson: 5000, subtotal: 50000, depositDue: 25000,
    },
    {
        id: 'n7-4', createdAt: getDateRelative(-10).toISOString(), status: BookingStatus.Confirmed, package: 'Day Stay',
        checkinDate: getDateRelative(5).toISOString(), fullName: 'Next Week User 4', email: 'nw4@test.com', phone: '111', adults: 10, children: 0, favoriteNatureThing: 'a', headcountTotal: 10, pricePerPerson: 5000, subtotal: 50000, depositDue: 25000,
    },
    {
        id: 'n7-5', createdAt: getDateRelative(-10).toISOString(), status: BookingStatus.Confirmed, package: 'Day Stay',
        checkinDate: getDateRelative(6).toISOString(), fullName: 'Next Week User 5', email: 'nw5@test.com', phone: '111', adults: 10, children: 0, favoriteNatureThing: 'a', headcountTotal: 10, pricePerPerson: 5000, subtotal: 50000, depositDue: 25000,
    },
    ...Array.from({ length: 5 }, (_, i) => ({ id: `h1-${i}`, createdAt: getDateRelative(-80 + i*2).toISOString(), status: BookingStatus.Confirmed, package: 'Day Stay', checkinDate: getDateRelative(-75).toISOString(), fullName: `H1 User ${i}`, email: `h1@test.com`, phone: '111', adults: 12, children: 0, favoriteNatureThing: 'a', headcountTotal: 12, pricePerPerson: 5000, subtotal: 60000, depositDue: 30000 })),
    ...Array.from({ length: 8 }, (_, i) => ({ id: `h2-${i}`, createdAt: getDateRelative(-50 + i*2).toISOString(), status: BookingStatus.Confirmed, package: 'Overnight Stay (Morning Start)', checkinDate: getDateRelative(-45).toISOString(), fullName: `H2 User ${i}`, email: `h2@test.com`, phone: '111', adults: 15, children: 0, favoriteNatureThing: 'b', headcountTotal: 15, pricePerPerson: 10000, subtotal: 150000, depositDue: 75000 })),
    ...Array.from({ length: 12 }, (_, i) => ({ id: `h3-${i}`, createdAt: getDateRelative(-20 + i).toISOString(), status: BookingStatus.Confirmed, package: 'Day Stay', checkinDate: getDateRelative(-15).toISOString(), fullName: `H3 User ${i}`, email: `h3@test.com`, phone: '111', adults: 10, children: 2, favoriteNatureThing: 'c', headcountTotal: 12, pricePerPerson: 5000, subtotal: 60000, depositDue: 30000 })),
];

const initialPackages: Package[] = [...PACKAGES];

const initialSettings = {
    contact_email: 'info@ckforestgardens.com',
    phone_number: '+592-123-4567',
    deposit_instructions: 'Please pay via MMG to CK-6335874\nor Bank Transfer to Republic Bank (Camp St.): 9000369260',
    physical_address: "90 Waiakabra, Soesdyke Linden Highway, East Bank Demerara, Guyana.",
    logo: null as string | null,
};

const initialGamificationProfiles: GamificationProfile[] = [
    { userEmail: 'user@example.com', points: 650, rankTier: RankTier.Ranger, badges: [Badge.FirstSteps, Badge.CampfireCrew] },
    { userEmail: 'charlie@factory.com', points: 2200, rankTier: RankTier.Guardian, badges: [Badge.FirstSteps, Badge.CampfireCrew, Badge.Trailblazer] },
    { userEmail: 'admin@example.com', points: 100, rankTier: RankTier.Explorer, badges: [] }
];


// --- MOCK DATABASE (STATE) ---

// Users are static in this mock and don't need persistence
const mockUsers: User[] = initialUsers; 
let mockPasswords = loadFromStorage(PASSWORDS_STORAGE_KEY, initialPasswords);
let mockBookings = loadFromStorage(BOOKINGS_STORAGE_KEY, initialBookings);
let mockPackages = loadFromStorage(PACKAGES_STORAGE_KEY, initialPackages);
let mockSettings = loadFromStorage(SETTINGS_STORAGE_KEY, initialSettings);
let mockGamificationProfiles = loadFromStorage(GAMIFICATION_STORAGE_KEY, initialGamificationProfiles);


// --- MOCK API SERVICE ---

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<User | null> => {
    await delay(500);
    const user = mockUsers.find(u => u.email === email);
    if (user && mockPasswords[email] === password) {
        return user;
    }
    return null;
  },

  changeAdminPassword: async (email: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    await delay(600);
    if (mockPasswords[email] && mockPasswords[email] === oldPassword) {
      mockPasswords[email] = newPassword;
      saveToStorage(PASSWORDS_STORAGE_KEY, mockPasswords);
      return { success: true, message: 'Password updated successfully.' };
    }
    return { success: false, message: 'Current password does not match.' };
  },

  // Bookings
  createBooking: async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> => {
    await delay(1000);
    
    const newBooking: Booking = {
      ...bookingData,
      id: uuidv4().substring(0, 8),
      createdAt: new Date().toISOString(),
      status: bookingData.receiptUrl ? BookingStatus.DepositPaid : BookingStatus.PendingDeposit,
      depositPaidAmount: bookingData.receiptUrl ? bookingData.depositDue : undefined,
    };

    mockBookings.push(newBooking);
    saveToStorage(BOOKINGS_STORAGE_KEY, mockBookings);
    
    console.log("Created booking:", newBooking);
    console.log("Simulating: Payment instruction email sent for booking:", newBooking.id);

    return newBooking;
  },

  updateBooking: async (bookingId: string, updateData: Partial<Booking>): Promise<Booking> => {
    await delay(500);
    const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) throw new Error('Booking not found');
    mockBookings[bookingIndex] = { ...mockBookings[bookingIndex], ...updateData };
    saveToStorage(BOOKINGS_STORAGE_KEY, mockBookings);
    return mockBookings[bookingIndex];
  },

  getBookings: async (user: User | null, role: 'User' | 'Management'): Promise<Booking[]> => {
    await delay(800);
    if (role === 'Management') {
      return [...mockBookings].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (user) {
        return mockBookings.filter(b => b.email === user.email)
            .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [];
  },

  getConfirmedBookings: async (): Promise<Booking[]> => {
    await delay(600);
    return mockBookings.filter(b => b.status === BookingStatus.Confirmed);
  },

  getDashboardStats: async () => {
    await delay(700);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const confirmedBookings = mockBookings.filter(b => b.status === BookingStatus.Confirmed);

    const upcomingBookings = confirmedBookings
        .filter(b => new Date(b.checkinDate) >= today)
        .sort((a, b) => new Date(a.checkinDate).getTime() - new Date(b.checkinDate).getTime());
    const nextBooking = upcomingBookings.length > 0 ? upcomingBookings[0] : null;

    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7);
    const bookingsLastWeek = mockBookings.filter(b => {
        const checkinDate = new Date(b.checkinDate);
        return checkinDate >= lastWeekStart && checkinDate < today;
    }).length;

    const nextWeekEnd = new Date(today);
    nextWeekEnd.setDate(today.getDate() + 6);
    const bookingsNext7Days = confirmedBookings.filter(b => {
        const checkinDate = new Date(b.checkinDate);
        return checkinDate >= today && checkinDate <= nextWeekEnd;
    }).length;
    
    return {
      nextBookingDate: nextBooking ? nextBooking.checkinDate : null,
      bookingsLastWeek,
      bookingsNext7Days,
    };
  },

  getBookingTrends: async (): Promise<{ month: string, bookings: number }[]> => {
    await delay(1000);
    const trends: { [key: string]: number } = {};
    const today = new Date();
    
    for (let i = 2; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = d.toLocaleString('default', { month: 'long', year: 'numeric' });
        trends[monthKey] = 0;
    }

    mockBookings.forEach(booking => {
        const bookingDate = new Date(booking.createdAt);
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        threeMonthsAgo.setHours(0,0,0,0);
        
        if (bookingDate >= threeMonthsAgo) {
            const monthKey = bookingDate.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (trends[monthKey] !== undefined) {
                trends[monthKey]++;
            }
        }
    });

    return Object.entries(trends).map(([month, bookings]) => ({
        month: month.split(' ')[0],
        bookings,
    }));
  },

  getPackages: async (): Promise<Package[]> => {
    await delay(300);
    return mockPackages;
  },
  
  createPackage: async (packageData: Omit<Package, 'id'>): Promise<Package> => {
    await delay(500);
    const newPackage: Package = {
        ...packageData,
        id: uuidv4().substring(0, 12).replace(/-/g, ''),
    };
    mockPackages.push(newPackage);
    saveToStorage(PACKAGES_STORAGE_KEY, mockPackages);
    return newPackage;
  },

  updatePackage: async (packageId: string, updateData: Partial<Package>): Promise<Package> => {
    await delay(500);
    const packageIndex = mockPackages.findIndex(p => p.id === packageId);
    if (packageIndex === -1) throw new Error('Package not found');
    mockPackages[packageIndex] = { ...mockPackages[packageIndex], ...updateData };
    saveToStorage(PACKAGES_STORAGE_KEY, mockPackages);
    return mockPackages[packageIndex];
  },

  deletePackage: async (packageId: string): Promise<boolean> => {
    await delay(500);
    const initialLength = mockPackages.length;
    mockPackages = mockPackages.filter(p => p.id !== packageId);
    const wasDeleted = mockPackages.length < initialLength;
    if (wasDeleted) {
        saveToStorage(PACKAGES_STORAGE_KEY, mockPackages);
    }
    return wasDeleted;
  },

  getSettings: async (): Promise<any> => {
    await delay(200);
    return mockSettings;
  },

  updateSettings: async (newSettings: any): Promise<any> => {
    await delay(500);
    mockSettings = { ...mockSettings, ...newSettings };
    saveToStorage(SETTINGS_STORAGE_KEY, mockSettings);
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
