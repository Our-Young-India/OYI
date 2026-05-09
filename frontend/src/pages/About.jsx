import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import StatsSection from "../components/StatsSection";
import { Sparkles, Star, Instagram, Youtube, Mic } from "lucide-react";

const SHARANYA_PHOTO = "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=900&q=80";

const STEPS = [
  { icon: "🌱", title: "SPARK", description: "What ignited their passion? The moment it all began." },
  { icon: "😓", title: "STRUGGLE", description: "The challenges, doubts, failures. What almost stopped them?" },
  { icon: "🤝", title: "SUPPORT", description: "Who believed in them? Family, teachers, mentors, friends." },
  { icon: "📐", title: "STRATEGY", description: "Their exact methods, resources, practice routines, tools." },
  { icon: "🙏", title: "SACRIFICE", description: "What did they give up? What did their family sacrifice?" },
  { icon: "🌟", title: "SUCCESS", description: "Where they are today, and what's next." },
];

export default function About() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/stats").then(r => setStats(r.data)).catch(() => {}); }, []);

  return (
    <div data-testid="about-page" className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#4A0E0E] via-[#1a0a00] to-[#2d1b00] text-white py-24 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-30 blur-3xl bg-saffron"/>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl bg-gold"/>
        <div className="absolute inset-0 opacity-15" style={{
          background: "linear-gradient(90deg, #FF9933 0%, #FF9933 33%, #FFFFFF 50%, #138808 67%, #138808 100%)"
        }}/>
        <div className="sun-rays absolute inset-0 opacity-30" aria-hidden/>
        <div className="relative max-w-4xl mx-auto px-5 lg:px-10 text-center">
          <p className="font-cormorant italic text-gold text-lg mb-3">Our Story</p>
          <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold mb-5">About Our Young India</h1>
          <p className="font-cormorant italic text-2xl text-white/85">Where passion meets purpose. Where young India inspires young India.</p>
        </div>
      </section>

      {/* Mission */}
      <section data-testid="mission-section" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-5 lg:px-10 text-center">
          <p className="font-cormorant italic text-saffron text-lg mb-2">Why We Exist</p>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-8">Our Mission</h2>
          <div className="space-y-6 font-mont text-gray-700 text-lg leading-[1.8]">
            <p>
              Our Young India was born from a simple belief: every child deserves to see themselves in someone else's success.
              When an 8-year-old sees a 12-year-old coder, or a 10-year-old athlete hears from a 14-year-old champion, something
              magical happens — they believe it's possible for them too.
            </p>
            <p>
              This platform is not just about interviews. It's about creating a movement where children inspire children, where
              real stories replace motivational quotes, and where every young dreamer finds the spark they need to start their
              own incredible journey.
            </p>
            <p className="font-cormorant italic text-2xl text-[#1a1a1a]">
              We celebrate passion, we honor struggle, and we share the truth — that behind every achievement is a real kid
              who started exactly where you are today.
            </p>
          </div>
        </div>
      </section>

      {/* Sharanya */}
      <section data-testid="founder-section" className="py-24 bg-festive relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-25 blur-3xl bg-saffron"/>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-15 blur-3xl bg-india-green"/>
        <div className="max-w-6xl mx-auto px-5 lg:px-10 grid md:grid-cols-2 gap-12 items-start relative">
          <div className="relative md:sticky md:top-[100px]">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden border-4 border-saffron/20 shadow-2xl">
              <img src={SHARANYA_PHOTO} alt="Sharanya Mena" className="w-full h-full object-cover"/>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-saffron text-white py-4 px-6 rounded-2xl shadow-2xl">
              <p className="font-cinzel font-bold text-2xl">9 years</p>
              <p className="font-mont text-xs uppercase tracking-wider">Founder & Host</p>
            </div>
          </div>
          <div>
            <p className="font-cormorant italic text-saffron uppercase tracking-[0.3em] text-xs mb-3 flex items-center gap-2">
              <Mic size={14}/> The 9-Year-Old Founder
            </p>
            <h2 className="font-cinzel text-4xl sm:text-5xl font-bold text-[#1a1a1a] mb-6">Sharanya Mena</h2>
            <div className="space-y-4 font-mont text-gray-700 leading-[1.8]">
              <p>
                Hi! I'm Sharanya Mena, and I'm 9 years old. I started Our Young India because I wanted to show kids like me
                that incredible things are happening all around us — we just need to look.
              </p>
              <p>
                When I was 7, I heard about a 12-year-old girl who coded her own app. I thought, "If she can do it, why can't
                I try something too?" That's when I realized — every kid needs to hear stories like that.
              </p>
              <p>
                So I decided to find these young achievers and talk to them. Not like a news reporter. Just like one kid talking
                to another kid. I ask them the questions I really want to know: How did you start? Was it hard? Who helped you?
                What do I need to do?
              </p>
              <p>
                Every interview I do, I learn something new. And I hope every kid watching learns something too.
              </p>
              <p className="font-cormorant italic text-xl text-[#1a1a1a]">
                My favorite part? When a kid messages me saying, "I saw your video and I started learning chess today!"
                That's when I know this platform is working.
              </p>
              <p>
                This is just the beginning. I want Our Young India to reach every corner of India, so no child ever thinks
                they're too young to do something amazing.
              </p>
            </div>
            <p className="font-cormorant italic text-3xl text-saffron mt-8" style={{ fontFamily: "'Cormorant Garamond', cursive" }}>~ Sharanya</p>
          </div>
        </div>
      </section>

      {/* Six step approach */}
      <section data-testid="approach-section" className="py-20 bg-[#0D0D0D] text-white">
        <div className="max-w-6xl mx-auto px-5 lg:px-10">
          <div className="text-center mb-14">
            <p className="font-cormorant italic text-gold text-lg mb-1">Our Approach</p>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-bold">How We Tell Every Story</h2>
            <div className="flex items-center justify-center mt-5 gap-3 text-gold">
              <span className="h-px w-10 bg-gold/60"/>
              <span className="gold-star text-xl">★</span>
              <span className="h-px w-10 bg-gold/60"/>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="card-dark p-7 hover-lift fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="text-4xl mb-4" aria-hidden>{s.icon}</div>
                <p className="font-mont text-xs uppercase tracking-[0.3em] text-saffron mb-1">Step {i+1}</p>
                <h3 className="font-cinzel text-2xl font-bold mb-3">{s.title}</h3>
                <p className="font-mont text-white/70 text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StatsSection stats={stats} />

      {/* Join the movement */}
      <section data-testid="join-section" className="py-24 bg-warm-cream">
        <div className="max-w-6xl mx-auto px-5 lg:px-10 text-center">
          <p className="font-cormorant italic text-saffron text-lg mb-2">Get Involved</p>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#1a1a1a] mb-12">Be Part of Something Bigger</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/stories" data-testid="join-watch" className="hover-lift bg-white rounded-2xl p-8 border border-black/5 shadow-sm group">
              <div className="text-5xl mb-4">🎥</div>
              <h3 className="font-cinzel text-2xl font-bold mb-2">Watch Stories</h3>
              <p className="font-mont text-gray-600 text-sm mb-5">Discover incredible journeys</p>
              <span className="inline-flex items-center gap-2 text-saffron font-mont font-semibold group-hover:gap-3 transition-all">
                Explore <Sparkles size={16}/>
              </span>
            </Link>
            <Link to="/nominate" data-testid="join-nominate" className="hover-lift bg-saffron text-white rounded-2xl p-8 shadow-md group">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="font-cinzel text-2xl font-bold mb-2">Nominate Someone</h3>
              <p className="font-mont text-white/85 text-sm mb-5">Know a young achiever? Share their story</p>
              <span className="inline-flex items-center gap-2 font-mont font-semibold group-hover:gap-3 transition-all">
                Nominate <Star size={16}/>
              </span>
            </Link>
            <a href="#" data-testid="join-follow" className="hover-lift bg-[#0D0D0D] text-white rounded-2xl p-8 group">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="font-cinzel text-2xl font-bold mb-2">Follow Us</h3>
              <p className="font-mont text-white/70 text-sm mb-5">Stay updated on new stories</p>
              <span className="inline-flex items-center gap-3">
                <Instagram size={20} className="text-saffron"/>
                <Youtube size={20} className="text-saffron"/>
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
