import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_stories-live-preview/artifacts/82eqpcy7_file_00000000770c71fab5b83363c28bbbfc.png";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/stories", label: "Journeys" },
  { to: "/nominate", label: "Nominate" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const transparentMode = false; // Always show dark navbar for legibility

  return (
    <>
      <div className="tricolor-stripe-thin tricolor-stripe fixed top-0 left-0 right-0 z-[60]" />
      <header
        data-testid="main-navbar"
        className={`fixed top-[3px] left-0 right-0 z-50 transition-all duration-300 ${
          transparentMode ? "bg-transparent" : "bg-[#0D0D0D]/95 backdrop-blur-md border-b border-white/10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-10 flex items-center justify-between h-[72px]">
          <Link to="/" data-testid="nav-logo" className="flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-full bg-white p-1 shadow-md ring-2 ring-gold/60 overflow-hidden flex items-center justify-center">
              <img src={LOGO_URL} alt="Our Young India" className="h-full w-full object-cover rounded-full" />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-cinzel font-bold text-lg tracking-wide" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                <span className="text-saffron">our</span>
                <span className="text-white">young</span>
                <span className="text-india-green" style={{ textShadow: "0 0 8px rgba(45, 184, 30, 0.6)" }}>india</span>
                <span className="text-saffron">.in</span>
              </span>
              <span className="font-cormorant italic text-[11px] text-gold tracking-wider">Pure Passion. Incredible Journeys.</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-9">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={`nav-link-${item.label.toLowerCase()}`}
                className={({ isActive }) => `nav-link text-white/90 hover:text-white text-sm uppercase tracking-wider ${isActive ? "active text-white" : ""}`}
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/stories" data-testid="nav-cta-watch" className="btn-saffron text-sm">
              <Sparkles className="inline mr-2 h-4 w-4" /> Watch Journeys
            </Link>
          </nav>

          <button
            data-testid="mobile-menu-toggle"
            className="md:hidden text-white p-2"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div data-testid="mobile-menu" className="md:hidden bg-[#0D0D0D] border-t border-white/10">
            <div className="flex flex-col px-5 py-6 gap-5">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                  className={({ isActive }) => `text-white text-lg font-mont uppercase tracking-wider ${isActive ? "text-saffron" : ""}`}
                  end={item.to === "/"}
                >
                  {item.label}
                </NavLink>
              ))}
              <Link to="/stories" data-testid="mobile-cta-watch" className="btn-saffron text-center text-sm mt-2">
                <Sparkles className="inline mr-2 h-4 w-4" /> Watch Journeys
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
