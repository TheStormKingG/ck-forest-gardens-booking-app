import React, { useState, useEffect, useRef } from 'react';
import { Booking } from '../types';
import { useSelectedPackage } from '../contexts/SelectedPackageContext';
import { api } from '../services/apiMock';
import { DEPOSIT_RATE } from '../constants';
import Calendar from '../components/Calendar';
import CustomSelect from '../components/CustomSelect';

/* NEW: use Supabase-backed services */
import { uploadReceipt, createBooking } from '../src/services/public';
import { getGeneralSettings } from '../src/services/settings';

interface BookingFormPageProps {
  navigate: (page: string) => void;
}

const PaymentInstructionsModal: React.FC<{ booking: Booking, onClose: () => void, instructions: string }> = ({ booking, onClose, instructions }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 m-4 max-w-lg w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-green-800 mb-4">Booking Submitted!</h2>
        <p className="text-gray-700 mb-4">
          Hi <span className="font-semibold">{booking.fullName}</span>, thanks for booking the <span className="font-semibold">{booking.package}</span> package for <span className="font-semibold">{new Date(booking.checkinDate).toDateString()}</span>.
        </p>
        <div className="bg-green-100 p-4 rounded-lg mb-4">
          <p className="text-lg">Deposit Due: <span className="font-bold text-green-700">GYD {booking.depositDue.toLocaleString()}</span></p>
          <p className="mt-2 text-sm whitespace-pre-wrap">{instructions}</p>
          <p className="mt-1 text-sm">Reference: <span className="font-semibold">BK-{booking.id}</span></p>
        </div>
        <p className="text-sm text-gray-600">You will receive an email with these instructions. Once paid, a team member will confirm your booking.</p>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const natureThingOptions = [
  "Deep peace, emotional escape, stress reduction",
  "Health, clean air, physical rejuvenation",
  "Grounding, spirituality, nature immersion",
  "Creating lasting memories, perfect for social sharing",
  "Activities, excitement, exploration",
  "Luxury, staff quality, attention to detail",
  "Tranquility, peace, noise-free environment",
  "Family bonding, creating memories together, kid-friendly adventure",
  "Exclusivity, seclusion, an uninterrupted nature view",
];

const BookingFormPage: React.FC<BookingFormPageProps> = ({ navigate }) => {
  const { selectedPackage, setSelectedPackage } = useSelectedPackage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    adults: '0',
    children: '0',
    favoriteNatureThing: natureThingOptions[0],
  });
  const [addons, setAddons] = useState({
    meals: false,
    transportation: false,
    tourGuide: false,
  });
  const [checkinDate, setCheckinDate] = useState<Date | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [depositDue, setDepositDue] = useState(0);
  const [headcountTotal, setHeadcountTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFormLocked, setIsFormLocked] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const [paymentInstructions, setPaymentInstructions] = useState('');

  const isFormValidForUpload = formData.fullName.trim() !== '' && formData.email.trim() !== '' && formData.phone.trim() !== '' && checkinDate !== null;

  const playMessageSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.2);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Try Supabase first
        const settings = await getGeneralSettings();
        console.log('Settings loaded from Supabase:', settings);
        if (settings?.deposit_instructions) {
          console.log('Payment instructions loaded from Supabase:', settings.deposit_instructions);
          setPaymentInstructions(settings.deposit_instructions);
          return;
        } else {
          console.log('No deposit_instructions found in Supabase settings');
        }
      } catch (error) {
        console.error('Failed to load settings from Supabase:', error);
      }
      
      // Fallback to mock API
      try {
        const settings = await api.getSettings();
        console.log('Settings loaded from mock API:', settings);
        if (settings?.deposit_instructions) {
          console.log('Payment instructions loaded from mock API:', settings.deposit_instructions);
          setPaymentInstructions(settings.deposit_instructions);
        } else {
          console.log('No deposit_instructions found in mock API settings');
        }
      } catch (error) {
        console.error('Failed to load settings from mock API:', error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    let typingTimer: ReturnType<typeof setTimeout> | undefined;
    if (isFormValidForUpload && !receiptFile) {
      setShowChatbot(true);
      setIsTyping(true);
      typingTimer = setTimeout(() => {
        setIsTyping(false);
        playMessageSound();
      }, 1200);
    } else {
      setShowChatbot(false);
    }
    return () => { if (typingTimer) clearTimeout(typingTimer); };
  }, [isFormValidForUpload, receiptFile]);

  useEffect(() => { setIsFormLocked(!!receiptFile); }, [receiptFile]);

  useEffect(() => {
    if (!selectedPackage) {
      navigate('home');
    } else {
      const initialAdults = selectedPackage.minHeadcount.toString();
      setFormData(prev => ({ ...prev, adults: initialAdults }));
    }
  }, [selectedPackage, navigate]);

  useEffect(() => {
    const adults = parseInt(formData.adults, 10) || 0;
    const children = parseInt(formData.children, 10) || 0;
    const total = adults + children;
    setHeadcountTotal(total);

    if (selectedPackage) {
      const newSubtotal = adults * selectedPackage.pricePerPerson;
      setSubtotal(newSubtotal);
      setDepositDue(newSubtotal * DEPOSIT_RATE);
    }
  }, [formData.adults, formData.children, selectedPackage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAddons(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => { fileInputRef.current?.click(); };

  const handleChangeReceipt = () => {
    setReceiptFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* UPDATED: submit now uploads to Storage and inserts via Supabase */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) { setError("A package must be selected."); return; }
    if (!checkinDate) { setError("Please select a check-in date."); return; }
    if (!receiptFile) { setError("Please upload a deposit receipt to complete the booking."); return; }

    const adults = parseInt(formData.adults, 10) || 0;
    if (adults < selectedPackage.minHeadcount) {
      setError(`A minimum of ${selectedPackage.minHeadcount} adults are required for this package.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // 1) Upload receipt to Supabase Storage -> get public URL
      const receiptUrl = await uploadReceipt(receiptFile);

      // 2) Insert booking row via Supabase
      const payload = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        check_in_date: checkinDate.toISOString().slice(0, 10), // yyyy-mm-dd
        adults: parseInt(formData.adults, 10),
        children: parseInt(formData.children, 10),
        package_id: selectedPackage.id, // Keep for reference if needed
        package_name: selectedPackage.name, // Store the package name
        options: {
          meals: addons.meals,
          transportation: addons.transportation,
          tourGuide: addons.tourGuide
        },
        nature_preference: formData.favoriteNatureThing,
        status: 'pending_deposit',
        receipt_url: receiptUrl,
        price_per_person: selectedPackage.pricePerPerson,
        subtotal: subtotal,
        deposit_due: depositDue
      };

      // Expect createBooking to return the inserted row (id at minimum)
      const inserted = await createBooking(payload) as unknown as { id: string };

      // 3) Build the local Booking object for your modal (UI)
      const uiBooking: Booking = {
        id: inserted?.id ?? 'temp',
        package: selectedPackage.name,
        checkinDate: checkinDate.toISOString(),
        fullName: formData.fullName,
        createdAt: new Date().toISOString(), // Placeholder; ideally from backend
        status: 'pending_deposit' as Booking['status'], // Type assertion to satisfy BookingStatus
        email: formData.email,
        phone: formData.phone,
        adults: payload.adults,
        children: payload.children,
        favoriteNatureThing: formData.favoriteNatureThing,
        wantsMeals: addons.meals,
        wantsTransportation: addons.transportation,
        wantsTourGuide: addons.tourGuide,
        headcountTotal,
        pricePerPerson: selectedPackage.pricePerPerson,
        subtotal,
        depositDue,
        receiptUrl
      };

      setSubmittedBooking(uiBooking);
    } catch (err) {
      console.error(err);
      setError("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const svgPattern = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><defs><g id="icon-leaf" stroke="#14532d" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10 20C18 16 20 10 20 2" /><path d="M10 20C2 16 0 10 0 2" /></g><g id="icon-flower" stroke="#14532d" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="2" /><path d="M10 8V2" /><path d="M10 12v6" /><path d="M8 10H2" /><path d="M12 10h6" /><path d="m15.6 15.6-4.2-4.2" /><path d="m4.4 4.4 4.2 4.2" /><path d="m15.6 4.4-4.2 4.2" /><path d="m4.4 15.6 4.2-4.2" /></g><g id="icon-mushroom" stroke="#14532d" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10a8 8 0 1 1 16 0Z" /><path d="M10 10v8" /></g><g id="icon-pine" stroke="#14532d" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m10 2 8 8-4-2-4 4-4-4-4 2 8-8Z"/><path d="m6 10 4 4 4-4"/><path d="M10 14v6"/></g></defs><g opacity="0.1"><use href="#icon-leaf" x="30" y="50" transform="rotate(20 30 50) scale(0.8)" /><use href="#icon-flower" x="150" y="80" transform="scale(0.7)" /><use href="#icon-pine" x="250" y="40" transform="scale(1.1)" /><use href="#icon-mushroom" x="80" y="150" transform="rotate(-15 80 150) scale(0.9)" /><use href="#icon-leaf" x="320" y="120" transform="rotate(120 320 120) scale(1.2)" /><use href="#icon-pine" x="40" y="250" transform="scale(0.9)" /><use href="#icon-flower" x="220" y="210" transform="rotate(45 220 210) scale(1.0)" /><use href="#icon-mushroom" x="350" y="280" transform="scale(0.8)" /><use href="#icon-leaf" x="120" y="330" transform="rotate(-40 120 330)" /><use href="#icon-pine" x="180" y="350" transform="scale(0.7)" /><use href="#icon-flower" x="280" y="180" transform="scale(0.6)" /><use href="#icon-mushroom" x="20" y="10" transform="rotate(10 20 10) scale(1.1)" /><use href="#icon-leaf" x="200" y="10" transform="rotate(180 200 10)" /><use href="#icon-pine" x="360" y="20" transform="scale(0.8)" /><use href="#icon-flower" x="380" y="200" transform="scale(0.9)" /><use href="#icon-leaf" x="10" y="380" transform="rotate(90 10 380)" /><use href="#icon-mushroom" x="290" y="390" transform="rotate(-30 290 390) scale(1.0)" /></g></svg>`;
  const encodedSvg = encodeURIComponent(svgPattern.replace(/\s+/g, ' '));
  const backgroundStyle = { backgroundImage: `url("data:image/svg+xml,${encodedSvg}")` };

  if (!selectedPackage) return null;

  const adults = parseInt(formData.adults, 10) || 0;
  const isHeadcountMet = adults >= selectedPackage.minHeadcount;

  const baseInputStyles = "mt-1 block w-full rounded-md border-transparent shadow-sm focus:border-green-300 focus:ring-green-300 transition-colors duration-200 p-2 text-sm disabled:bg-gray-200 disabled:cursor-not-allowed";
  const lightGreenInputStyles = `bg-green-100 placeholder-gray-500 text-gray-800 ${baseInputStyles}`;
  const darkGreenInputStyles = `bg-green-800 text-white ${baseInputStyles}`;

  const getAddonMessage = () => {
    const { meals, transportation, tourGuide } = addons;
    const selectedCount = Number(meals) + Number(transportation) + Number(tourGuide);
    if (selectedCount === 0) return "";
    if (selectedCount === 1) {
      if (meals) return "A meal surcharge will be added to your final bill. Our team will contact you to coordinate dietary preferences.";
      if (transportation) return "Transportation fees will be added to your final bill. Our team will contact you to arrange pickup and drop-off.";
      if (tourGuide) return "A tour guide fee will be added to your final bill. Our team will be in touch to coordinate arrangements.";
    }
    const activeAddons: string[] = [];
    if (meals) activeAddons.push('meals');
    if (transportation) activeAddons.push('transportation');
    if (tourGuide) activeAddons.push('a tour guide');
    const addonsString = activeAddons.length === 2
      ? activeAddons.join(' and ')
      : activeAddons.slice(0, -1).join(', ') + ', and ' + activeAddons.slice(-1);
    return `Surcharges for ${addonsString} will be added to your final bill. Our team will be in touch to coordinate all arrangements.`;
  };
  const showAddonInfo = addons.meals || addons.transportation || addons.tourGuide;

  return (
    <>
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg" style={backgroundStyle}>
        <h1 className="text-3xl font-bold text-green-900 mb-2">Book Your Stay</h1>
        <h2 className="text-xl font-semibold text-green-700 mb-8">{selectedPackage.name}</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            {/* Left */}
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required className={lightGreenInputStyles} placeholder="Enter your full name" disabled={isFormLocked} autoComplete="name" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={lightGreenInputStyles} placeholder="youremail@example.com" disabled={isFormLocked} autoComplete="email" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className={lightGreenInputStyles} placeholder="e.g., 5926xxxxxxx" disabled={isFormLocked} autoComplete="tel" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <label htmlFor="adults" className="block text-sm font-medium text-gray-700">Number of Adults</label>
                  <input type="number" id="adults" name="adults" value={formData.adults} min="0" onChange={handleChange} required className={darkGreenInputStyles} disabled={isFormLocked} />
                </div>
                <div>
                  <label htmlFor="children" className="block text-sm font-medium text-gray-700">Kids &lt;12y</label>
                  <input type="number" id="children" name="children" value={formData.children} min="0" onChange={handleChange} required className={darkGreenInputStyles} disabled={isFormLocked} />
                </div>
              </div>
              <div>
                <label htmlFor="favoriteNatureThing" className="block text-sm font-medium text-gray-700">Favorite thing about nature spots?</label>
                <CustomSelect
                  id="favoriteNatureThing"
                  options={natureThingOptions}
                  value={formData.favoriteNatureThing}
                  onChange={(value) => setFormData(prev => ({ ...prev, favoriteNatureThing: value }))}
                  className="mt-1"
                  disabled={isFormLocked}
                />
              </div>
            </div>

            {/* Right */}
            <div>
              <Calendar selectedDate={checkinDate} onDateSelect={setCheckinDate} disabled={isFormLocked} />
              <div className="text-center mt-4 p-2 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">Selected Check-in Date</p>
                {checkinDate ? (
                  <p className="font-bold text-lg text-green-800">
                    {checkinDate.toLocaleDateString('en-GB')}
                  </p>
                ) : (
                  <p className="font-semibold text-lg text-gray-500">
                    Please select a date
                  </p>
                )}
              </div>
            </div>
          </div>

          <hr className="mt-8 border-t border-dotted border-gray-400" />

          {/* Addons & Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 items-stretch">
            <div className="flex items-start">
              <div className="space-y-2 bg-green-100 p-3 rounded-md h-full w-full">
                <div className="flex items-center">
                  <input id="meals" name="meals" type="checkbox" checked={addons.meals} onChange={handleAddonChange} disabled={isFormLocked} className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-50" />
                  <label htmlFor="meals" className="ml-3 block text-sm text-gray-900">Meals Included</label>
                </div>
                <div className="flex items-center">
                  <input id="transportation" name="transportation" type="checkbox" checked={addons.transportation} onChange={handleAddonChange} disabled={isFormLocked} className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-50" />
                  <label htmlFor="transportation" className="ml-3 block text-sm text-gray-900">Transportation</label>
                </div>
                <div className="flex items-center">
                  <input id="tourGuide" name="tourGuide" type="checkbox" checked={addons.tourGuide} onChange={handleAddonChange} disabled={isFormLocked} className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-50" />
                  <label htmlFor="tourGuide" className="ml-3 block text-sm text-gray-900">Tour Guide</label>
                </div>
              </div>
            </div>

            <div className={`bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-lg flex items-start transition-opacity duration-300 ${showAddonInfo ? 'opacity-100' : 'opacity-0'}`} role="alert">
              <div className="flex-shrink-0 mr-3 pt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Additional Information</p>
                <p className="text-sm">{getAddonMessage()}</p>
              </div>
            </div>
          </div>

          <hr className="mt-8 border-t border-dotted border-gray-400" />

          {/* Summary */}
          <div className={`mt-8 bg-green-50 p-6 rounded-lg ${isFormValidForUpload ? 'border border-gray-300' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Booking Summary</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Total Guests:</span> <span className="font-medium">{headcountTotal}</span></div>
              <div className={`flex justify-between ${isHeadcountMet ? '' : 'text-red-600'}`}>
                <span>Minimum Adults ({selectedPackage.minHeadcount}):</span>
                <span className="font-medium">{isHeadcountMet ? 'Met' : 'Not Met'}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold"><span>Subtotal:</span> <span>GYD {subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between font-semibold text-green-800"><span>Deposit Due:</span> <span>GYD {depositDue.toLocaleString()}</span></div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf"
          />

          <div className="flex justify-between items-center mt-6">
            <div className="min-h-[80px] flex items-center">
              {receiptFile ? (
                <div className="flex items-center space-x-3">
                  <svg className="w-10 h-10 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 19.5V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V19.5L16.5 17.5L14 19.5L11.5 17.5L9 19.5L6.5 17.5L5 19.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 15V14M12 8V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm truncate max-w-xs">{receiptFile.name}</p>
                    <button type="button" onClick={handleChangeReceipt} className="text-sm text-green-600 hover:underline hover:text-green-800 focus:outline-none">
                      Change Receipt
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`transition-opacity duration-500 ${showChatbot ? 'opacity-100' : 'opacity-0'}`}>
                  {showChatbot && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-green-200 ring-2 ring-green-300">
                        <svg className="w-8 h-8 text-green-800" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <rect x="2" y="11" width="4" height="6" rx="1" />
                          <rect x="18" y="11" width="4" height="6" rx="1" />
                          <path d="M6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          <rect x="5" y="8" width="14" height="12" rx="2" />
                          <circle cx="9.5" cy="13.5" r="1.5" fill="#bbf7d0" />
                          <circle cx="14.5" cy="13.5" r="1.5" fill="#bbf7d0" />
                          <path d="M9 17C10.3333 18 13.6667 18 15 17" stroke="#bbf7d0" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                          <path d="M16 8V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                          <circle cx="16" cy="5" r="1" fill="currentColor" />
                        </svg>
                      </div>

                      <div className="relative bg-green-100 p-3 rounded-xl rounded-bl-none shadow-md min-w-[20rem]">
                        {isTyping ? (
                          <div className="flex space-x-1.5 p-1.5 items-center justify-center">
                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce"></span>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <p className="font-semibold whitespace-pre-wrap">{paymentInstructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button type="button" onClick={() => navigate('home')} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 text-sm">
                Cancel
              </button>

              {!receiptFile ? (
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={!isFormValidForUpload}
                  className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Upload Deposit Receipt
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isHeadcountMet || isSubmitting}
                  className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : 'Submit Booking'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {submittedBooking && (
        <PaymentInstructionsModal
          booking={submittedBooking}
          onClose={() => {
            setSubmittedBooking(null);
            setSelectedPackage(null); // Clear the selected package
            navigate('home');
          }}
          instructions={paymentInstructions}
        />
      )}
    </>
  );
};

export default BookingFormPage;
