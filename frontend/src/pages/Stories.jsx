import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import StoryCard from "../components/StoryCard";
import { Search, X, SlidersHorizontal } from "lucide-react";

const FIELDS = ["All Fields", "Academics", "Sports", "Arts", "Technology", "Social Impact", "Entertainment", "Science", "Literature"];
const STATES = ["All States", "Maharashtra", "Tamil Nadu", "Karnataka", "Delhi", "West Bengal", "Telangana", "Punjab", "Gujarat", "Kerala", "Bihar", "Uttar Pradesh", "Rajasthan"];
const AGES = [{ v: "all", l: "All Ages" }, { v: "6-8", l: "6-8 yrs" }, { v: "9-11", l: "9-11 yrs" }, { v: "12-14", l: "12-14 yrs" }, { v: "15-17", l: "15-17 yrs" }];
const SORTS = [{ v: "latest", l: "Latest First" }, { v: "popular", l: "Most Watched" }, { v: "az", l: "A → Z" }];

export default function Stories() {
  const [params, setParams] = useSearchParams();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get("search") || "");
  const [field, setField] = useState(params.get("field") || "All Fields");
  const [state, setState] = useState(params.get("state") || "All States");
  const [age, setAge] = useState(params.get("age") || "all");
  const [sort, setSort] = useState(params.get("sort") || "latest");
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      if (field && field !== "All Fields") q.set("field", field);
      if (state && state !== "All States") q.set("state", state);
      if (age && age !== "all") q.set("age", age);
      q.set("sort", sort);
      const res = await api.get(`/stories?${q.toString()}`);
      setStories(res.data.items || []);
    } catch (e) {
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [search, field, state, age, sort]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const np = {};
      if (search) np.search = search;
      if (field && field !== "All Fields") np.field = field;
      if (state && state !== "All States") np.state = state;
      if (age && age !== "all") np.age = age;
      if (sort && sort !== "latest") np.sort = sort;
      setParams(np, { replace: true });
      load();
    }, 280);
    return () => clearTimeout(handler);
  }, [search, field, state, age, sort, load, setParams]);

  const clearAll = () => {
    setSearch(""); setField("All Fields"); setState("All States"); setAge("all"); setSort("latest");
  };

  const activePills = [];
  if (search) activePills.push({ label: `"${search}"`, clear: () => setSearch("") });
  if (field !== "All Fields") activePills.push({ label: field, clear: () => setField("All Fields") });
  if (state !== "All States") activePills.push({ label: state, clear: () => setState("All States") });
  if (age !== "all") activePills.push({ label: AGES.find(a => a.v === age)?.l || age, clear: () => setAge("all") });

  return (
    <div data-testid="stories-page" className="min-h-screen relative" style={{
      background: "linear-gradient(180deg, #FFF1DC 0%, #FFE5D6 30%, #FFF8EC 70%, #FFFFFF 100%)"
    }}>
      <div className="absolute top-[300px] -left-32 w-96 h-96 rounded-full opacity-15 blur-3xl bg-saffron pointer-events-none"/>
      <div className="absolute top-[800px] -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl bg-purple-400 pointer-events-none"/>
      <div className="absolute top-[1500px] left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-pink-400 pointer-events-none"/>
      {/* Page header */}
      <section className="bg-gradient-to-br from-[#4A0E0E] via-[#1a0a00] to-[#2d1b00] text-white py-16 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-30 blur-3xl bg-saffron"/>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl bg-gold"/>
        <div className="sun-rays absolute inset-0 opacity-30"/>
        <div className="absolute inset-0 opacity-15" style={{
          background: "linear-gradient(90deg, #FF9933 0%, #FF9933 33%, #FFFFFF 50%, #138808 67%, #138808 100%)"
        }}/>
        <div className="relative max-w-6xl mx-auto px-5 lg:px-10 text-center">
          <p className="font-cormorant italic text-gold text-lg mb-2">Real Stories. Real Kids.</p>
          <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold">Inspiring Journeys</h1>
          <div className="flex items-center justify-center mt-5 gap-3 text-gold">
            <span className="h-px w-10 bg-gold/60"/>
            <span className="gold-star text-xl">★</span>
            <span className="h-px w-10 bg-gold/60"/>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[75px] z-30 backdrop-blur-md border-b border-saffron/20 shadow-md" style={{ background: "rgba(255, 255, 255, 0.92)" }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-saffron" />
              <input
                data-testid="stories-search"
                type="text"
                placeholder="Search by name, achievement, or location"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-saffron/30 rounded-full font-mont text-sm focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 shadow-sm"
              />
            </div>
            <button data-testid="toggle-filters" onClick={() => setShowFilters(s => !s)} className="md:hidden flex items-center gap-2 px-4 py-3 bg-saffron/10 border-2 border-saffron/30 rounded-full font-mont text-sm font-semibold text-saffron">
              <SlidersHorizontal size={16}/> Filters
            </button>
            <div className={`${showFilters ? "flex" : "hidden"} md:flex flex-col md:flex-row gap-3`}>
              <select data-testid="filter-age" value={age} onChange={(e) => setAge(e.target.value)} className="px-4 py-3 bg-white border-2 border-saffron/30 rounded-full font-mont text-sm focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 shadow-sm">
                {AGES.map(a => <option key={a.v} value={a.v}>{a.l}</option>)}
              </select>
              <select data-testid="filter-field" value={field} onChange={(e) => setField(e.target.value)} className="px-4 py-3 bg-white border-2 border-saffron/30 rounded-full font-mont text-sm focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 shadow-sm">
                {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <select data-testid="filter-state" value={state} onChange={(e) => setState(e.target.value)} className="px-4 py-3 bg-white border-2 border-saffron/30 rounded-full font-mont text-sm focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 shadow-sm">
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select data-testid="filter-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="px-4 py-3 bg-white border-2 border-saffron/30 rounded-full font-mont text-sm focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 shadow-sm">
                {SORTS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
          </div>
          {activePills.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {activePills.map((p, i) => (
                <button key={i} onClick={p.clear} className="inline-flex items-center gap-2 bg-gradient-to-r from-saffron to-amber-500 text-white px-3 py-1.5 rounded-full font-mont text-xs font-semibold shadow-sm hover:shadow-md transition-shadow">
                  {p.label} <X size={12}/>
                </button>
              ))}
              <button data-testid="clear-filters" onClick={clearAll} className="text-xs text-saffron font-semibold underline ml-2 font-mont hover:text-india-green">Clear all</button>
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="relative max-w-7xl mx-auto px-5 lg:px-10 py-12">
        {loading ? (
          <div data-testid="stories-loading" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <div className="aspect-video bg-gray-200 animate-pulse"/>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3"/>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"/>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"/>
                </div>
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div data-testid="stories-empty" className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-cinzel text-2xl font-bold mb-2">No journeys found</h3>
            <p className="font-mont text-gray-600 mb-6">Try adjusting your filters or search term.</p>
            <button onClick={clearAll} data-testid="empty-clear" className="btn-saffron">Clear All Filters</button>
          </div>
        ) : (
          <>
            <p className="font-mont text-sm text-gray-600 mb-6">{stories.length} {stories.length === 1 ? "journey" : "journeys"} found</p>
            <div data-testid="stories-grid" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((s, i) => <StoryCard key={s.id} story={s} index={i}/>)}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
