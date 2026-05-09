import React from "react";
import CountUp from "./CountUp";
import { Film, Trophy, MapPin, Heart } from "lucide-react";

const items = [
  { icon: Film, label: "Stories Published", key: "stories_published", testid: "stat-stories" },
  { icon: Trophy, label: "Fields Covered", key: "fields_covered", testid: "stat-fields" },
  { icon: MapPin, label: "States Reached", key: "states_reached", testid: "stat-states" },
  { icon: Heart, label: "Kids Inspired", key: "kids_inspired", testid: "stat-kids" },
];

export default function StatsSection({ stats, dark = false }) {
  if (!stats) return null;
  const wrapClass = dark ? "bg-[#0D0D0D] text-white" : "bg-warm-cream text-[#1a1a1a]";

  return (
    <section data-testid="stats-section" className={`py-20 ${wrapClass} relative overflow-hidden`}>
      {!dark && <>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl bg-saffron"/>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl bg-india-green"/>
      </>}
      <div className="max-w-6xl mx-auto px-5 lg:px-10 relative">
        <div className="text-center mb-12">
          <p className="font-cormorant italic text-gold text-lg mb-2">Our Impact</p>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold tracking-tight">By The Numbers</h2>
          <div className="flex items-center justify-center mt-4 gap-3 text-gold">
            <span className="h-px w-10 bg-gold/40"/>
            <span className="gold-star">★</span>
            <span className="h-px w-10 bg-gold/40"/>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map(({ icon: Icon, label, key, testid }, i) => (
            <div
              key={key}
              data-testid={testid}
              className={`hover-lift rounded-2xl p-8 text-center fade-up ${dark ? "card-dark" : "bg-white shadow-lg border border-saffron/10"}`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-5 bg-gradient-to-br from-saffron to-gold">
                <Icon className="text-white" size={26}/>
              </div>
              <div className="text-5xl text-saffron mb-2">
                <CountUp end={stats[key] || 0} testid={`${testid}-num`}/>
              </div>
              <p className={`font-mont text-sm uppercase tracking-wider ${dark ? "text-white/70" : "text-gray-600"}`}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
