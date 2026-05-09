import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import StatsSection from "../components/StatsSection";
import {
  Sparkles, Star, Instagram, Youtube, Mic, ArrowRight,
  X, Flame, BookOpen, Coins, Clock, Users, HeartCrack, Target,
  Smartphone, Library, Trophy, Award, MessageCircle, Compass,
  Pencil, ListChecks, Rocket, ChevronRight, Mail, Facebook, Heart,
} from "lucide-react";

const SHARANYA_PHOTO = "https://customer-assets.emergentagent.com/job_stories-live-preview/artifacts/z3g7zkey_IMG_20260327_103427%20-%20Copy.jpg";

const FIELDS_GRID = [
  { icon: "📚", label: "Academics", value: "Academics", color: "from-blue-500 to-indigo-600" },
  { icon: "⚽", label: "Sports", value: "Sports", color: "from-green-500 to-emerald-600" },
  { icon: "🎨", label: "Arts", value: "Arts", color: "from-pink-500 to-rose-600" },
  { icon: "💻", label: "Technology", value: "Technology", color: "from-cyan-500 to-blue-600" },
  { icon: "🌍", label: "Social Impact", value: "Social Impact", color: "from-emerald-500 to-teal-600" },
  { icon: "🎭", label: "Entertainment", value: "Entertainment", color: "from-purple-500 to-fuchsia-600" },
  { icon: "🔬", label: "Science", value: "Science", color: "from-orange-500 to-red-600" },
  { icon: "✍️", label: "Literature", value: "Literature", color: "from-amber-500 to-yellow-600" },
];

const PAIN_POINTS = [
  "You don't know WHERE to start",
  "You don't know HOW they really did it",
  "You don't have the money for expensive coaching",
  "Your parents don't know anyone \"important\"",
  "You live in a small town, not a big city",
  "You think you're \"too late\" or \"not talented enough\"",
];

const WHAT_YOU_GET = [
  { icon: BookOpen, title: "The REAL Starting Point", body: "Not \"I was talented from birth\" but \"I started with YouTube videos. I practiced in my bedroom. I borrowed books from the library.\"\n\nYou'll know exactly where THEY started. So you know where YOU can start.", gradient: "from-blue-500 via-blue-600 to-indigo-700", glow: "rgba(59, 130, 246, 0.5)" },
  { icon: Coins, title: "The Money Truth", body: "How much did it REALLY cost?\n\nWe ask every achiever: What was FREE? What did you pay for? How did you convince your parents? What if you have ZERO budget?\n\nReal numbers. Real alternatives.", gradient: "from-emerald-500 via-green-600 to-teal-700", glow: "rgba(16, 185, 129, 0.5)" },
  { icon: Clock, title: "The Time Reality", body: "How many hours a day? For how long? What did you give up? How did you balance school?\n\nWe show you the REAL practice schedule. Not \"work hard\" — but \"here's exactly how I structured my day.\"", gradient: "from-orange-500 via-orange-600 to-red-600", glow: "rgba(249, 115, 22, 0.5)" },
  { icon: Users, title: "The Support System", body: "Who helped you? Which teacher believed in you? Which coach took you for free? Which friend pushed you forward? Which online community supported you?\n\nYou need people. But not \"important\" people. Just the RIGHT people.", gradient: "from-purple-500 via-purple-600 to-fuchsia-700", glow: "rgba(168, 85, 247, 0.5)" },
  { icon: HeartCrack, title: "The Real Struggles", body: "The failures. The rejections. The moments they cried. The times they wanted to quit.\n\nBecause if you only see the trophy, you'll think you're failing. When actually, you're right on track.", gradient: "from-pink-500 via-rose-600 to-red-600", glow: "rgba(244, 114, 182, 0.5)" },
  { icon: Target, title: "The Exact Next Step", body: "At the end of every story, we ask: \"What should someone watching this do TOMORROW if they want to start?\"\n\nNot someday. Not when you're ready. TOMORROW. That's your action step.", gradient: "from-cyan-500 via-teal-600 to-emerald-700", glow: "rgba(20, 184, 166, 0.5)" },
];

