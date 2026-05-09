import React from "react";
import CountUp from "./CountUp";
import { Film, Trophy, MapPin, Heart } from "lucide-react";

const items = [
  {
    icon: Film,
    label: "Journeys Shared",
    key: "stories_published",
    testid: "stat-stories",
    bg: "linear-gradient(135deg, #FF9933 0%, #FFB347 100%)",
    glow: "rgba(255, 153, 51, 0.5)"
  },
  {
    icon: Trophy,
    label: "Fields Covered",
    key: "fields_covered",
    testid: "stat-fields",
    bg: "linear-gradient(135deg, #FFD700 0%, #FFB347 100%)",
    glow: "rgba(255, 215, 0, 0.5)"
  },
  {
    icon: MapPin,
    label: "States Reached",
    key: "states_reached",
    testid: "stat-states",
    bg: "linear-gradient(135deg, #138808 0%, #2DB81E 100%)",
    glow: "rgba(19, 136, 8, 0.45)"
  },
  {
    icon: Heart,
    label: "Kids Inspired",
    key: "kids_inspired",
    testid: "stat-kids",
    bg: "linear-gradient(135deg, #E91E63 0%, #FF6B9D 100%)",
    glow: "rgba(233, 30, 99, 0.45)"
  },
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
        <div className="text-center mb-14">
          <p className="font-cormorant italic text-saffron text-lg mb-2">Our Impact</p>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight">By The Numbers</h2>
          <div className="flex items-center justify-center mt-4 gap-3 text-gold">
            <span className="h-px w-10 bg-gold/60"/>
            <span className="gold-star text-xl">★</span>
            <span className="h-px w-10 bg-gold/60"/>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
          {items.map(({ icon: Icon, label, key, testid, bg, glow }, i) => (
            <div
              key={key}
              data-testid={testid}
              className="hover-lift rounded-2xl p-8 text-center fade-up text-white relative overflow-hidden"
              style={{
                background: bg,
                boxShadow: `0 18px 38px -12px ${glow}, 0 0 0 1px rgba(255,255,255,0.15) inset`,
                animationDelay: `${i * 90}ms`
              }}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/15 blur-2xl"/>
              <div className="relative">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5 bg-white/25 backdrop-blur-sm border border-white/30 shadow-lg">
                  <Icon className="text-white" size={28}/>
                </div>
                <div className="text-6xl mb-3 text-white" style={{ textShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
                  <CountUp end={stats[key] || 0} testid={`${testid}-num`}/>
                </div>
                <p className="font-mont text-xs uppercase tracking-[0.2em] text-white/95 font-semibold">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
