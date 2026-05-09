import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Youtube, MessageCircle, Mail, Phone, Facebook } from "lucide-react";
import api from "../lib/api";
import { SOCIAL } from "../lib/social";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await api.post(`/newsletter?email=${encodeURIComponent(email)}`);
      toast.success("Subscribed! New stories coming your way.");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Subscription failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer data-testid="site-footer" className="bg-[#0D0D0D] text-white relative">
      <div className="tricolor-stripe" />
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Quick links */}
        <div>
          <h4 className="font-cinzel text-gold text-sm uppercase tracking-widest mb-5">Explore</h4>
          <ul className="space-y-3 font-mont text-white/80">
            <li><Link to="/" data-testid="footer-link-home" className="hover:text-saffron transition-colors">Home</Link></li>
            <li><Link to="/stories" data-testid="footer-link-stories" className="hover:text-saffron transition-colors">Journeys</Link></li>
            <li><Link to="/nominate" data-testid="footer-link-nominate" className="hover:text-saffron transition-colors">Nominate</Link></li>
            <li><Link to="/about" data-testid="footer-link-about" className="hover:text-saffron transition-colors">About</Link></li>
            <li><Link to="/about" data-testid="footer-link-privacy" className="hover:text-saffron transition-colors">Privacy Policy</Link></li>
            <li><Link to="/about" data-testid="footer-link-terms" className="hover:text-saffron transition-colors">Terms of Use</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-cinzel text-gold text-sm uppercase tracking-widest mb-5">Contact</h4>
          <ul className="space-y-3 font-mont text-white/80">
            <li className="flex items-center gap-3"><Mail size={16} className="text-saffron"/> <a href={SOCIAL.email} className="hover:text-saffron">hi@sharanyamena.com</a></li>
            <li className="flex items-center gap-3"><Phone size={16} className="text-saffron"/> <a href={SOCIAL.phone} className="hover:text-saffron">+91-73866 66077</a></li>
            <li className="flex items-center gap-3"><MessageCircle size={16} className="text-saffron"/>
              <a href={SOCIAL.whatsapp} target="_blank" rel="noreferrer" className="hover:text-saffron">WhatsApp</a>
            </li>
          </ul>
        </div>

        {/* Follow us */}
        <div>
          <h4 className="font-cinzel text-gold text-sm uppercase tracking-widest mb-5">Follow Our Journey</h4>
          <div className="flex gap-4">
            <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" data-testid="social-instagram" aria-label="Instagram" className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center hover:bg-saffron hover:border-saffron transition-all">
              <Instagram size={18} />
            </a>
            <a href={SOCIAL.youtube} target="_blank" rel="noreferrer" data-testid="social-youtube" aria-label="YouTube" className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center hover:bg-saffron hover:border-saffron transition-all">
              <Youtube size={18} />
            </a>
            <a href={SOCIAL.facebook} target="_blank" rel="noreferrer" data-testid="social-facebook" aria-label="Facebook" className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center hover:bg-saffron hover:border-saffron transition-all">
              <Facebook size={18} />
            </a>
          </div>
          <p className="font-cormorant italic text-white/60 mt-5 text-sm">Where children inspire children.</p>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-cinzel text-gold text-sm uppercase tracking-widest mb-5">Newsletter</h4>
          <p className="font-mont text-white/80 text-sm mb-4">Get new stories in your inbox.</p>
          <form onSubmit={subscribe} className="flex flex-col gap-3">
            <input
              data-testid="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-white/5 border border-white/15 text-white placeholder-white/40 px-4 py-3 rounded-md focus:outline-none focus:border-saffron font-mont text-sm"
            />
            <button data-testid="newsletter-subscribe" disabled={submitting} className="btn-saffron text-sm">
              {submitting ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-6 flex flex-col md:flex-row items-center gap-4 justify-between">
          <span className="font-mont text-xs text-white/60">© 2026 Our Young India. All rights reserved.</span>
          <span className="font-cinzel text-xs tracking-widest">
            <span className="text-saffron">our</span><span className="text-white">young</span><span className="text-india-green">india.in</span>
          </span>
          <span className="font-cormorant italic text-gold text-sm">Pure Passion. Incredible Journeys.</span>
        </div>
      </div>
    </footer>
  );
}