const STEPS = [
  { icon: "🌱", title: "THE SPARK", description: "What gave them the idea? When did they know \"this is it\"?", color: "from-yellow-400 to-amber-500", text: "text-yellow-900" },
  { icon: "😰", title: "THE STRUGGLE", description: "What almost stopped them? The moment they wanted to quit.", color: "from-orange-500 to-red-500", text: "text-orange-50" },
  { icon: "🤝", title: "THE SUPPORT", description: "Who believed in them when no one else did? What resources saved them?", color: "from-emerald-500 to-green-600", text: "text-white" },
  { icon: "📐", title: "THE STRATEGY", description: "What specific method worked? What did they try that DIDN'T work?", color: "from-blue-500 to-indigo-600", text: "text-white" },
  { icon: "🙏", title: "THE SACRIFICE", description: "What did they give up? How did they manage time?", color: "from-purple-500 to-fuchsia-600", text: "text-white" },
  { icon: "🌟", title: "THE SUCCESS", description: "Where are they now? What's next? What's their advice to YOU?", color: "from-pink-500 to-rose-600", text: "text-white" },
];

const RESOURCES = [
  { icon: Smartphone, title: "Apps & Websites", body: "FREE tools they used:\n• Coding: Khan Academy, Scratch\n• Chess: Chess.com, Lichess\n• Art: YouTube, Canva\n• Music: Simply Piano\n\nPlus paid apps worth your money — and free alternatives if not.", color: "bg-gradient-to-br from-blue-500 to-cyan-600" },
  { icon: Library, title: "Books & Courses", body: "What they read:\n• Beginner books available at libraries\n• Online courses (free & paid)\n• YouTube channels that helped\n\nWe link to everything. No wandering.", color: "bg-gradient-to-br from-amber-500 to-orange-600" },
  { icon: MessageCircle, title: "Communities & Coaches", body: "Where they found support:\n• Online forums\n• WhatsApp groups\n• Discord communities\n• Local clubs\n• Coaches who offer scholarships\n\nReal names. Real links.", color: "bg-gradient-to-br from-purple-500 to-pink-600" },
  { icon: Trophy, title: "Competitions & Opportunities", body: "How to get noticed:\n• Olympiads (free to enter)\n• Online competitions\n• Scholarship programs\n• NGOs that sponsor talent\n\nDeadlines. Application links. Requirements.", color: "bg-gradient-to-br from-green-500 to-emerald-600" },
];

const PILLARS = [
  { icon: Mic, title: "We Feature YOUR Story", body: "If you're doing something amazing, we want to share it. Free interview with Sharanya. Reach 50,000+ kids. Inspire others while building your portfolio.", cta: "Nominate Someone", to: "/nominate", external: false, color: "bg-gradient-to-br from-[#FF9933] to-amber-500" },
  { icon: Users, title: "We Connect You with Mentors", body: "Need advice? Stuck somewhere? We connect you with kids who've \"been there.\" Ask questions, find study partners, join field-specific groups.", cta: "Join Community", to: "mailto:hi@sharanyamena.com?subject=Join%20Community%20%E2%80%94%20Our%20Young%20India", external: true, color: "bg-gradient-to-br from-purple-500 to-fuchsia-600" },
  { icon: Sparkles, title: "We Share Opportunities", body: "Free competitions. Scholarship programs. Online courses with discounts. Talent hunts. Government schemes for young achievers. Follow us to never miss out.", cta: "Follow on Instagram", to: "#", external: true, color: "bg-gradient-to-br from-pink-500 to-rose-600" },
  { icon: MessageCircle, title: "We Answer Your Questions", body: "Got a specific question? \"How do I start with zero budget?\" \"Which coding language first?\" Ask us — we'll find an achiever to answer or create content for you.", cta: "Ask a Question", to: "mailto:hi@sharanyamena.com?subject=Question%20for%20Our%20Young%20India", external: true, color: "bg-gradient-to-br from-cyan-500 to-blue-600" },
];

const AUDIENCE = [
  { title: "I want to START something", body: "You have a dream but don't know where to begin. You think you need money or connections (you don't). You're scared to try. You want a step-by-step roadmap.", arrow: "Watch kids who started from ZERO.", gradient: "from-[#FF9933] to-orange-600" },
  { title: "I'm ALREADY doing something", body: "You're learning a skill. You're stuck at a level. You need motivation to keep going. You want to know \"what's next.\"", arrow: "See how others broke through plateaus.", gradient: "from-purple-500 to-fuchsia-600" },
  { title: "I want to HELP others", body: "You've achieved something. You want to inspire others. You have advice to share. You believe in this mission.", arrow: "Share YOUR story. Be the example.", gradient: "from-emerald-500 to-green-600" },
];

