import { Package, RankTier } from './types';

export const PACKAGES: Package[] = [
  {
    id: 'day_stay',
    name: 'Day Stay',
    description: 'A full day of exploration and relaxation in nature.',
    pricePerPerson: 5000,
    minHeadcount: 10,
    timing: '9am–5pm',
    imageUrl: 'https://picsum.photos/seed/daystay/600/400',
  },
  {
    id: 'overnight_a',
    name: 'Overnight Stay (Evening Start)',
    description: 'Arrive in the evening and wake up to the sounds of the forest.',
    pricePerPerson: 10000,
    minHeadcount: 10,
    timing: '6pm–4pm next day',
    imageUrl: 'https://picsum.photos/seed/overnightA/600/400',
  },
  {
    id: 'overnight_b',
    name: 'Overnight Stay (Morning Start)',
    description: 'Enjoy a full day and a night under the stars.',
    pricePerPerson: 10000,
    minHeadcount: 10,
    timing: '9am–8am next day',
    imageUrl: 'https://picsum.photos/seed/overnightB/600/400',
  },
  {
    id: 'two_day_special',
    name: 'Book 2 Days + Free Night',
    description: 'An extended adventure with a complimentary night stay.',
    pricePerPerson: 10000, // Price is per day, so 2 days = 20000
    minHeadcount: 10,
    timing: 'Flexible 2-day booking',
    imageUrl: 'https://picsum.photos/seed/twoday/600/400',
  },
];

export const DEPOSIT_RATE = 0.5;

// Fix: Add missing GAMIFICATION_RULES constant
export const GAMIFICATION_RULES = {
  points: {
    perBooking: 100,
    perPersonInBooking: 10,
    perReferral: 50,
  },
  rankTiers: [
    { tier: RankTier.Explorer, minPoints: 0, reward: '10% off next booking' },
    { tier: RankTier.Ranger, minPoints: 500, reward: '15% off next booking' },
    { tier: RankTier.Guardian, minPoints: 1500, reward: 'Free day pass for 2' },
    { tier: RankTier.Legend, minPoints: 5000, reward: 'One free overnight stay' },
  ]
};