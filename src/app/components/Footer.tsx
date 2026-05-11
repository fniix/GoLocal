import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  FileText,
  Shield,
  BookOpen,
  Cookie,
  ChevronUp,
  Car,
  Truck,
  Users,
  ShoppingBag,
  LayoutDashboard,
  ListOrdered,
  TrendingUp,
  Star,
  Heart,
} from 'lucide-react';

interface FooterProps {
  role?: 'user' | 'driver';
  onNavigate?: (screen: string) => void;
}

type LegalDoc = {
  id: string;
  title: string;
  lastUpdated: string;
  icon: React.ReactNode;
  content: { heading: string; content: string }[];
};

const legalDocs: LegalDoc[] = [
  {
    id: 'terms',
    title: 'Terms of Service',
    lastUpdated: 'January 1, 2025',
    icon: <FileText className="w-5 h-5" />,
    content: [
      { heading: '1. Acceptance of Terms', content: 'By accessing and using GoLocal services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.' },
      { heading: '2. Service Description', content: 'GoLocal provides on-demand transportation services in Bahrain, connecting riders with drivers through our mobile application. Services include private driver, private bus, delivery (Mandoob), and ride-sharing (OnTheWay).' },
      { heading: '3. User Accounts', content: 'You must create an account to use our services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.' },
      { heading: '4. Payment Terms', content: 'Fares are calculated based on distance, time, service type, and demand. Payment can be made via credit/debit card, Benefit Pay, or cash. All transactions are subject to our payment processing terms.' },
      { heading: '5. Cancellation Policy', content: 'Rides can be cancelled before driver arrival. Cancellation fees may apply if cancelled after the driver has been dispatched or has arrived at the pickup location.' },
      { heading: '6. Liability', content: 'GoLocal acts as a technology platform connecting riders and drivers. We are not responsible for the actions of drivers or riders, though all drivers undergo background checks and vehicle inspections.' },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    lastUpdated: 'January 1, 2025',
    icon: <Shield className="w-5 h-5" />,
    content: [
      { heading: '1. Information We Collect', content: 'We collect information you provide directly (name, phone, email), usage data (ride history, locations), and device information (IP address, device type).' },
      { heading: '2. How We Use Your Information', content: 'Your information is used to provide services, process payments, improve user experience, send notifications, and ensure safety and security.' },
      { heading: '3. Data Sharing', content: 'We share necessary information with drivers to complete rides, payment processors for transactions, and law enforcement when legally required. We never sell your personal data.' },
      { heading: '4. Data Security', content: 'We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits.' },
      { heading: '5. Your Rights', content: 'You have the right to access, correct, delete, or export your personal data. You can manage these settings in your account or contact our support team.' },
      { heading: '6. Data Retention', content: 'We retain your data as long as your account is active and for a reasonable period thereafter as required by law or legitimate business purposes.' },
    ],
  },
  {
    id: 'community',
    title: 'Community Guidelines',
    lastUpdated: 'December 15, 2024',
    icon: <BookOpen className="w-5 h-5" />,
    content: [
      { heading: '1. Respectful Behavior', content: 'Treat all users with respect. Harassment, discrimination, or abusive behavior will not be tolerated and may result in account suspension.' },
      { heading: '2. Safety First', content: 'Always wear seatbelts, follow traffic laws, and report any safety concerns immediately through the app.' },
      { heading: '3. Vehicle Standards', content: 'Drivers must maintain clean, safe vehicles in good working condition. Riders should respect vehicle cleanliness.' },
      { heading: '4. Communication', content: 'Use the in-app messaging for ride coordination. Share contact information only when necessary for ride completion.' },
      { heading: '5. Rating System', content: 'Provide honest, constructive feedback through ratings and reviews. Ratings help maintain service quality for everyone.' },
    ],
  },
  {
    id: 'cookies',
    title: 'Cookie Policy',
    lastUpdated: 'November 20, 2024',
    icon: <Cookie className="w-5 h-5" />,
    content: [
      { heading: '1. What Are Cookies', content: 'Cookies are small text files stored on your device that help us provide and improve our services.' },
      { heading: '2. How We Use Cookies', content: 'We use cookies for authentication, preferences, analytics, and security. This helps us remember your settings and improve your experience.' },
      { heading: '3. Third-Party Cookies', content: 'We use third-party services like analytics providers that may set their own cookies. These are subject to their respective privacy policies.' },
      { heading: '4. Managing Cookies', content: 'You can control cookies through your device settings, though some features may not work properly if cookies are disabled.' },
    ],
  },
];

const userLinks = [
  { label: 'Private Driver', icon: <Car className="w-4 h-4" />, screen: 'service-selection' },
  { label: 'Private Bus', icon: <Truck className="w-4 h-4" />, screen: 'service-selection' },
  { label: 'OnTheWay', icon: <Users className="w-4 h-4" />, screen: 'service-selection' },
  { label: 'Mandoob', icon: <ShoppingBag className="w-4 h-4" />, screen: 'service-selection' },
  { label: 'Ride History', icon: <ListOrdered className="w-4 h-4" />, screen: 'ride-history' },
];

const driverLinks = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, screen: 'dashboard' },
  { label: 'My Offers', icon: <ListOrdered className="w-4 h-4" />, screen: 'my-offers' },
  { label: 'Earnings', icon: <TrendingUp className="w-4 h-4" />, screen: 'earnings' },
  { label: 'Reviews', icon: <Star className="w-4 h-4" />, screen: 'reviews' },
  { label: 'Incoming Requests', icon: <Heart className="w-4 h-4" />, screen: 'incoming-requests' },
];

