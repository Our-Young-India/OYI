import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import StoryCard from "../components/StoryCard";
import {
  MapPin, Calendar, Clock, GraduationCap, Coins, Target,
  Heart, Trophy, Award, BookOpen, Lightbulb, Users, Share2, Copy, Check
} from "lucide-react";
import { toast } from "sonner";

const REACTIONS = [
  { type: "inspiring", emoji: "🔥", label: "Inspiring" },
  { type: "love", emoji: "❤️", label: "Love it" },
  { type: "amazing", emoji: "👏", label: "Amazing" },
  { type: "motivating", emoji: "💪", label: "Motivating" },
];

export default function StoryDetail() {
  const { slug } = useParams();
  const [story, setStory] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ name: "", text: "" });
  const [posting, setPosting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/stories/${slug}`).then(r => {
      setStory(r.data.story);
      setRelated(r.data.related || []);
    }).catch(() => setStory(null)).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!story) return;
    api.get(`/comments?story_id=${story.id}`).then(r => setComments(r.data.items || [])).catch(() => {});
  }, [story]);

  const react = async (type) => {
    if (!story) return;
    try {
      await api.post(`/reactions`, { story_id: story.id, type });
      setStory(s => ({ ...s, reactions: { ...s.reactions, [type]: (s.reactions?.[type] || 0) + 1 } }));
    } catch {
      toast.error("Reaction failed");
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.text.trim()) return;
    setPosting(true);
    try {
      const res = await api.post("/comments", {
        story_id: story.id,
        name: newComment.name || "Anonymous",
        text: newComment.text
      });
      setComments(c => [res.data, ...c]);
      setNewComment({ name: "", text: "" });
      toast.success("Comment posted!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div data-testid="story-loading" className="min-h-screen flex items-center justify-center font-mont text-gray-500">Loading…</div>;
  }
  if (!story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-5">
        <div className="text-6xl mb-4">🙈</div>
        <h2 className="font-cinzel text-3xl font-bold mb-2">Story Not Found</h2>
        <p className="font-mont text-gray-600 mb-6">We couldn't find this story.</p>
        <Link to="/stories" data-testid="back-to-stories" className="btn-saffron">Back to Stories</Link>
      </div>
    );
  }

  const facts = [
    { icon: Calendar, label: "Age", value: `${story.age}` },
    { icon: Trophy, label: "Achievement", value: story.achievement },
    { icon: MapPin, label: "Location", value: `${story.city}, ${story.state}` },
    story.journey_started && { icon: Award, label: "Journey Started", value: story.journey_started },
    story.grade && { icon: GraduationCap, label: "Currently Studying", value: story.grade },
    story.coaching_cost && { icon: Coins, label: "Coaching Cost", value: story.coaching_cost },
    story.daily_practice && { icon: Clock, label: "Daily Practice", value: story.daily_practice },
  ].filter(Boolean);

  return (
    <div data-testid="story-detail-page" className="bg-warm-cream">
      {/* Hero video */}
      <section className="bg-[#0D0D0D]">
        <div className="max-w-6xl mx-auto">
          <div className="aspect-video bg-black w-full">
            {story.youtube_id ? (
              <iframe
                data-testid="story-video"
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${story.youtube_id}`}
                title={story.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/60 font-mont">
                Video coming soon
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Header */}
      <section className="bg-white border-b border-black/5">
        <div className="max-w-6xl mx-auto px-5 lg:px-10 py-10 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <span className="inline-block bg-saffron text-white text-xs font-mont font-semibold px-3 py-1 rounded-full mb-4">{story.field}</span>
            <h1 data-testid="story-name" className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1a1a1a] mb-2">{story.name}</h1>
            <p className="font-mont text-gray-500 mb-3">{story.age} Years Old · {story.field}</p>
            <p className="font-cormorant italic text-2xl text-saffron mb-4">{story.achievement}</p>
            <div className="flex flex-wrap gap-4 text-sm font-mont text-gray-600">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-india-green"/> {story.city}, {story.state}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-saffron"/> Published {new Date(story.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-saffron"/> {story.watch_time || "10 min"}</span>
            </div>
          </div>
          <div className="flex lg:flex-col gap-3 lg:items-end">
            <p className="font-mont text-xs uppercase tracking-wider text-gray-500 hidden lg:block">Share</p>
            <div className="flex gap-2 flex-wrap">
              <a data-testid="share-whatsapp" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`} className="px-4 py-2 bg-[#25D366]/10 text-[#25D366] rounded-full font-mont text-xs font-semibold hover:bg-[#25D366] hover:text-white transition-all flex items-center gap-2">
                <Share2 size={14}/> WhatsApp
              </a>
              <a data-testid="share-twitter" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Inspiring story of ${story.name}`)}&url=${encodeURIComponent(window.location.href)}`} className="px-4 py-2 bg-black/5 text-black rounded-full font-mont text-xs font-semibold hover:bg-black hover:text-white transition-all">Twitter</a>
              <button data-testid="share-copy" onClick={copyLink} className="px-4 py-2 bg-saffron/10 text-saffron rounded-full font-mont text-xs font-semibold hover:bg-saffron hover:text-white transition-all flex items-center gap-2">
                {copied ? <><Check size={14}/> Copied</> : <><Copy size={14}/> Copy Link</>}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 lg:px-10 py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* Journey */}
          {story.journey_sections?.length > 0 && (
            <div data-testid="journey-section">
              <h2 className="font-cinzel text-3xl font-bold mb-2">The Journey</h2>
              <div className="flex items-center gap-3 text-gold mb-8">
                <span className="h-px w-8 bg-gold/60"/>
                <span className="gold-star">★</span>
                <span className="h-px w-8 bg-gold/60"/>
              </div>
              <div className="space-y-8">
                {story.journey_sections.map((sec, i) => (
                  <div key={i}>
                    <h3 className="font-cinzel text-xl font-bold text-saffron mb-3">{sec.heading}</h3>
                    <p className="font-mont text-gray-700 leading-[1.8]">{sec.body}</p>
                  </div>
                ))}
              </div>
              {story.pull_quote && (
                <blockquote className="mt-10 border-l-4 border-saffron bg-white rounded-r-2xl p-6 shadow-sm">
                  <p className="font-cormorant italic text-2xl text-[#1a1a1a] leading-snug">"{story.pull_quote}"</p>
                </blockquote>
              )}
            </div>
          )}

          {/* Takeaways */}
          {story.takeaways?.length > 0 && (
            <div data-testid="takeaways-section">
              <h2 className="font-cinzel text-3xl font-bold mb-6">Key Takeaways</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {story.takeaways.map((t, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-black/5">
                    <div className="text-2xl mb-2" aria-hidden>{t.icon}</div>
                    <h4 className="font-cinzel font-bold text-lg mb-1 text-[#1a1a1a]">{t.title}</h4>
                    <p className="font-mont text-sm text-gray-700 leading-relaxed">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {story.resources?.length > 0 && (
            <div data-testid="resources-section">
              <h2 className="font-cinzel text-3xl font-bold mb-6">Tools & Resources They Use</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {story.resources.map((r, i) => (
                  <a key={i} href={r.link || "#"} target="_blank" rel="noreferrer" className="block hover-lift bg-white rounded-xl p-5 border border-black/5">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl" aria-hidden>{r.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-cinzel font-bold text-lg text-[#1a1a1a]">{r.name}</h4>
                        <p className="font-mont text-xs text-gray-500 uppercase tracking-wider mb-2">{r.type}</p>
                        <p className="font-mont text-sm text-gray-700 mb-2">{r.description}</p>
                        {r.price && <span className="inline-block text-xs font-mont font-semibold text-india-green bg-india-green/10 px-2 py-0.5 rounded-full">{r.price}</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Reactions */}
          <div data-testid="reactions-section">
            <h2 className="font-cinzel text-3xl font-bold mb-6">React</h2>
            <div className="flex flex-wrap gap-3">
              {REACTIONS.map(r => (
                <button
                  key={r.type}
                  data-testid={`reaction-${r.type}`}
                  onClick={() => react(r.type)}
                  className="flex items-center gap-2 bg-white border border-black/10 hover:border-saffron hover:bg-saffron/5 rounded-full px-5 py-3 font-mont text-sm font-semibold transition-all hover-lift"
                >
                  <span className="text-xl" aria-hidden>{r.emoji}</span>
                  <span>{r.label}</span>
                  <span className="text-saffron font-bold">{story.reactions?.[r.type] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div data-testid="comments-section">
            <h2 className="font-cinzel text-3xl font-bold mb-6">Leave a Message</h2>
            <form onSubmit={submitComment} className="bg-white rounded-2xl p-6 border border-black/5 space-y-3 mb-6">
              <input
                data-testid="comment-name"
                type="text"
                placeholder="Your name (optional)"
                value={newComment.name}
                onChange={(e) => setNewComment(c => ({ ...c, name: e.target.value }))}
                className="w-full bg-[#F5F5F5] px-4 py-3 rounded-md font-mont text-sm focus:outline-none focus:ring-2 focus:ring-saffron"
              />
              <textarea
                data-testid="comment-text"
                required
                placeholder={`Leave a message for ${story.name}…`}
                value={newComment.text}
                onChange={(e) => setNewComment(c => ({ ...c, text: e.target.value }))}
                rows={4}
                className="w-full bg-[#F5F5F5] px-4 py-3 rounded-md font-mont text-sm focus:outline-none focus:ring-2 focus:ring-saffron resize-none"
              />
              <button data-testid="comment-submit" disabled={posting} className="btn-saffron">
                {posting ? "Posting…" : "Post Comment"}
              </button>
            </form>
            <div className="space-y-3">
              {comments.length === 0 && <p className="font-mont text-sm text-gray-500">Be the first to leave a message.</p>}
              {comments.map(c => (
                <div key={c.id} data-testid={`comment-${c.id}`} className="bg-white rounded-xl p-4 border border-black/5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-saffron/15 text-saffron flex items-center justify-center font-cinzel font-bold text-sm">
                      {(c.name || "A")[0].toUpperCase()}
                    </div>
                    <p className="font-mont font-semibold text-sm text-[#1a1a1a]">{c.name || "Anonymous"}</p>
                    <p className="font-mont text-xs text-gray-400 ml-auto">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="font-mont text-sm text-gray-700 leading-relaxed pl-10">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div data-testid="quick-facts" className="bg-white rounded-2xl p-6 border border-black/5 sticky top-[100px]">
            <h3 className="font-cinzel text-xl font-bold mb-1">At a Glance</h3>
            <div className="flex items-center gap-2 text-gold mb-5">
              <span className="h-px w-6 bg-gold/60"/>
              <span className="gold-star text-xs">★</span>
              <span className="h-px w-6 bg-gold/60"/>
            </div>
            <ul className="space-y-4">
              {facts.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-saffron/10 text-saffron flex items-center justify-center flex-shrink-0">
                    <f.icon size={16}/>
                  </div>
                  <div>
                    <p className="font-mont text-xs uppercase tracking-wider text-gray-500">{f.label}</p>
                    <p className="font-mont text-sm font-semibold text-[#1a1a1a]">{f.value}</p>
                  </div>
                </li>
              ))}
            </ul>
            {story.next_goal && (
              <div className="mt-6 pt-6 border-t border-black/5">
                <p className="font-mont text-xs uppercase tracking-wider text-saffron mb-1 flex items-center gap-1.5"><Target size={12}/> Next Goal</p>
                <p className="font-mont text-sm text-[#1a1a1a] leading-relaxed">{story.next_goal}</p>
              </div>
            )}
            {story.support_system && (
              <div className="mt-5">
                <p className="font-mont text-xs uppercase tracking-wider text-saffron mb-1 flex items-center gap-1.5"><Users size={12}/> Support System</p>
                <p className="font-mont text-sm text-[#1a1a1a] leading-relaxed">{story.support_system}</p>
              </div>
            )}
          </div>
        </aside>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section data-testid="related-stories" className="bg-white py-16 border-t border-black/5">
          <div className="max-w-7xl mx-auto px-5 lg:px-10">
            <h2 className="font-cinzel text-3xl font-bold mb-2">You Might Also Like</h2>
            <div className="flex items-center gap-3 text-gold mb-8">
              <span className="h-px w-8 bg-gold/60"/>
              <span className="gold-star">★</span>
              <span className="h-px w-8 bg-gold/60"/>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.slice(0, 3).map((r, i) => <StoryCard key={r.id} story={r} index={i}/>)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
