import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import StoryCard from "../components/StoryCard";
import StatsSection from "../components/StatsSection";
import { ChevronLeft, ChevronRight, Sparkles, Star, Mic, ArrowRight, Instagram, Youtube } from "lucide-react";

const HERO_IMAGE = "https://customer-assets.emergentagent.com/job_stories-live-preview/artifacts/lbmx61u2_file_000000002f207207ad65e9d8d87e293b.png";
const LOGO_FULL = "https://customer-assets.emergentagent.com/job_7e34814e-aac7-419b-9cb6-23c99755e0df/artifacts/b3mlbrqx_file_000000002f207207ad65e9d8d87e293b.png";

const SHARANYA_PHOTO = "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=900&q=80";

const categories = [
  { icon: "📚", label: "Academics", value: "Academics", img: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600&q=80" },
  { icon: "⚽", label: "Sports", value: "Sports", img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80" },
  { icon: "🎨", label: "Arts", value: "Arts", img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80" },
  { icon: "💻", label: "Technology", value: "Technology", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80" },
  { icon: "🌍", label: "Social Impact", value: "Social Impact", img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80" },
  { icon: "🎭", label: "Entertainment", value: "Entertainment", img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80" },
  { icon: "🔬", label: "Science", value: "Science", img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80" },
  { icon: "✍️", label: "Literature", value: "Literature", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80" },
];

export default function Home() {
  const [stories, setStories] = useState([]);
  const [stats, setStats] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [carouselIdx, setCarouselIdx] = useState(0);

  useEffect(() => {
    api.get("/stories?limit=8").then(r => setStories(r.data.items || [])).catch(() => {});
    api.get("/stats").then(r => setStats(r.data)).catch(() => {});
    api.get("/categories").then(r => setCategoryCounts(r.data || {})).catch(() => {});
  }, []);

  const next = () => setCarouselIdx((i) => (i + 1) % Math.max(stories.length - 2, 1));
  const prev = () => setCarouselIdx((i) => (i - 1 + Math.max(stories.length - 2, 1)) % Math.max(stories.length - 2, 1));

  return (
    <div data-testid="home-page">
      {/* HERO — full logo as centerpiece */}
      <section data-testid="hero-section" className="relative min-h-[100vh] flex items-center overflow-hidden bg-gradient-to-b from-[#1a0a00] via-[#3d1a00] to-[#0D0D0D]">
        {/* The logo image as full-bleed cinematic hero */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Our Young India — children with passion"
            className="w-full h-full object-cover object-center"
          />
          {/* Warm dark gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#0D0D0D]/95" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/70 via-transparent to-[#0D0D0D]/40 lg:bg-gradient-to-r lg:from-[#0D0D0D]/85 lg:via-transparent lg:to-[#0D0D0D]/30" aria-hidden />
        </div>

        {/* Hero text — left aligned on desktop, centered on mobile */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-10 w-full text-center lg:text-left">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 mb-6 fade-up" style={{ animationDelay: "100ms" }}>
              <span className="h-px w-8 bg-gold/70" />
              <span className="gold-star text-xl">★</span>
              <span className="font-cormorant italic text-gold text-base sm:text-lg whitespace-nowrap">India's First Child-Led Platform</span>
            </div>

            <h1 className="font-cinzel text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] mb-5 fade-up" style={{ animationDelay: "200ms", textShadow: "0 4px 32px rgba(0,0,0,0.8)" }}>
              <span className="text-saffron">Our</span>{" "}
              <span className="text-white">Young</span>{" "}
              <span className="text-india-green" style={{ textShadow: "0 4px 32px rgba(0,0,0,0.95), 0 0 20px rgba(19,136,8,0.4)" }}>India</span>
            </h1>

            <p className="font-cormorant italic text-gold text-2xl sm:text-3xl mb-6 fade-up" style={{ animationDelay: "350ms", textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}>
              Pure Passion. Incredible Journeys.
            </p>

            <p className="font-mont text-white/90 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed fade-up" style={{ animationDelay: "500ms", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
              Where young achievers across India inspire the next generation — one real story at a time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center fade-up" style={{ animationDelay: "650ms" }}>
              <Link to="/stories" data-testid="hero-watch-stories" className="btn-saffron flex items-center gap-2">
                <Sparkles size={18}/> Watch Journeys
              </Link>
              <Link to="/nominate" data-testid="hero-nominate" className="btn-outline-gold flex items-center gap-2">
                <Star size={18}/> Nominate a Star
              </Link>
            </div>
          </div>
        </div>

        {/* Tricolor stripe at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 h-1 z-20" style={{
          background: "linear-gradient(90deg, #FF9933 0%, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%, #138808 100%)"
        }}/>
      </section>

      {/* FEATURED STORIES CAROUSEL */}
      <section data-testid="featured-stories" className="py-20 bg-festive relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl bg-saffron"/>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-15 blur-3xl bg-india-green"/>
        <div className="max-w-7xl mx-auto px-5 lg:px-10 relative">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="font-cormorant italic text-saffron text-lg mb-1">Hot Off the Press</p>
              <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#1a1a1a]">Latest Journeys</h2>
            </div>
            <div className="flex gap-3">
              <button data-testid="carousel-prev" onClick={prev} className="w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-saffron hover:text-white hover:border-saffron transition-all shadow-sm">
                <ChevronLeft size={20}/>
              </button>
              <button data-testid="carousel-next" onClick={next} className="w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-saffron hover:text-white hover:border-saffron transition-all shadow-sm">
                <ChevronRight size={20}/>
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out gap-6"
              style={{ transform: `translateX(calc(-${carouselIdx} * (100% / 3 + 8px)))` }}
            >
              {stories.map((s, i) => (
                <div key={s.id} className="min-w-[85%] sm:min-w-[48%] lg:min-w-[calc(33.333%-16px)]">
                  <StoryCard story={s} index={i} />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <Link to="/stories" data-testid="view-all-stories" className="inline-flex items-center gap-2 font-mont font-semibold text-saffron hover:text-india-green transition-colors">
              View all journeys <ArrowRight size={18}/>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <StatsSection stats={stats} />

      {/* MEET SHARANYA */}
      <section data-testid="meet-sharanya" className="py-24 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #4A0E0E 0%, #1a0a00 50%, #2d1b00 100%)"
      }}>
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-30 blur-3xl bg-saffron" aria-hidden/>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl bg-gold" aria-hidden/>
        <div className="sun-rays absolute inset-0 opacity-40" aria-hidden/>
        <div className="max-w-6xl mx-auto px-5 lg:px-10 grid md:grid-cols-2 gap-12 items-center relative">
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl" style={{ boxShadow: "0 0 0 6px rgba(255, 215, 0, 0.3), 0 25px 60px rgba(255, 153, 51, 0.4)" }}>
              <img src={SHARANYA_PHOTO} alt="Sharanya Mena, age 9" className="w-full h-full object-cover"/>
            </div>
            <div className="absolute -bottom-6 -right-6 text-white py-4 px-6 rounded-2xl shadow-2xl" style={{ background: "linear-gradient(135deg, #FF9933 0%, #FFD700 100%)" }}>
              <p className="font-cinzel font-bold text-2xl">9 yrs</p>
              <p className="font-mont text-xs uppercase tracking-wider">Founder & Host</p>
            </div>
          </div>
          <div className="text-white">
            <p className="font-cormorant italic text-gold uppercase tracking-[0.3em] text-xs mb-3">Meet the Founder</p>
            <h2 className="font-cinzel text-4xl sm:text-5xl font-bold mb-2"><span className="tricolor-text">Sharanya Mena</span></h2>
            <div className="flex items-center gap-2 text-gold mb-6">
              <Mic size={16}/>
              <span className="font-mont text-sm uppercase tracking-wider">9-Year-Old Storyteller</span>
            </div>
            <p className="font-cormorant italic text-2xl text-white/95 mb-6 leading-snug border-l-2 border-saffron pl-5">
              "Hi! I'm Sharanya. I started Our Young India because I believe every child has an incredible story. When kids see other kids achieving big things, they believe they can too."
            </p>
            <p className="font-mont text-white/80 mb-8 leading-relaxed">
              Sharanya travels (sometimes virtually) across India to meet young achievers, hear their journeys, and share them with kids everywhere. Her interviews are warm, real, and full of curiosity.
            </p>
            <Link to="/about" data-testid="read-sharanya-story" className="inline-flex items-center gap-2 btn-outline-gold">
              Read My Story <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section data-testid="categories-section" className="py-20 bg-saffron-glow relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl bg-gold"/>
        <div className="max-w-7xl mx-auto px-5 lg:px-10 relative">
          <div className="text-center mb-14">
            <p className="font-cormorant italic text-saffron text-lg mb-1">Find Your Inspiration</p>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#1a1a1a]">Explore by Field</h2>
            <div className="flex items-center justify-center mt-5 gap-3 text-gold">
              <span className="h-px w-10 bg-gold/60"/>
              <span className="gold-star text-xl">★</span>
              <span className="h-px w-10 bg-gold/60"/>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {categories.map((cat, i) => (
              <Link
                key={cat.value}
                to={`/stories?field=${encodeURIComponent(cat.value)}`}
                data-testid={`category-${cat.value.toLowerCase().replace(/\s+/g, '-')}`}
                className="group relative aspect-square rounded-2xl overflow-hidden hover-lift fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${cat.img})` }} aria-hidden/>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/85 group-hover:to-saffron/85 transition-all duration-500"/>
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                  <span className="text-3xl mb-1" aria-hidden>{cat.icon}</span>
                  <h3 className="font-cinzel font-bold text-xl">{cat.label}</h3>
                  <p className="font-mont text-xs text-white/80 group-hover:text-white">{categoryCounts[cat.value] || 0} {(categoryCounts[cat.value] || 0) === 1 ? "Journey" : "Journeys"}</p>
                  <span className="font-mont text-xs uppercase tracking-wider mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Explore →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NOMINATE CTA */}
      <section data-testid="nominate-cta" className="relative py-24 overflow-hidden" style={{
        background: "linear-gradient(135deg, #FF9933 0%, #FFB347 35%, #FFD700 65%, #2DB81E 100%)"
      }}>
        <div className="absolute inset-0 opacity-30 mix-blend-overlay" aria-hidden style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)"
        }}/>
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-30 blur-3xl bg-white"/>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl bg-gold"/>
        <div className="relative max-w-4xl mx-auto px-5 lg:px-10 text-center text-white">
          <p className="font-cormorant italic text-white/95 mb-3 text-lg">A New Story is Waiting</p>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold mb-5" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.3)" }}>Know a Young Achiever?</h2>
          <p className="font-mont text-white/95 text-lg max-w-2xl mx-auto mb-10" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            Nominate them to be featured on Our Young India. Every story matters — every kid deserves to be seen.
          </p>
          <Link to="/nominate" data-testid="cta-nominate-now" className="inline-flex items-center gap-2 bg-white text-saffron font-mont font-bold rounded-full px-8 py-4 hover:scale-105 transition-transform shadow-2xl">
            <Star size={18}/> Nominate Now
          </Link>
        </div>
      </section>

      {/* SOCIAL */}
      <section data-testid="social-section" className="py-20 bg-warm-cream">
        <div className="max-w-5xl mx-auto px-5 lg:px-10 text-center">
          <p className="font-cormorant italic text-saffron text-lg mb-1">Stay Connected</p>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#1a1a1a] mb-10">Follow Our Journey</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            <a href="#" data-testid="social-card-instagram" className="hover-lift bg-gradient-to-br from-pink-500 via-saffron to-yellow-400 text-white border border-white/40 rounded-2xl p-8 shadow-lg">
              <Instagram className="text-white mx-auto mb-3" size={36}/>
              <h3 className="font-cinzel font-bold text-xl text-white">Instagram</h3>
              <p className="font-mont text-sm text-white/90 mt-1">Daily story snippets & reels</p>
            </a>
            <a href="#" data-testid="social-card-youtube" className="hover-lift bg-gradient-to-br from-red-500 via-red-600 to-saffron text-white rounded-2xl p-8 shadow-lg">
              <Youtube className="text-white mx-auto mb-3" size={36}/>
              <h3 className="font-cinzel font-bold text-xl text-white">YouTube</h3>
              <p className="font-mont text-sm text-white/90 mt-1">Full interviews & journey videos</p>
            </a>
            <a href="#" data-testid="social-card-whatsapp" className="hover-lift bg-gradient-to-br from-india-green to-emerald-400 text-white rounded-2xl p-8 shadow-lg">
              <span className="text-white mx-auto mb-3 block text-4xl">💬</span>
              <h3 className="font-cinzel font-bold text-xl text-white">WhatsApp</h3>
              <p className="font-mont text-sm text-white/90 mt-1">Share with friends & family</p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