const HOW_TO_USE = [
  { icon: Compass, title: "Find a Story That Speaks to You", body: "Browse by field, age, or achievement. Look for kids from similar backgrounds. The right story finds you when you're paying attention.", gradient: "from-blue-500 to-cyan-500", glow: "rgba(59, 130, 246, 0.4)" },
  { icon: Pencil, title: "Watch with a Notebook", body: "Write down: resources they used, their practice schedule, the first step they took, and the failures they faced.", gradient: "from-amber-500 to-orange-500", glow: "rgba(245, 158, 11, 0.4)" },
  { icon: Rocket, title: "Take ONE Action Today", body: "Don't just watch and forget. Pick ONE thing from their advice. Do it TODAY. Not tomorrow. Today.", gradient: "from-pink-500 to-rose-500", glow: "rgba(236, 72, 153, 0.4)" },
  { icon: Sparkles, title: "Share What You Learned", body: "Tell a friend. Post on social media. Tag us @ouryoungindia. Then start your own journey.", gradient: "from-purple-500 to-fuchsia-500", glow: "rgba(168, 85, 247, 0.4)" },
  { icon: Heart, title: "Come Back for Motivation", body: "When you feel stuck. When you want to quit. When you need a reminder. Remember — they did it. You can too.", gradient: "from-emerald-500 to-green-600", glow: "rgba(16, 185, 129, 0.4)" },
];