const socialLinks = [
  { icon: <Twitter className="w-5 h-5" />, label: 'Twitter / X', href: 'https://twitter.com/GoLocalBH', color: 'hover:text-sky-400' },
  { icon: <Instagram className="w-5 h-5" />, label: 'Instagram', href: 'https://instagram.com/GoLocalBH', color: 'hover:text-pink-400' },
  { icon: <Facebook className="w-5 h-5" />, label: 'Facebook', href: 'https://facebook.com/GoLocalBH', color: 'hover:text-blue-400' },
  { icon: <Linkedin className="w-5 h-5" />, label: 'LinkedIn', href: 'https://linkedin.com/company/GoLocalBH', color: 'hover:text-blue-300' },
];

export function Footer({ role = 'user', onNavigate }: FooterProps) {
  const [openDoc, setOpenDoc] = useState<LegalDoc | null>(null);
  const [showFooter, setShowFooter] = useState(true);

  const links = role === 'driver' ? driverLinks : userLinks;

  if (openDoc) {
    return (
      <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 pt-6 pb-8 shadow-lg flex-shrink-0">
          <div className="flex items-center gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => setOpenDoc(null)}
              className="flex items-center text-white hover:bg-white/10 rounded-full p-2 transition-colors"
            >
              <ChevronUp className="w-6 h-6 rotate-90" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{openDoc.title}</h1>
              <p className="text-white/80 text-sm mt-1">Last updated: {openDoc.lastUpdated}</p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow-md">
            {openDoc.content.map((section, i) => (
              <div key={i} className={i > 0 ? 'mt-6 pt-6 border-t border-gray-100' : ''}>
                <h3 className="text-base font-bold text-gray-800 mb-2">{section.heading}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white mt-auto">
      {/* Collapse Toggle */}
      <button
        onClick={() => setShowFooter(p => !p)}
        className="w-full flex items-center justify-center py-2 text-white/40 hover:text-white/70 transition-colors group"
        aria-label="Toggle footer"
      >
        <div className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase">
          <ChevronUp
            className={`w-4 h-4 transition-transform duration-300 ${showFooter ? '' : 'rotate-180'}`}
          />
          <span>{showFooter ? 'Hide Footer' : 'Show Footer'}</span>
          <ChevronUp
            className={`w-4 h-4 transition-transform duration-300 ${showFooter ? '' : 'rotate-180'}`}
          />
        </div>
      </button>

      {showFooter && (
        <div className="px-6 pb-8 pt-4">
          <div className="max-w-2xl mx-auto">

            {/* Brand */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">GoLocal</h2>
                <p className="text-xs text-white/50">Your Local Ride, Anytime</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 mb-6" />

            {/* Quick Links */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
                {role === 'driver' ? '🚗 Driver Portal' : '🛺 Services'}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {links.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => onNavigate?.(link.screen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm transition-all text-left"
                  >
                    <span className="text-purple-400">{link.icon}</span>
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
                📄 Legal
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {legalDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setOpenDoc(doc)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm transition-all text-left"
                  >
                    <span className="text-blue-400">{doc.icon}</span>
                    {doc.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
                📞 Contact Us
              </h3>
              <div className="space-y-2">
                <a
                  href="tel:+97317000000"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm transition-all"
                >
                  <Phone className="w-4 h-4 text-green-400" />
                  <span>+973 1700-0000</span>
                </a>
                <a
                  href="mailto:support@golocal.bh"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm transition-all"
                >
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span>support@golocal.bh</span>
                </a>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 text-white/50 text-sm">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Manama, Kingdom of Bahrain 🇧🇭</span>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
                🌐 Follow Us
              </h3>
              <div className="flex gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/50 ${social.color} transition-all hover:scale-110 active:scale-95`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              <p className="text-white/30 text-xs mt-2">@GoLocalBH</p>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 mb-4" />

            {/* Copyright */}
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-white/30 text-xs">
                © {new Date().getFullYear()} GoLocal. All rights reserved.
              </p>
              <p className="text-white/20 text-xs">
                Made with <span className="text-red-400">♥</span> in Bahrain 🇧🇭
              </p>
            </div>

          </div>
        </div>
      )}
    </footer>
  );
}
