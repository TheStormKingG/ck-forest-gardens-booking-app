export enum BookingStatus {
  PendingDeposit = "pending_deposit",
  DepositPaid = "deposit_paid",
  Confirmed = "confirmed",
  Cancelled = "cancelled",
}

export interface Package {
  id: string;
  name: string;
  description: string;
  pricePerPerson: number;
  minHeadcount: number;
  timing: string;
  imageUrl: string;
}

export interface Booking {
  id: string;
  createdAt: string;
  status: BookingStatus;
  package: string;
  checkinDate: string;
  fullName: string;
  email: string;
  phone: string;
  adults: number;
  children: number;
  favoriteNatureThing: string;
  headcountTotal: number;
  pricePerPerson: number;
  subtotal: number;
  depositDue: number;
  receiptUrl?: string;
  depositPaidAmount?: number;
  wantsMeals?: boolean;
  wantsTransportation?: boolean;
  wantsTourGuide?: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'User' | 'management';
}

export enum AdminPage {
  Dashboard = 'dashboard',
  Queue = 'queue',
  Calendar = 'calendar',
  Packages = 'packages',
  Settings = 'settings',
}

export enum RankTier {
    Explorer = 'Explorer',
    Ranger = 'Ranger',
    Guardian = 'Guardian',
    Legend = 'Legend'
}

export enum Badge {
    FirstSteps = 'First Steps', // First booking
    WeekendWarrior = 'Weekend Warrior', // 3+ bookings
    CampfireCrew = 'Campfire Crew', // Booked for 10+ people
    Trailblazer = 'Trailblazer', // Booked overnight stay
    HypeMaker = 'Hype Maker', // Referred a friend
    ViralSpark = 'Viral Spark', // 5+ referrals
    Amplifier = 'Amplifier' // 10+ referrals
}

export interface GamificationProfile {
    userEmail: string;
    points: number;
    rankTier: RankTier;
    badges: Badge[];
}

export interface AppSettings {
  logo: string | null;
  physical_address: string;
  contact_email: string;
  phone_number: string;
}