export default function About() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/stats").then(r => setStats(r.data)).catch(() => {}); }, []);

  return (
    <div data-testid="about-page" className="bg-white">

      {/* ============== SECTION 1: HERO ============== */}
      <section data-testid="about-hero" className="relative py-24 sm:py-32 overflow-hidden text-white" style={{
        background: "linear-gradient(135deg, #FF6B35 0%, #FF9933 35%, #FF5E84 70%, #C92A88 100%)"
      }}>
        <div className="absolute inset-0 opacity-25 mix-blend-overlay" style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.5) 0%, transparent 50%)"
        }}/>
        <div className="sun-rays absolute inset-0 opacity-30"/>
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-yellow-300 opacity-30 blur-3xl"/>
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-pink-400 opacity-30 blur-3xl"/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl"/>
        <div className="relative max-w-5xl mx-auto px-5 lg:px-10 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="text-3xl">🇮🇳</span>
            <span className="font-mont text-sm uppercase tracking-[0.3em] text-white/90 font-semibold">About Our Young India</span>
          </div>
          <h1 className="font-cinzel text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05]" style={{ textShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
            Where Your Dreams<br className="hidden sm:block"/> Meet <span className="text-yellow-200" style={{ textShadow: "0 4px 24px rgba(0,0,0,0.5), 0 0 30px rgba(255, 235, 100, 0.6)" }}>Real Roadmaps</span>
          </h1>
          <p className="font-cormorant italic text-2xl sm:text-3xl text-white/95 max-w-3xl mx-auto" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
            "You don't need to be perfect. You just need to start."
          </p>
        </div>
      </section>

      {/* ============== SECTION 2: THE PROBLEM ============== */}
      <section data-testid="problem-section" className="py-24 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #1a0a00 0%, #2d1b00 50%, #4A0E0E 100%)"
      }}>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-25 blur-3xl bg-orange-500"/>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-25 blur-3xl bg-emerald-500"/>
        <div className="sun-rays absolute inset-0 opacity-20"/>
        <div className="relative max-w-5xl mx-auto px-5 lg:px-10">
          <div className="text-center mb-12">
            <p className="font-cormorant italic text-yellow-300 text-lg mb-2">The Truth Nobody Tells You</p>
            <h2 className="font-cinzel text-4xl sm:text-5xl font-bold text-white" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>Why This Platform Exists</h2>
          </div>

          {/* Opening narrative — light card on dark */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 sm:p-10 mb-10 text-center space-y-4">
            <p className="font-mont text-lg text-white/90 leading-relaxed">You see achievers on TV and social media.</p>
            <p className="font-mont text-lg text-white/90 leading-relaxed">They seem perfect. <span className="text-orange-300">Talented from birth.</span> <span className="text-yellow-300">Lucky.</span> <span className="text-pink-300">Rich.</span> <span className="text-cyan-300">Connected.</span></p>
            <p className="font-cormorant italic text-2xl sm:text-3xl text-white pt-3">And you think:</p>
            <p className="font-cormorant italic text-3xl sm:text-4xl text-orange-300 font-bold" style={{ textShadow: "0 2px 12px rgba(255,107,53,0.4)" }}>
              "That's not me. I could never do that."
            </p>
          </div>

          {/* Pain points — colorful gradient cards on dark */}
          <p className="font-cinzel text-2xl text-yellow-300 text-center mb-6 font-bold uppercase tracking-wider">The Doubts You Carry</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {PAIN_POINTS.map((p, i) => {
              const colors = [
                "from-red-500 to-rose-600",
                "from-orange-500 to-amber-600",
                "from-yellow-500 to-orange-500",
                "from-rose-500 to-pink-600",
                "from-amber-500 to-red-500",
                "from-pink-500 to-rose-600",
              ];
              return (
                <div key={i} className={`hover-lift bg-gradient-to-br ${colors[i]} rounded-2xl p-5 text-white shadow-xl flex items-start gap-3 fade-up`} style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="w-9 h-9 rounded-full bg-white/25 backdrop-blur-sm border border-white/40 flex items-center justify-center flex-shrink-0">
                    <X className="text-white" size={18}/>
                  </div>
                  <p className="font-mont text-sm leading-relaxed font-medium" style={{ textShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>{p}</p>
                </div>
              );
            })}
          </div>

          {/* Truth reveal */}
          <div className="text-center mb-10 space-y-3">
            <p className="font-cormorant italic text-2xl sm:text-3xl text-white">But here's the truth:</p>
            <p className="font-cinzel text-2xl sm:text-3xl text-yellow-300 font-bold leading-tight" style={{ textShadow: "0 2px 16px rgba(255,215,0,0.4)" }}>
              Every achiever you admire started<br className="hidden sm:block"/> EXACTLY where you are.
            </p>
            <p className="font-mont text-lg text-white/80">Confused. Scared. Without resources. Without connections.</p>
            <p className="font-mont text-lg text-white/80">They just found ONE thing:</p>
          </div>

          {/* Solution box — vibrant tricolor gradient */}
          <div className="rounded-3xl p-10 text-white text-center shadow-2xl relative overflow-hidden" style={{
            background: "linear-gradient(135deg, #FF9933 0%, #FFD700 50%, #138808 100%)"
          }}>
            <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-white/30 blur-2xl"/>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-yellow-200/40 blur-2xl"/>
            <div className="relative">
              <Flame className="mx-auto mb-4 text-white" size={56} style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}/>
              <p className="font-cinzel text-3xl sm:text-5xl font-bold mb-3" style={{ textShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
                A Clear Path
              </p>
              <p className="font-cormorant italic text-2xl sm:text-3xl text-white mb-4">From "I want to" → "I did it."</p>
              <p className="font-mont text-base sm:text-lg text-white/95 font-semibold">That's what Our Young India gives you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============== SECTION 3: MEET SHARANYA ============== */}
      <section data-testid="founder-section" className="py-24 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #FFF1DC 0%, #FFE5D6 50%, #FFD9E8 100%)"
      }}>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-25 blur-3xl bg-purple-300"/>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-25 blur-3xl bg-pink-300"/>
        <div className="relative max-w-6xl mx-auto px-5 lg:px-10 grid md:grid-cols-2 gap-12 items-start">
          <div className="relative md:sticky md:top-[100px]">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white" style={{ boxShadow: "0 0 0 8px rgba(255, 153, 51, 0.15), 0 30px 80px rgba(201, 42, 136, 0.3)" }}>
              <img src={SHARANYA_PHOTO} alt="Sharanya Mena, age 9" className="w-full h-full object-cover" style={{ objectPosition: "center 25%" }}/>
            </div>
            <div className="absolute -bottom-6 -right-6 text-white py-4 px-6 rounded-2xl shadow-2xl" style={{ background: "linear-gradient(135deg, #C92A88 0%, #FF5E84 100%)" }}>
              <p className="font-cinzel font-bold text-2xl">9 yrs</p>
              <p className="font-mont text-xs uppercase tracking-wider">Founder & Host</p>
            </div>
          </div>

          <div>
            <p className="font-cormorant italic text-pink-600 uppercase tracking-[0.3em] text-xs mb-3 flex items-center gap-2">
              <Mic size={14}/> Meet The Founder
            </p>
            <h2 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mb-6 leading-tight">
              Hi! I'm <span className="text-saffron">Sharanya</span>. I'm 9, and I started this because…
            </h2>

            <div className="space-y-4 font-mont text-gray-700 leading-[1.8]">
              <p className="font-cormorant italic text-2xl text-[#1a1a1a]">I love stories.</p>
              <p>Not fairy tales. Real stories.</p>
              <p>Stories about kids like me who wanted something so badly they figured out a way.</p>

              <div className="space-y-3 my-6">
                <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500 shadow-sm">
                  <p className="text-sm">→ The 12-year-old who learned coding on YouTube <em className="text-gray-500">(because her parents couldn't afford classes)</em></p>
                </div>
                <div className="bg-white rounded-xl p-4 border-l-4 border-emerald-500 shadow-sm">
                  <p className="text-sm">→ The 9-year-old chess champion who practiced with free apps <em className="text-gray-500">(because no coach would take her)</em></p>
                </div>
                <div className="bg-white rounded-xl p-4 border-l-4 border-purple-500 shadow-sm">
                  <p className="text-sm">→ The 14-year-old who started an NGO with ₹500 <em className="text-gray-500">(because waiting for permission felt too slow)</em></p>
                </div>
              </div>

              <p>I interview these kids. I ask them the questions <strong>YOU</strong> want to know:</p>

              <div className="space-y-2 my-4">
                {[
                  "Where did you get the idea?",
                  "How did you convince your parents?",
                  "What if you couldn't afford it?",
                  "What did you do when everyone said no?",
                  "How much time did it really take?",
                  "What FREE resources did you use?",
                ].map((q, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-pink-500">💭</span>
                    <span className="italic font-cormorant text-lg text-[#1a1a1a]">"{q}"</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-6 text-white shadow-lg my-6" style={{ background: "linear-gradient(135deg, #C92A88 0%, #FF5E84 50%, #FF9933 100%)" }}>
                <p className="font-cinzel font-bold text-xl mb-2">✨ Every kid has something special inside them.</p>
                <p className="font-mont text-sm text-white/95">You don't need money or connections. You need a roadmap from someone who walked it.</p>
              </div>

              <p className="font-cormorant italic text-xl text-[#1a1a1a]">That's why Our Young India exists.</p>
              <p className="font-bold text-saffron">To show you: If they did it, YOU can too.</p>

              <p className="font-cormorant italic text-3xl text-saffron mt-6" style={{ fontFamily: "'Cormorant Garamond', cursive" }}>~ Sharanya</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============== SECTION 4: WHAT YOU GET ============== */}
      <section data-testid="what-you-get" className="py-24 bg-festive relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl bg-saffron"/>
        <div className="relative max-w-7xl mx-auto px-5 lg:px-10">
          <div className="text-center mb-14">
            <p className="font-cormorant italic text-saffron text-lg mb-2">What You Actually Get</p>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#1a1a1a] mb-3">This Isn't Just Inspiration.</h2>
            <p className="font-cinzel text-2xl sm:text-4xl font-bold tricolor-text inline-block">It's Your Playbook.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHAT_YOU_GET.map((c, i) => (
              <div
                key={c.title}
                data-testid={`get-card-${i}`}
                className={`hover-lift bg-gradient-to-br ${c.gradient} rounded-3xl p-7 text-white shadow-xl fade-up relative overflow-hidden`}
                style={{ boxShadow: `0 20px 50px -15px ${c.glow}`, animationDelay: `${i * 80}ms` }}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/15 blur-2xl"/>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-5">
                    <c.icon size={26} className="text-white"/>
                  </div>
                  <h3 className="font-cinzel text-2xl font-bold mb-3" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>{c.title}</h3>
                  <p className="font-mont text-sm text-white/95 leading-relaxed whitespace-pre-line">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== SECTION 5: 6-STEP JOURNEY ============== */}
      <section data-testid="approach-section" className="py-24 bg-[#FFF8EC] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-15 blur-3xl bg-purple-400"/>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-15 blur-3xl bg-pink-400"/>
        <div className="relative max-w-7xl mx-auto px-5 lg:px-10">
          <div className="text-center mb-14">
            <p className="font-cormorant italic text-saffron text-lg mb-2">Our Approach</p>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#1a1a1a]">How We Tell Every Story</h2>
            <p className="font-mont text-gray-600 mt-3 max-w-2xl mx-auto">We don't just celebrate success. We decode the journey.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className={`hover-lift bg-gradient-to-br ${s.color} rounded-3xl p-7 ${s.text} shadow-xl fade-up relative overflow-hidden`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/20 blur-xl"/>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl">{s.icon}</span>
                    <span className="font-cinzel font-bold text-3xl opacity-50">0{i + 1}</span>
                  </div>
                  <h3 className="font-cinzel text-2xl font-bold mb-2" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>{s.title}</h3>
                  <p className="font-mont text-sm leading-relaxed opacity-95">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== SECTION 6: RESOURCES ============== */}
      <section data-testid="resources-section" className="py-24 bg-warm-cream relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-5 lg:px-10">
          <div className="text-center mb-14">
            <p className="font-cormorant italic text-saffron text-lg mb-2">Their Toolkit, Yours to Use</p>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#1a1a1a] mb-3">Resources We Share</h2>
            <p className="font-mont text-gray-600 max-w-2xl mx-auto">Every achiever shares the exact apps, books, websites, and communities they used.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            {RESOURCES.map((r, i) => (
              <div key={r.title} className={`hover-lift ${r.color} rounded-3xl p-7 text-white shadow-xl fade-up`} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-4">
                  <r.icon size={26} className="text-white"/>
                </div>
                <h3 className="font-cinzel text-2xl font-bold mb-3">{r.title}</h3>
                <p className="font-mont text-sm text-white/95 leading-relaxed whitespace-pre-line">{r.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/stories" data-testid="resources-cta" className="btn-saffron inline-flex items-center gap-2">
              <BookOpen size={18}/> Browse All Resources by Field <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </section>

      {/* ============== SECTION 7: 4 SUPPORT PILLARS ============== */}
      <section data-testid="pillars-section" className="py-24 bg-[#0D0D0D] text-white relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-25 blur-3xl bg-saffron"/>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-15 blur-3xl bg-india-green"/>
        <div className="relative max-w-7xl mx-auto px-5 lg:px-10">
          <div className="text-center mb-14">
            <p className="font-cormorant italic text-gold text-lg mb-2">Beyond Stories</p>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-bold">How We Support You</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {PILLARS.map((p, i) => (
              <div key={p.title} className={`hover-lift ${p.color} rounded-3xl p-7 text-white shadow-2xl fade-up`} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-4">
                  <p.icon size={28} className="text-white"/>
                </div>
                <h3 className="font-cinzel text-2xl font-bold mb-3">{p.title}</h3>
                <p className="font-mont text-sm text-white/95 leading-relaxed mb-5">{p.body}</p>
                {p.external ? (
                  <a href={p.to} className="inline-flex items-center gap-2 bg-white/95 text-[#1a1a1a] font-mont font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-white transition-all">
                    {p.cta} <ArrowRight size={14}/>
                  </a>
                ) : (
                  <Link to={p.to} className="inline-flex items-center gap-2 bg-white/95 text-[#1a1a1a] font-mont font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-white transition-all">
                    {p.cta} <ArrowRight size={14}/>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== SECTION 8: WHO IS THIS FOR ============== */}
      <section data-testid="audience-section" className="py-24 bg-saffron-glow relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-5 lg:px-10">
          <div className="text-center mb-14">
            <p className="font-cormorant italic text-saffron text-lg mb-2">Honest Question</p>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#1a1a1a]">Is This Platform for Me?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {AUDIENCE.map((a, i) => (
              <div key={a.title} className={`hover-lift bg-gradient-to-br ${a.gradient} rounded-3xl p-8 text-white shadow-xl fade-up`} style={{ animationDelay: `${i * 80}ms` }}>
                <p className="font-cormorant italic text-white/90 text-sm uppercase tracking-wider mb-3">If you say…</p>
                <h3 className="font-cinzel text-2xl font-bold mb-5" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>"{a.title}"</h3>
                <p className="font-mont text-sm text-white/95 leading-relaxed mb-5">{a.body}</p>
                <div className="border-t border-white/30 pt-4">
                  <p className="font-cinzel font-bold text-lg flex items-center gap-2">
                    <ChevronRight size={18}/> {a.arrow}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== SECTION 9: FIELDS WE COVER ============== */}
      <section data-testid="fields-section" className="py-24 bg-festive">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="text-center mb-14">
            <p className="font-cormorant italic text-saffron text-lg mb-2">Find Your Tribe</p>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#1a1a1a]">Fields We Cover</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FIELDS_GRID.map((f, i) => (
              <Link
                key={f.value}
                to={`/stories?field=${encodeURIComponent(f.value)}`}
                data-testid={`about-field-${f.value.toLowerCase().replace(/\s+/g, '-')}`}
                className={`hover-lift bg-gradient-to-br ${f.color} rounded-2xl p-6 text-white text-center shadow-lg fade-up relative overflow-hidden`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-white/15 blur-xl"/>
                <div className="relative">
                  <div className="text-4xl mb-2">{f.icon}</div>
                  <h3 className="font-cinzel font-bold text-lg">{f.label}</h3>
                  <p className="font-mont text-xs text-white/80 mt-1">Watch Now →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============== SECTION 10: HOW TO USE ============== */}
      <section data-testid="how-to-section" className="py-24 bg-[#FFF8EC]">
        <div className="max-w-4xl mx-auto px-5 lg:px-10">
          <div className="text-center mb-14">
            <p className="font-cormorant italic text-saffron text-lg mb-2">Make It Count</p>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#1a1a1a]">How to Use This Platform</h2>
          </div>
          <div className="space-y-5">
            {HOW_TO_USE.map((h, i) => (
              <div
                key={h.title}
                className={`hover-lift bg-gradient-to-br ${h.gradient} rounded-2xl p-6 text-white shadow-xl flex items-start gap-5 fade-up relative overflow-hidden`}
                style={{ animationDelay: `${i * 70}ms`, boxShadow: `0 18px 40px -12px ${h.glow}` }}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/15 blur-2xl"/>
                <div className="relative flex-shrink-0 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-sm border border-white/40 text-white flex items-center justify-center font-cinzel font-bold text-xl shadow-lg">
                    {i + 1}
                  </div>
                  {i < HOW_TO_USE.length - 1 && <div className="w-0.5 flex-1 mt-2 bg-white/30 min-h-[20px]"/>}
                </div>
                <div className="flex-1 pt-1 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-cinzel text-xl font-bold text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>{h.title}</h3>
                    <h.icon size={18} className="text-white/90"/>
                  </div>
                  <p className="font-mont text-sm text-white/95 leading-relaxed">{h.body}</p>
                </div>
              </div>
            ))}
            <div className="text-center pt-4">
              <p className="font-cormorant italic text-2xl text-saffron">Remember: They did it. You can too.</p>
            </div>
          </div>
        </div>
      </section>

      {/* By the numbers */}
      <StatsSection stats={stats} />

      {/* ============== SECTION 11: JOIN THE MOVEMENT ============== */}
      <section data-testid="movement-section" className="relative py-24 overflow-hidden text-white" style={{
        background: "linear-gradient(135deg, #FF6B35 0%, #FF9933 30%, #C92A88 70%, #4A0E78 100%)"
      }}>
        <div className="absolute inset-0 opacity-25 mix-blend-overlay" style={{
          background: "radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(255,215,0,0.4) 0%, transparent 50%)"
        }}/>
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-yellow-400 opacity-25 blur-3xl"/>
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-pink-500 opacity-25 blur-3xl"/>
        <div className="relative max-w-4xl mx-auto px-5 lg:px-10 text-center">
          <p className="font-cormorant italic text-yellow-200 text-lg mb-2">A Generation That Doesn't Wait</p>
          <h2 className="font-cinzel text-4xl sm:text-6xl font-bold mb-6 leading-tight" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            You're Not Alone in This Journey
          </h2>
          <div className="space-y-3 font-mont text-lg text-white/95 mb-10 max-w-2xl mx-auto">
            <p><strong className="text-yellow-300 text-2xl">50,000+</strong> kids across India are watching.</p>
            <p>Learning. Trying. Failing. Growing.</p>
            <p className="font-cormorant italic text-2xl text-white">You're part of something bigger.</p>
            <p>A generation that doesn't wait for permission. A generation that finds a way.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <a href="#" data-testid="movement-yt" className="hover-lift bg-white text-[#1a1a1a] rounded-full px-6 py-3 font-mont font-semibold inline-flex items-center gap-2 shadow-lg">
              <Youtube className="text-red-600" size={20}/> Subscribe
            </a>
            <a href="#" data-testid="movement-ig" className="hover-lift bg-white text-[#1a1a1a] rounded-full px-6 py-3 font-mont font-semibold inline-flex items-center gap-2 shadow-lg">
              <Instagram className="text-pink-600" size={20}/> Follow
            </a>
            <a href="#" data-testid="movement-fb" className="hover-lift bg-white text-[#1a1a1a] rounded-full px-6 py-3 font-mont font-semibold inline-flex items-center gap-2 shadow-lg">
              <Facebook className="text-blue-600" size={20}/> Like
            </a>
            <a href="#" data-testid="movement-wa" className="hover-lift bg-white text-[#1a1a1a] rounded-full px-6 py-3 font-mont font-semibold inline-flex items-center gap-2 shadow-lg">
              <MessageCircle className="text-green-600" size={20}/> Join Community
            </a>
          </div>

          <p className="font-cormorant italic text-xl text-white/90">Together, we're building a map.</p>
          <p className="font-cinzel text-2xl font-bold text-yellow-200 mt-2">Not for the "talented few." For EVERY kid who dares to try.</p>
        </div>
      </section>

      {/* ============== SECTION 12: READY TO START ============== */}
      <section data-testid="ready-section" className="py-24 bg-[#FFF8EC]">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="text-center mb-14">
            <p className="font-cormorant italic text-saffron text-lg mb-2">Your Move</p>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#1a1a1a]">What Will You Do Next?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/stories" data-testid="ready-watch" className="hover-lift bg-gradient-to-br from-orange-500 to-[#FF9933] rounded-3xl p-8 text-white shadow-xl group">
              <div className="text-5xl mb-4">👀</div>
              <h3 className="font-cinzel text-3xl font-bold mb-3">Watch Stories</h3>
              <p className="font-mont text-white/95 mb-6 leading-relaxed">Get inspired. Find your roadmap. See what's possible.</p>
              <span className="inline-flex items-center gap-2 bg-white text-saffron font-mont font-bold rounded-full px-5 py-2.5 group-hover:gap-3 transition-all">
                Watch Stories <ArrowRight size={16}/>
              </span>
            </Link>
            <Link to="/nominate" data-testid="ready-nominate" className="hover-lift bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 rounded-3xl p-8 text-white shadow-xl group">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="font-cinzel text-3xl font-bold mb-3">Share Your Story</h3>
              <p className="font-mont text-white/95 mb-6 leading-relaxed">Inspire others. Give back. Be the example.</p>
              <span className="inline-flex items-center gap-2 bg-white text-pink-600 font-mont font-bold rounded-full px-5 py-2.5 group-hover:gap-3 transition-all">
                Nominate Yourself <ArrowRight size={16}/>
              </span>
            </Link>
            <a href="mailto:hi@sharanyamena.com?subject=I%20need%20support%20%E2%80%94%20Our%20Young%20India&body=Hi%20Sharanya%2C%0A%0AI%27m%20reaching%20out%20because..." data-testid="ready-help" className="hover-lift bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-8 text-white shadow-xl group">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="font-cinzel text-3xl font-bold mb-3">Get Support</h3>
              <p className="font-mont text-white/95 mb-6 leading-relaxed">Ask questions. Find mentors. Join the community.</p>
              <span className="inline-flex items-center gap-2 bg-white text-emerald-600 font-mont font-bold rounded-full px-5 py-2.5 group-hover:gap-3 transition-all">
                Get Help <ArrowRight size={16}/>
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
