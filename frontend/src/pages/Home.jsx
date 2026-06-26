import React from 'react';
import { Sparkles, ArrowRight, Settings, CheckSquare, Image, Star, Quote } from 'lucide-react';

export default function Home({ navigate }) {
  const steps = [
    {
      num: '01',
      title: 'Define Your Spaces',
      desc: 'Select your target room type, name your preferred color combination, and state your investment limit in Indian Rupees (₹).',
      icon: <Settings className="w-5 h-5 text-brand-gold" />
    },
    {
      num: '02',
      title: 'AI Concept Curation',
      desc: 'Our design algorithm parses wood textures, complementary pieces, and market prices to craft a custom room set.',
      icon: <Sparkles className="w-5 h-5 text-brand-gold" />
    },
    {
      num: '03',
      title: 'Review Your Mood Board',
      desc: 'Inspect furniture models, download printable reports, rate quality, and share directly via WhatsApp with family.',
      icon: <Image className="w-5 h-5 text-brand-gold" />
    }
  ];

  const testimonials = [
    {
      name: 'Papakanti Ravi',
      role: 'Customer • 7 months ago',
      text: 'Nice Bed and Cot I Received to gift it to my Sister and Brother in Law and Sri Manoj Garu and Mohan Garu explained about the Cot and Bed was really helpful to me to take it for better reasonable price. Thanks to SVS Furniture and Manoj Garu!',
      rating: 5
    },
    {
      name: 'Mohan Krishna',
      role: 'Local Guide • 8 months ago',
      text: 'Absolutely excellent and super comfortable! The price is unbeatable, just as expected. We\'re really happy with the product quality. We\'re highly satisfied with the quality and truly appreciate Manoj\'s support throughout.',
      rating: 5
    },
    {
      name: 'Ramesh Babu Padarthi',
      role: 'Customer • a month ago',
      text: 'Nice quality with low price. Perfectly took measurements and made according to area. Material, colour, design selection helped by them. Thanks for helping.',
      rating: 5
    }
  ];

  return (
    <div className="space-y-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            
            {/* Tagline pill */}
            <div className="inline-flex items-center gap-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-4.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase animate-fade-in shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>SVS AI Interior Suggestion Tool</span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-brand-dark dark:text-brand-cream tracking-tight leading-[1.1] animate-slide-up">
              Curate Your Dream Space with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-brand-goldLight dark:from-brand-goldLight dark:to-brand-sand">Sri Venkata Sai Furniture Works</span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-brand-dark/70 dark:text-brand-cream/70 max-w-2xl mx-auto leading-relaxed font-sans">
              Instantly generate complete, complementary furniture sets (sofas, cots, and beds) customized to your Room Type, Color Preference, and Budget from Sri Venkata Sai Furniture Works.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in">
              <button
                onClick={() => navigate('tool')}
                className="w-full sm:w-auto bg-brand-gold hover:bg-brand-goldLight text-brand-cream font-medium px-8 py-4 rounded-xl shadow-lg hover:shadow-brand-gold/20 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
              >
                <span>Get Your AI Furniture Suggestion</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => navigate('history')}
                className="w-full sm:w-auto border border-brand-dark/20 hover:border-brand-dark dark:border-brand-cream/20 dark:hover:border-brand-cream font-medium px-8 py-4 rounded-xl flex items-center justify-center gap-2.5 transition-colors"
              >
                <span>View Past Suggestions</span>
              </button>
            </div>
            
          </div>
        </div>
      </section>

      {/* 2. EXPLAINER: HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-dark/5 dark:bg-brand-cream/5 rounded-3xl p-8 md:p-12 border border-brand-dark/5 dark:border-brand-cream/5">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-serif text-3xl font-bold text-brand-dark dark:text-brand-cream">
              How AI Interior Curation Works
            </h2>
            <p className="text-sm text-brand-textMuted max-w-md mx-auto">
              Three simple steps to curate your dream space using Sri Venkata Sai Furniture Works technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div 
                key={step.num} 
                className="bg-white dark:bg-brand-cardDark p-8 rounded-2xl border border-brand-dark/5 dark:border-brand-cream/5 hover:border-brand-gold/30 dark:hover:border-brand-gold/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-brand-gold/10 p-3.5 rounded-xl group-hover:bg-brand-gold group-hover:text-brand-cream transition-colors">
                    {step.icon}
                  </div>
                  <span className="text-3xl font-serif font-black text-brand-gold/20 tracking-wider">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-brand-dark dark:text-brand-cream mb-3">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-brand-dark/70 dark:text-brand-cream/70">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="font-serif text-3xl font-bold text-brand-dark dark:text-brand-cream">
              Word from Our Customers
            </h2>
            <p className="text-sm text-brand-textMuted max-w-md mx-auto">
              Real opinions from home decorators who trusted SVS Furniture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-brand-cardDark p-8 rounded-2xl border border-brand-dark/5 dark:border-brand-cream/5 shadow-sm flex flex-col justify-between relative group"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-brand-gold/10 group-hover:text-brand-gold/20 transition-colors" />
                
                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < t.rating ? 'fill-brand-gold text-brand-gold' : 'text-brand-dark/20'
                        }`} 
                      />
                    ))}
                  </div>

                  <p className="text-sm italic leading-relaxed text-brand-dark/80 dark:text-brand-cream/80">
                    "{t.text}"
                  </p>
                </div>

                <div className="border-t border-brand-dark/15 dark:border-brand-cream/15 pt-6 mt-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-brand-dark dark:text-brand-cream">
                      {t.name}
                    </h4>
                    <span className="text-xs text-brand-textMuted">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
}
