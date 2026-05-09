import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { toast } from "sonner";
import { LogOut, Plus, Edit, Trash2, X, Inbox, Film } from "lucide-react";

const FIELDS = ["Academics", "Sports", "Arts", "Technology", "Social Impact", "Entertainment", "Science", "Literature"];

const emptyStory = {
  name: "", age: 10, field: "Academics",
  achievement: "", hook: "", city: "", state: "",
  youtube_url: "", thumbnail: "", photo_url: "", watch_time: "10 min",
  daily_practice: "", journey_started: "", grade: "", coaching_cost: "",
  pull_quote: "", advice: "", next_goal: "", support_system: "",
  journey_sections: [], takeaways: [], resources: [], tags: []
};

export default function Admin() {
  const [tab, setTab] = useState("stories");
  const [stories, setStories] = useState([]);
  const [nominations, setNominations] = useState([]);
  const [editing, setEditing] = useState(null); // story object or null
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyStory);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("oyi_admin_token")) {
      navigate("/admin/login");
    } else {
      loadStories();
      loadNominations();
    }
  }, [navigate]);

  const loadStories = () => api.get("/stories?limit=200").then(r => setStories(r.data.items || []));
  const loadNominations = () => api.get("/nominations").then(r => setNominations(r.data.items || [])).catch(() => {});

  const logout = () => {
    localStorage.removeItem("oyi_admin_token");
    localStorage.removeItem("oyi_admin_email");
    navigate("/admin/login");
  };

  const startCreate = () => { setForm(emptyStory); setCreating(true); setEditing(null); };
  const startEdit = (s) => { setForm({ ...emptyStory, ...s, age: s.age || 10 }); setEditing(s); setCreating(false); };

  const closeEditor = () => { setEditing(null); setCreating(false); setForm(emptyStory); };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        age: parseInt(form.age, 10) || 10,
      };
      if (creating) {
        await api.post("/stories", payload);
        toast.success("Story created");
      } else if (editing) {
        await api.put(`/stories/${editing.id}`, payload);
        toast.success("Story updated");
      }
      await loadStories();
      closeEditor();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Save failed");
    }
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete "${s.name}"?`)) return;
    try {
      await api.delete(`/stories/${s.id}`);
      toast.success("Deleted");
      loadStories();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Delete failed");
    }
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div data-testid="admin-page" className="min-h-screen bg-[#FAF7F2]">
      {/* Top bar */}
      <header className="bg-[#0D0D0D] text-white">
        <div className="tricolor-stripe-thin tricolor-stripe"/>
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="font-cinzel font-bold text-xl">
            <span className="text-saffron">our</span><span className="text-white">young</span><span className="text-india-green">india</span>
            <span className="ml-3 text-xs font-mont uppercase tracking-widest text-gold">Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-mont text-xs text-white/60 hidden sm:block">{localStorage.getItem("oyi_admin_email")}</span>
            <button data-testid="admin-logout" onClick={logout} className="flex items-center gap-2 text-sm text-white/80 hover:text-saffron transition-colors font-mont">
              <LogOut size={16}/> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-black/10">
          <button data-testid="tab-stories" onClick={() => setTab("stories")} className={`px-5 py-3 font-mont font-semibold text-sm border-b-2 transition-colors ${tab === "stories" ? "border-saffron text-saffron" : "border-transparent text-gray-600 hover:text-[#1a1a1a]"}`}>
            <Film size={16} className="inline mr-2"/>Stories ({stories.length})
          </button>
          <button data-testid="tab-nominations" onClick={() => setTab("nominations")} className={`px-5 py-3 font-mont font-semibold text-sm border-b-2 transition-colors ${tab === "nominations" ? "border-saffron text-saffron" : "border-transparent text-gray-600 hover:text-[#1a1a1a]"}`}>
            <Inbox size={16} className="inline mr-2"/>Nominations ({nominations.length})
          </button>
        </div>

        {tab === "stories" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-cinzel text-2xl font-bold">Stories</h2>
              <button data-testid="admin-add-story" onClick={startCreate} className="btn-saffron flex items-center gap-2">
                <Plus size={16}/> Add Story
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F5F5F5] text-xs font-mont uppercase tracking-wider text-gray-600">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4 hidden md:table-cell">Field</th>
                    <th className="text-left p-4 hidden md:table-cell">Location</th>
                    <th className="text-left p-4 hidden lg:table-cell">Views</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-mont text-sm">
                  {stories.map(s => (
                    <tr key={s.id} className="border-t border-black/5 hover:bg-[#FAF7F2]">
                      <td className="p-4">
                        <p className="font-semibold text-[#1a1a1a]">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.age} · {s.achievement.slice(0, 60)}{s.achievement.length > 60 ? "…" : ""}</p>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="bg-saffron/10 text-saffron text-xs font-semibold px-2 py-1 rounded-full">{s.field}</span>
                      </td>
                      <td className="p-4 hidden md:table-cell text-gray-600">{s.city}, {s.state}</td>
                      <td className="p-4 hidden lg:table-cell text-gray-600">{s.views || 0}</td>
                      <td className="p-4 text-right">
                        <button data-testid={`edit-${s.slug}`} onClick={() => startEdit(s)} className="text-saffron hover:text-india-green mr-3"><Edit size={16}/></button>
                        <button data-testid={`delete-${s.slug}`} onClick={() => remove(s)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                  {stories.length === 0 && (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-500">No stories yet. Add your first one.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "nominations" && (
          <>
            <h2 className="font-cinzel text-2xl font-bold mb-6">Nominations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {nominations.map(n => (
                <div key={n.id} data-testid={`nomination-${n.id}`} className="bg-white rounded-2xl p-6 border border-black/5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-cinzel font-bold text-lg">{n.nominee_name}</h3>
                      <p className="font-mont text-xs text-gray-500">{n.nominee_age} yrs · {n.field} · {n.city}, {n.state}</p>
                    </div>
                    <span className="text-xs font-mont bg-saffron/10 text-saffron px-2 py-1 rounded-full">{n.status}</span>
                  </div>
                  <p className="font-mont text-sm text-gray-700 mb-3">{n.achievement_brief}</p>
                  <div className="font-mont text-xs text-gray-500 space-y-1">
                    <p><strong>Why feature:</strong> {n.why_feature.slice(0, 150)}{n.why_feature.length > 150 ? "…" : ""}</p>
                    <p><strong>Nominator:</strong> {n.your_name} ({n.relationship}) · {n.your_email}</p>
                    <p><strong>Contact:</strong> {n.contact_info}</p>
                  </div>
                </div>
              ))}
              {nominations.length === 0 && (
                <p className="col-span-2 text-center text-gray-500 py-10 font-mont">No nominations yet.</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit/Create modal */}
      {(creating || editing) && (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-10 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-black/5 p-5 flex items-center justify-between">
              <h2 className="font-cinzel text-2xl font-bold">{creating ? "Add Story" : "Edit Story"}</h2>
              <button onClick={closeEditor} data-testid="close-editor" className="text-gray-500 hover:text-[#1a1a1a]"><X size={20}/></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Inp label="Name" v={form.name} on={v => setField("name", v)} required testid="ed-name"/>
                <Inp label="Age" type="number" v={form.age} on={v => setField("age", v)} required testid="ed-age"/>
                <div>
                  <label className="font-mont text-xs uppercase tracking-wider text-gray-500 mb-1 block">Field *</label>
                  <select required value={form.field} onChange={e => setField("field", e.target.value)} data-testid="ed-field" className={inp}>
                    {FIELDS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <Inp label="Watch Time" v={form.watch_time} on={v => setField("watch_time", v)} testid="ed-watch"/>
                <Inp label="City" v={form.city} on={v => setField("city", v)} required testid="ed-city"/>
                <Inp label="State" v={form.state} on={v => setField("state", v)} required testid="ed-state"/>
                <div className="sm:col-span-2"><Inp label="Achievement" v={form.achievement} on={v => setField("achievement", v)} required testid="ed-achievement"/></div>
                <div className="sm:col-span-2"><Inp label="Hook (1-line tease)" v={form.hook} on={v => setField("hook", v)} testid="ed-hook"/></div>
                <div className="sm:col-span-2"><Inp label="YouTube URL" v={form.youtube_url} on={v => setField("youtube_url", v)} testid="ed-youtube"/></div>
                <div className="sm:col-span-2"><Inp label="Thumbnail URL (optional)" v={form.thumbnail} on={v => setField("thumbnail", v)} testid="ed-thumb"/></div>
                <Inp label="Daily Practice" v={form.daily_practice} on={v => setField("daily_practice", v)} testid="ed-practice"/>
                <Inp label="Journey Started" v={form.journey_started} on={v => setField("journey_started", v)} testid="ed-journey-start"/>
                <Inp label="Grade" v={form.grade} on={v => setField("grade", v)} testid="ed-grade"/>
                <Inp label="Coaching Cost" v={form.coaching_cost} on={v => setField("coaching_cost", v)} testid="ed-coaching"/>
                <div className="sm:col-span-2"><Inp label="Pull Quote" v={form.pull_quote} on={v => setField("pull_quote", v)} testid="ed-quote"/></div>
                <div className="sm:col-span-2"><Inp label="Advice" v={form.advice} on={v => setField("advice", v)} testid="ed-advice"/></div>
                <div className="sm:col-span-2"><Inp label="Next Goal" v={form.next_goal} on={v => setField("next_goal", v)} testid="ed-goal"/></div>
                <div className="sm:col-span-2"><Inp label="Support System" v={form.support_system} on={v => setField("support_system", v)} testid="ed-support"/></div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-black/5">
                <button type="submit" data-testid="ed-save" className="btn-saffron">Save</button>
                <button type="button" onClick={closeEditor} className="px-6 py-3 rounded-full font-mont font-semibold border border-black/10 hover:bg-black/5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = "w-full bg-[#F5F5F5] px-4 py-3 rounded-md font-mont text-sm focus:outline-none focus:ring-2 focus:ring-saffron border-0";

function Inp({ label, v, on, type = "text", required, testid }) {
  return (
    <div>
      <label className="font-mont text-xs uppercase tracking-wider text-gray-500 mb-1 block">{label}{required && " *"}</label>
      <input data-testid={testid} type={type} required={required} value={v} onChange={e => on(e.target.value)} className={inp}/>
    </div>
  );
}
