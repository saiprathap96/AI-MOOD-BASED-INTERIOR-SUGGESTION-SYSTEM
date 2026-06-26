import React, { useState } from 'react';
import { Sun, Moon, Menu, X, Armchair } from 'lucide-react';

export default function Header({ currentPage, navigate, darkMode, toggleDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'tool', label: 'AI Suggestion Tool' },
    { id: 'history', label: 'History' },
    { id: 'admin', label: 'Analysis' }
  ];

  const handleNavClick = (pageId) => {
    navigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-brand-cream/90 dark:bg-brand-bgDark/90 backdrop-blur-md border-b border-brand-dark/10 dark:border-brand-cream/10 no-print transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="bg-brand-gold text-brand-cream p-2 rounded-lg transition-transform duration-300 group-hover:scale-105">
              <Armchair className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-brand-dark dark:text-brand-cream group-hover:text-brand-gold transition-colors">
                Sri Venkata Sai
              </span>
              <span className="block text-[10px] tracking-widest uppercase text-brand-gold font-medium">
                Furniture Works
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`font-sans text-sm font-medium tracking-wide transition-colors relative py-2 ${
                  currentPage === link.id
                    ? 'text-brand-gold'
                    : 'text-brand-dark/70 hover:text-brand-dark dark:text-brand-cream/70 dark:hover:text-brand-cream'
                }`}
              >
                {link.label}
                {currentPage === link.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold rounded-full" />
                )}
              </button>
            ))}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full hover:bg-brand-dark/5 dark:hover:bg-brand-cream/5 text-brand-gold transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Right Bar */}
          <div className="flex items-center gap-4 md:hidden">
            {/* Dark Mode Toggle (Mobile) */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-brand-dark/5 dark:hover:bg-brand-cream/5 text-brand-gold transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile Burger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-brand-dark dark:text-brand-cream hover:bg-brand-dark/5 dark:hover:bg-brand-cream/5 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-cream dark:bg-brand-bgDark border-b border-brand-dark/10 dark:border-brand-cream/10 animate-fade-in">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 shadow-inner">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium tracking-wide transition-colors ${
                  currentPage === link.id
                    ? 'bg-brand-gold/10 text-brand-gold font-semibold'
                    : 'text-brand-dark/70 hover:bg-brand-dark/5 hover:text-brand-dark dark:text-brand-cream/70 dark:hover:bg-brand-cream/5 dark:hover:text-brand-cream'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
