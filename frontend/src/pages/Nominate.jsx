import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { toast } from "sonner";
import { Upload, CheckCircle2, ChevronDown, Star } from "lucide-react";

const FIELDS = ["Academics", "Sports", "Arts", "Technology", "Social Impact", "Entertainment", "Science", "Literature", "Other"];
const RELATIONS = ["Parent", "Teacher", "Friend", "Self", "Other"];
const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Other"];

const STEPS = [
  { icon: "✅", title: "We Review", desc: "Within 7 days, our team reviews all nominations.", gradient: "from-[#FF9933] to-amber-500", glow: "rgba(255, 153, 51, 0.4)" },
  { icon: "📞", title: "We Reach Out", desc: "If selected, we contact the nominee or their guardian via email or phone.", gradient: "from-purple-500 to-fuchsia-600", glow: "rgba(168, 85, 247, 0.4)" },
  { icon: "🎤", title: "Interview Scheduled", desc: "We schedule a comfortable online or in-person interview with Sharanya.", gradient: "from-pink-500 to-rose-600", glow: "rgba(236, 72, 153, 0.4)" },
  { icon: "🎬", title: "Story Goes Live", desc: "The interview is edited, published on YouTube, and featured on our website.", gradient: "from-emerald-500 to-green-600", glow: "rgba(16, 185, 129, 0.4)" },
];

const FAQS = [
  { q: "Is there a fee to be featured?", a: "No, Our Young India is completely free. We celebrate young achievers, not profit from them." },
  { q: "How long are the interviews?", a: "Most interviews are 15-25 minutes, edited to 10-15 minutes highlighting the best moments." },
  { q: "Can I nominate myself?", a: "Absolutely! We encourage self-nominations. If you've achieved something you're proud of, we want to hear about it." },
  { q: "What if my nominee is shy or nervous?", a: "Sharanya is great at making kids feel comfortable! The interview is conversational, friendly, and fun — not formal or intimidating." },
  { q: "How long until we hear back?", a: "We review all nominations within 7 days. If selected, we'll reach out via email. Due to volume, we may not be able to respond to every nomination, but every one is read and considered." },
  { q: "Can we do the interview in regional languages?", a: "Currently, interviews are conducted in English, Hindi, or Telugu. We're working on adding more languages soon!" },
];

const initialForm = {
  your_name: "", your_email: "", relationship: "Parent",
  nominee_name: "", nominee_age: "", field: "Academics",
  achievement_brief: "", why_feature: "",
  contact_info: "", city: "", state: "Maharashtra",
  photo_url: "", instagram: "", youtube: "", consent: false
};

