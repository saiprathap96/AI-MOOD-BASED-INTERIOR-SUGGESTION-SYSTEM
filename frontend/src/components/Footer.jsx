import React from 'react';
import { Armchair, Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Footer({ navigate }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-brand-cream/80 border-t border-brand-gold/20 pt-16 pb-8 no-print transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3 text-brand-cream">
              <div className="bg-brand-gold text-brand-cream p-2 rounded-lg">
                <Armchair className="w-5 h-5" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight">
                Sri Venkata Sai Furniture Works
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Crafting premium wooden furniture designs with legacy craftsmanship for over three decades. Creating living spaces that reflect comfort, durability, and luxury.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-brand-cream text-base font-semibold tracking-wider uppercase border-b border-brand-gold/20 pb-2">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => navigate('home')} 
                  className="hover:text-brand-gold transition-colors text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('tool')} 
                  className="hover:text-brand-gold transition-colors text-left"
                >
                  AI Suggestion Tool
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('history')} 
                  className="hover:text-brand-gold transition-colors text-left"
                >
                  Suggestion History
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('admin')} 
                  className="hover:text-brand-gold transition-colors text-left"
                >
                  Analysis
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-serif text-brand-cream text-base font-semibold tracking-wider uppercase border-b border-brand-gold/20 pb-2">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span>
                  34&amp;41, Diamond Colony, Plot No 33, near harihara keshetram ayyappa temple, Defence Colony, Rajiv Shetti Nagar, Kharmanghat, Hyderabad, Telangana 500079
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-gold shrink-0" />
                <a href="tel:+919296806111" className="hover:text-brand-gold transition-colors">
                  092968 06111
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold shrink-0" />
                <a href="mailto:info@svsfurnitures.com" className="hover:text-brand-gold transition-colors">
                  info@svsfurnitures.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 pt-2 border-t border-brand-cream/10">
                <Clock className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-semibold block text-brand-cream">Store Hours:</span>
                  <div className="text-[11px] text-brand-cream/70 leading-normal">
                    <p>Mon, Wed - Sat: 10:00 AM – 8:00 PM</p>
                    <p>Tuesday: 10:00 AM – 7:00 PM</p>
                    <p>Sunday: 9:00 AM – 3:00 PM</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-brand-cream/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>
            &copy; {currentYear} Sri Venkata Sai Furniture Works. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-brand-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-gold transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
