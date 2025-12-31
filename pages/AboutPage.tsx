import React from 'react';

interface AboutPageProps {
  navigate: (page: string) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Opening Value Statement */}
      <section className="text-center py-12 mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-900 mb-6">
          Locally Led Tours Built on Safety, Culture, and Real Connection
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          CK Forest Tours specializes in small-group eco-tourism and cultural experiences across Guyana. 
          We connect travelers with authentic local guides, prioritize safety in every aspect of our operations, 
          and ensure every tour supports local communities while respecting the natural environment.
        </p>
      </section>

      {/* Origin Story */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-green-900 mb-6">Our Story</h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 mb-4 leading-relaxed">
            CK Forest Tours was founded to solve a simple problem: travelers wanted authentic, safe, 
            and meaningful experiences in Guyana's natural landscapes, but finding trustworthy local 
            guides and well-organized tours was challenging.
          </p>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Our founders, with decades of combined experience in Guyana's tourism industry, saw an 
            opportunity to create tours that prioritize small groups, safety protocols, and genuine 
            cultural exchange. We partner exclusively with certified local guides who know these 
            landscapes intimately and are committed to sustainable tourism practices.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Today, we've hosted over 1,000 travelers and maintained a 100% safety record while 
            supporting local communities and conservation efforts across Guyana.
          </p>
        </div>
      </section>

      {/* Team & Expertise */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-green-900 mb-8">Our Team & Expertise</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-24 h-24 bg-green-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-green-600">CK</span>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Our Guides</h3>
            <p className="text-gray-700 mb-3">
              All our guides are certified, locally trained, and have extensive experience leading 
              tours in Guyana's diverse ecosystems. Each guide maintains current first-aid and 
              safety certifications.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ First-Aid Certified</li>
              <li>✓ Tourism Board Licensed</li>
              <li>✓ Fluent in English & Local Languages</li>
              <li>✓ 5+ Years Guiding Experience</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-24 h-24 bg-green-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-green-600">SA</span>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Support Team</h3>
            <p className="text-gray-700 mb-3">
              Our operations team ensures every booking is handled with care, every itinerary is 
              vetted for safety, and every guest receives the support they need before, during, 
              and after their tour.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ 24/7 Emergency Support</li>
              <li>✓ Pre-Trip Briefings</li>
              <li>✓ On-Trip Check-Ins</li>
              <li>✓ Post-Trip Follow-Up</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Operating Principles */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-green-900 mb-8">Our Operating Principles</h2>
        <div className="space-y-6">
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-2">Small Groups</h3>
            <p className="text-gray-700">
              We limit all tours to a maximum of 10 participants. This ensures personalized attention, 
              safer experiences, and minimal environmental impact. Small groups mean better guide-to-guest 
              ratios and more meaningful interactions.
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-2">Safety First</h3>
            <p className="text-gray-700">
              Every tour follows rigorous safety protocols. All guides are first-aid certified, 
              we maintain emergency communication systems, and we conduct thorough risk assessments 
              for all activities. Guest safety is non-negotiable.
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-2">Local Hosts</h3>
            <p className="text-gray-700">
              We work exclusively with local guides and communities. This ensures authentic experiences, 
              supports local economies, and provides travelers with genuine cultural insights that 
              come from deep local knowledge.
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-2">Leave No Trace</h3>
            <p className="text-gray-700">
              We follow Leave No Trace principles on every tour. We minimize our environmental impact, 
              respect wildlife habitats, and educate guests on sustainable travel practices. Protecting 
              Guyana's natural beauty is essential to our mission.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof & Impact */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-green-900 mb-8">Guest Experiences & Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-700 italic mb-4">
              "Our guide was incredible—knowledgeable, patient, and truly passionate about Guyana's 
              wildlife. The small group size meant we could ask questions and move at our own pace. 
              Best eco-tour I've ever taken."
            </p>
            <p className="text-sm font-semibold text-green-900">— Sarah M., United States</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-700 italic mb-4">
              "The safety protocols were thorough and clear from booking to completion. Felt completely 
              safe the entire time. The local guide's stories made the experience unforgettable."
            </p>
            <p className="text-sm font-semibold text-green-900">— James T., United Kingdom</p>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-900 mb-4">Community & Conservation Impact</h3>
          <p className="text-gray-700 mb-4">
            A portion of every booking supports local conservation initiatives and community development 
            projects in the regions where we operate. We partner with local organizations to ensure our 
            tours contribute positively to both environmental protection and local livelihoods.
          </p>
          <button
            onClick={() => navigate('packages')}
            className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            Explore Our Tours
          </button>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-white border-2 border-green-200 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-green-900 mb-4">Have Questions?</h2>
        <p className="text-gray-700 mb-6">
          We're here to help you plan the perfect tour experience in Guyana.
        </p>
        <button
          onClick={() => navigate('booking')}
          className="bg-green-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors mr-4"
        >
          Plan My Trip
        </button>
        <button
          onClick={() => navigate('policies')}
          className="bg-white text-green-600 border-2 border-green-600 font-semibold py-3 px-8 rounded-lg hover:bg-green-50 transition-colors"
        >
          View Policies
        </button>
      </section>
    </div>
  );
};

export default AboutPage;