export default function Nominate() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File too large (max 5MB)"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      set("photo_url", res.data.url);
      toast.success("Photo uploaded!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.consent) { toast.error("Please confirm consent"); return; }
    setSubmitting(true);
    try {
      const payload = { ...form, nominee_age: parseInt(form.nominee_age, 10) };
      const res = await api.post("/nominations", payload);
      setSubmitted({ name: res.data.nominee_name });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div data-testid="nominate-thank-you" className="min-h-[80vh] flex items-center justify-center px-5 py-20 bg-[#FAF7F2]">
        <div className="max-w-xl text-center bg-white rounded-3xl p-12 shadow-lg border border-black/5">
          <CheckCircle2 className="text-india-green mx-auto mb-4" size={72}/>
          <p className="font-cormorant italic text-saffron text-lg mb-2">A new story is on its way</p>
          <h2 className="font-cinzel text-4xl font-bold mb-4">Thank You!</h2>
          <p className="font-mont text-gray-700 leading-relaxed mb-8">
            We've received your nomination for <strong className="text-saffron">{submitted.name}</strong>. Our team will review
            it within 7 days and reach out via email if selected. In the meantime, explore other inspiring stories!
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/stories" data-testid="thank-explore" className="btn-saffron">Watch Journeys</Link>
            <button onClick={() => { setSubmitted(null); setForm(initialForm); }} data-testid="thank-another" className="btn-outline-gold !text-[#1a1a1a] !border-[#1a1a1a]">Nominate another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="nominate-page" className="bg-warm-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#4A0E0E] via-[#1a0a00] to-[#2d1b00] text-white py-20 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-30 blur-3xl bg-saffron"/>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl bg-gold"/>
        <div className="sun-rays absolute inset-0 opacity-30"/>
        <div className="absolute inset-0 opacity-15" style={{
          background: "linear-gradient(90deg, #FF9933 0%, #FF9933 33%, #FFFFFF 50%, #138808 67%, #138808 100%)"
        }}/>
        <div className="relative max-w-4xl mx-auto px-5 lg:px-10 text-center">
          <p className="font-cormorant italic text-gold text-lg mb-2">Lift a Star</p>
          <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">Nominate a Young Star</h1>
          <p className="font-cormorant italic text-2xl text-white/85">Know a child doing something incredible? Share their story with us.</p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-5 lg:px-10 py-14">
        <form data-testid="nominate-form" onSubmit={submit} className="bg-white rounded-3xl p-8 lg:p-10 shadow-lg border border-black/5 space-y-8">
          {/* Your info */}
          <div>
            <h2 className="font-cinzel text-2xl font-bold mb-4">Your Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Your Name" required>
                <input data-testid="form-your-name" required value={form.your_name} onChange={e => set("your_name", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Your Email" required>
                <input data-testid="form-your-email" type="email" required value={form.your_email} onChange={e => set("your_email", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Your Relationship to Nominee" required full>
                <select data-testid="form-relationship" value={form.relationship} onChange={e => set("relationship", e.target.value)} className={inputCls}>
                  {RELATIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Nominee info */}
          <div>
            <h2 className="font-cinzel text-2xl font-bold mb-4">Nominee Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nominee's Full Name" required>
                <input data-testid="form-nominee-name" required value={form.nominee_name} onChange={e => set("nominee_name", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Age (6-17)" required>
                <input data-testid="form-nominee-age" type="number" min="6" max="17" required value={form.nominee_age} onChange={e => set("nominee_age", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Field of Achievement" required>
                <select data-testid="form-field" value={form.field} onChange={e => set("field", e.target.value)} className={inputCls}>
                  {FIELDS.map(f => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Contact Info (Email or Phone)" required>
                <input data-testid="form-contact" required value={form.contact_info} onChange={e => set("contact_info", e.target.value)} className={inputCls} />
              </Field>
              <Field label="City" required>
                <input data-testid="form-city" required value={form.city} onChange={e => set("city", e.target.value)} className={inputCls} />
              </Field>
              <Field label="State" required>
                <select data-testid="form-state" value={form.state} onChange={e => set("state", e.target.value)} className={inputCls}>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Brief Achievement Description" required full hint={`${form.achievement_brief.length}/500`}>
                <textarea data-testid="form-achievement-brief" required maxLength={500} rows={3} value={form.achievement_brief} onChange={e => set("achievement_brief", e.target.value)} placeholder="In 2-3 sentences, tell us what they've achieved." className={inputCls} />
              </Field>
              <Field label="Why should we feature them?" required full hint={`${form.why_feature.length}/1000`}>
                <textarea data-testid="form-why-feature" required maxLength={1000} rows={4} value={form.why_feature} onChange={e => set("why_feature", e.target.value)} placeholder="What makes their story inspiring? How can it help other kids?" className={inputCls} />
              </Field>
              <Field label="Instagram (optional)">
                <input data-testid="form-instagram" placeholder="@username" value={form.instagram} onChange={e => set("instagram", e.target.value)} className={inputCls} />
              </Field>
              <Field label="YouTube (optional)">
                <input data-testid="form-youtube" placeholder="Channel URL" value={form.youtube} onChange={e => set("youtube", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Photo (optional, max 5MB)" full>
                <label className="flex items-center gap-3 px-4 py-3 bg-[#F5F5F5] rounded-md cursor-pointer hover:bg-saffron/10 transition-colors">
                  <Upload size={18} className="text-saffron"/>
                  <span className="font-mont text-sm text-gray-600 flex-1">{uploading ? "Uploading…" : (form.photo_url ? "Photo uploaded ✓" : "Click to choose a photo")}</span>
                  <input data-testid="form-photo" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />
                </label>
              </Field>
            </div>
          </div>

          {/* Consent */}
          <div className="bg-saffron/5 border border-saffron/20 rounded-xl p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input data-testid="form-consent" type="checkbox" checked={form.consent} onChange={e => set("consent", e.target.checked)} className="mt-1 w-5 h-5 accent-[#FF9933]" />
              <span className="font-mont text-sm text-gray-700 leading-relaxed">
                I confirm that the nominee (or their parent/guardian) is aware of and agrees to this nomination.
              </span>
            </label>
          </div>

          <button data-testid="form-submit" disabled={submitting} className="btn-saffron w-full text-lg flex items-center justify-center gap-2">
            <Star size={18}/> {submitting ? "Submitting…" : "Submit Nomination"}
          </button>
        </form>
      </section>

      {/* What happens next */}
      <section data-testid="what-next" className="py-24 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #FFF1DC 0%, #FFE5D6 50%, #FFD9E8 100%)"
      }}>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl bg-saffron"/>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl bg-purple-400"/>
        <div className="relative max-w-6xl mx-auto px-5 lg:px-10">
          <div className="text-center mb-14">
            <p className="font-cormorant italic text-saffron text-lg mb-2">The Journey From Here</p>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#1a1a1a]">What Happens Next?</h2>
            <div className="flex items-center justify-center mt-4 gap-3 text-gold">
              <span className="h-px w-10 bg-gold/60"/>
              <span className="gold-star text-xl">★</span>
              <span className="h-px w-10 bg-gold/60"/>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className={`hover-lift bg-gradient-to-br ${s.gradient} rounded-3xl p-7 text-white shadow-xl fade-up relative overflow-hidden`}
                style={{ animationDelay: `${i * 90}ms`, boxShadow: `0 18px 40px -12px ${s.glow}` }}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/15 blur-2xl"/>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-5xl" aria-hidden>{s.icon}</div>
                    <span className="font-cinzel font-bold text-3xl text-white/40">0{i + 1}</span>
                  </div>
                  <p className="font-mont text-xs uppercase tracking-[0.2em] text-white/85 mb-1 font-semibold">Step {i+1}</p>
                  <h3 className="font-cinzel text-xl font-bold mb-2" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>{s.title}</h3>
                  <p className="font-mont text-sm leading-relaxed text-white/95">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section data-testid="faq-section" className="py-24 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #1a0a00 0%, #2d1b00 50%, #4A0E0E 100%)"
      }}>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-25 blur-3xl bg-cyan-500"/>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-25 blur-3xl bg-pink-500"/>
        <div className="sun-rays absolute inset-0 opacity-20"/>
        <div className="relative max-w-3xl mx-auto px-5 lg:px-10">
          <div className="text-center mb-12">
            <p className="font-cormorant italic text-yellow-300 text-lg mb-2">Curious?</p>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-white" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>Frequently Asked Questions</h2>
            <div className="flex items-center justify-center mt-4 gap-3 text-yellow-300">
              <span className="h-px w-10 bg-yellow-300/60"/>
              <span className="text-xl">★</span>
              <span className="h-px w-10 bg-yellow-300/60"/>
            </div>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => {
              const accents = [
                "from-orange-500 to-pink-500",
                "from-purple-500 to-fuchsia-500",
                "from-emerald-500 to-cyan-500",
                "from-pink-500 to-rose-500",
                "from-amber-500 to-orange-500",
                "from-blue-500 to-indigo-500",
              ];
              const open = openFaq === i;
              return (
                <div
                  key={i}
                  data-testid={`faq-${i}`}
                  className={`rounded-2xl overflow-hidden transition-all ${open ? "shadow-2xl scale-[1.01]" : "shadow-lg"}`}
                  style={{
                    background: open
                      ? `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`
                      : "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(o => o === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${accents[i % accents.length]} flex items-center justify-center font-cinzel font-bold text-white shadow-lg`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-cinzel font-bold text-base sm:text-lg text-white">{f.q}</span>
                    </div>
                    <ChevronDown size={22} className={`text-yellow-300 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}/>
                  </button>
                  {open && (
                    <div className="px-5 pb-5 pl-[76px]">
                      <p className="font-mont text-sm text-white/90 leading-relaxed border-l-2 border-yellow-300/50 pl-4">{f.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center font-cormorant italic text-yellow-200 text-xl mt-10">Still have questions? Email us at <a href="mailto:hi@sharanyamena.com" className="underline hover:text-white">hi@sharanyamena.com</a></p>
        </div>
      </section>
    </div>
  );
}

const inputCls = "w-full bg-[#F5F5F5] px-4 py-3 rounded-md font-mont text-sm focus:outline-none focus:ring-2 focus:ring-saffron border-0";

function Field({ label, required, children, hint, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="font-mont text-sm font-semibold text-[#1a1a1a] mb-1.5 flex items-center justify-between">
        <span>{label}{required && <span className="text-saffron"> *</span>}</span>
        {hint && <span className="text-xs text-gray-400 font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
