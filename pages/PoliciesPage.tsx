import React, { useState } from 'react';

interface PoliciesPageProps {
  navigate: (page: string) => void;
}

const PoliciesPage: React.FC<PoliciesPageProps> = ({ navigate }) => {
  const [activeSection, setActiveSection] = useState<string>('terms');
  
  // WhatsApp number: +592 633 5874 (formatted for wa.me links)
  const whatsAppNumber = '5926335874';
  const whatsAppLink = `https://wa.me/${whatsAppNumber}`;

  const policies = [
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'cancellation', label: 'Cancellation & Refunds' },
    { id: 'safety', label: 'Safety & Risk Disclosure' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-8 mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-900 mb-4">Policies</h1>
        <p className="text-lg text-gray-700">Clear policies for your peace of mind</p>
      </div>

      {/* Policy Navigation */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        {policies.map((policy) => (
          <button
            key={policy.id}
            onClick={() => {
              setActiveSection(policy.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeSection === policy.id
                ? 'bg-green-600 text-white'
                : 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50'
            }`}
          >
            {policy.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
        {/* Terms & Conditions */}
        {activeSection === 'terms' && (
          <div>
            <h2 className="text-3xl font-bold text-green-900 mb-6">Terms & Conditions</h2>
            <p className="text-sm text-gray-600 mb-8">Last updated: January 2025</p>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Booking Confirmation</h3>
              <p className="text-gray-700 mb-4">
                All bookings require a 50% deposit to confirm your reservation. Your booking is confirmed 
                once you receive email confirmation from CK Forest Tours. Full payment is due 7 days before 
                your tour date.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Payments & Inclusions</h3>
              <p className="text-gray-700 mb-4">
                Tour prices include: local guide services, basic safety equipment, and tour coordination. 
                Prices exclude: transportation to/from meeting point (unless specified), meals (unless 
                specified), personal travel insurance, and gratuities.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Guest Responsibilities</h3>
              <p className="text-gray-700 mb-4">
                Guests are responsible for: arriving at the meeting point on time, disclosing any health 
                conditions or physical limitations that may affect participation, following guide instructions 
                and safety protocols, respecting local customs and environment, and ensuring they have 
                appropriate travel insurance.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Company Responsibilities</h3>
              <p className="text-gray-700 mb-4">
                CK Forest Tours is responsible for: providing qualified guides, maintaining safety standards, 
                delivering the tour as described, providing clear communication before and during the tour, 
                and handling bookings and payments securely.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Force Majeure & Itinerary Changes</h3>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify or cancel tours due to circumstances beyond our control, 
                including severe weather, natural disasters, government restrictions, or safety concerns. 
                In such cases, we will offer alternative dates, a full refund, or a credit for future use.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Liability Limitations</h3>
              <p className="text-gray-700 mb-4">
                While we maintain comprehensive safety protocols, participation in outdoor activities carries 
                inherent risks. CK Forest Tours is not liable for personal injury, loss, or damage except 
                where caused by our negligence. Guests are required to have appropriate travel insurance 
                covering adventure activities.
              </p>
            </section>
          </div>
        )}

        {/* Privacy Policy */}
        {activeSection === 'privacy' && (
          <div>
            <h2 className="text-3xl font-bold text-green-900 mb-6">Privacy Policy</h2>
            <p className="text-sm text-gray-600 mb-8">Last updated: January 2025</p>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Data Collection</h3>
              <p className="text-gray-700 mb-4">
                We collect the following information: name, email address, phone number, booking details 
                (dates, group size, preferences), payment information (processed securely through third-party 
                payment processors), and communication history.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Why We Collect Data</h3>
              <p className="text-gray-700 mb-4">
                We use your data to: process bookings and payments, communicate about your tour, ensure 
                safety and emergency contact needs, improve our services, comply with legal obligations, 
                and send relevant updates (with your consent).
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Data Storage & Retention</h3>
              <p className="text-gray-700 mb-4">
                Your data is stored securely and retained for as long as necessary to fulfill bookings, 
                comply with legal obligations, and resolve disputes. Payment information is processed by 
                secure third-party providers and not stored on our servers.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Third-Party Tools</h3>
              <p className="text-gray-700 mb-4">
                We use third-party services for: payment processing (stripe, paypal), booking management, 
                email communications, and analytics. These services have their own privacy policies and 
                security measures in place.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Your Rights</h3>
              <p className="text-gray-700 mb-4">
                You have the right to: access your personal data, request corrections, request deletion 
                (subject to legal requirements), opt-out of marketing communications, and lodge complaints 
                with data protection authorities.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Contact</h3>
              <p className="text-gray-700 mb-4">
                For privacy inquiries or to exercise your rights, contact us at the email address provided 
                in our contact information. We will respond within 30 days.
              </p>
            </section>
          </div>
        )}

        {/* Cancellation & Refunds */}
        {activeSection === 'cancellation' && (
          <div>
            <h2 className="text-3xl font-bold text-green-900 mb-6">Cancellation & Refund Policy</h2>
            <p className="text-sm text-gray-600 mb-8">Last updated: January 2025</p>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Cancellation Timelines</h3>
              <div className="bg-green-50 rounded-lg p-6 space-y-4">
                <div>
                  <p className="font-semibold text-green-900 mb-2">30+ days before tour:</p>
                  <p className="text-gray-700">Full refund (minus 5% processing fee)</p>
                </div>
                <div>
                  <p className="font-semibold text-green-900 mb-2">14-29 days before tour:</p>
                  <p className="text-gray-700">75% refund or full credit for future use</p>
                </div>
                <div>
                  <p className="font-semibold text-green-900 mb-2">7-13 days before tour:</p>
                  <p className="text-gray-700">50% refund or full credit for future use</p>
                </div>
                <div>
                  <p className="font-semibold text-green-900 mb-2">Less than 7 days before tour:</p>
                  <p className="text-gray-700">No refund, but credit available for future use (valid 12 months)</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Refund Processing</h3>
              <p className="text-gray-700 mb-4">
                Refunds are processed to the original payment method within 5-10 business days. Processing 
                fees (if applicable) are non-refundable. Credit for future use is valid for 12 months from 
                the original tour date.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Rebooking Options</h3>
              <p className="text-gray-700 mb-4">
                Instead of cancellation, you can rebook to a different date (subject to availability) at no 
                additional charge if requested 7+ days before the original tour date. Rebooking within 7 
                days may incur a 10% rebooking fee.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Company Cancellations</h3>
              <p className="text-gray-700 mb-4">
                If CK Forest Tours cancels a tour (due to weather, safety, or other circumstances), you 
                will receive a full refund or the option to rebook at no additional cost. We will notify 
                you as soon as possible.
              </p>
            </section>
          </div>
        )}

        {/* Safety & Risk Disclosure */}
        {activeSection === 'safety' && (
          <div>
            <h2 className="text-3xl font-bold text-green-900 mb-6">Safety & Risk Disclosure</h2>
            <p className="text-sm text-gray-600 mb-8">Last updated: January 2025</p>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Our Safety Commitments</h3>
              <p className="text-gray-700 mb-4">
                CK Forest Tours maintains comprehensive safety protocols including: certified first-aid 
                trained guides, emergency communication systems, thorough risk assessments for all activities, 
                appropriate safety equipment, and clear safety briefings before each tour.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Inherent Activity Risks</h3>
              <p className="text-gray-700 mb-4">
                Participation in outdoor and adventure activities carries inherent risks including but not 
                limited to: exposure to wildlife, uneven terrain, weather conditions, water activities, 
                physical exertion, and remote locations with limited access to medical facilities. 
                Participants should be in good physical condition and prepared for the activity level.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Guest Disclosure Requirements</h3>
              <p className="text-gray-700 mb-4">
                Guests must disclose: any medical conditions, allergies, or physical limitations that may 
                affect participation; any medications being taken; emergency contact information; and any 
                concerns about activity level or safety. Failure to disclose relevant information may 
                compromise safety and void insurance coverage.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Right to Refuse Participation</h3>
              <p className="text-gray-700 mb-4">
                CK Forest Tours reserves the right to refuse participation to any guest if: safety concerns 
                are identified, the guest's condition poses a risk to themselves or others, the guest fails 
                to follow safety instructions, or the guest's behavior is disruptive or unsafe. In such cases, 
                no refund will be provided.
              </p>
            </section>

            <section className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
              <h3 className="text-xl font-bold text-yellow-900 mb-4">Travel Insurance Requirement</h3>
              <p className="text-gray-700">
                All guests are strongly advised to have comprehensive travel insurance covering adventure 
                activities, medical emergencies, trip cancellation, and evacuation. CK Forest Tours does 
                not provide travel insurance.
              </p>
            </section>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="mt-8 bg-green-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-green-900 mb-4">Questions About Our Policies?</h2>
        <p className="text-gray-700 mb-6">
          Contact us for clarification on any policy or to discuss special circumstances.
        </p>
        <a
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors inline-block"
        >
          Contact Us
        </a>
      </div>

      {/* Legal Footer */}
      <div className="mt-8 text-center text-sm text-gray-600">
        <p className="mb-2">Legal Entity: CK Forest Tours</p>
        <p className="mb-2">Jurisdiction: Guyana</p>
        <p>For legal inquiries, contact us through our official contact channels.</p>
      </div>
    </div>
  );
};

export default PoliciesPage;

