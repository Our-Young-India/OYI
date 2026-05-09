import React, { useState, useMemo } from "react";
import api from "../lib/api";
import { toast } from "sonner";
import {
  X, CheckCircle2, XCircle, Mail, Eye, Search, Calendar, Mic,
  Send, Clock, Sparkles, Inbox, AlertCircle, Phone, MapPin,
  Award, Heart, Instagram, Youtube as YoutubeIcon, FileText, Save, Rocket
} from "lucide-react";

// Status pipeline definitions
export const STATUS_META = {
  pending: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800 border-yellow-300", dot: "🟡", emoji: "🟡" },
  approved: { label: "Approved", color: "bg-green-100 text-green-800 border-green-300", dot: "🟢", emoji: "🟢" },
  contacted: { label: "Contacted", color: "bg-blue-100 text-blue-800 border-blue-300", dot: "🔵", emoji: "🔵" },
  scheduled: { label: "Interview Scheduled", color: "bg-purple-100 text-purple-800 border-purple-300", dot: "🟣", emoji: "🟣" },
  in_production: { label: "In Production", color: "bg-orange-100 text-orange-800 border-orange-300", dot: "🎬", emoji: "🎬" },
  published: { label: "Published", color: "bg-emerald-100 text-emerald-800 border-emerald-300", dot: "✅", emoji: "✅" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800 border-red-300", dot: "🔴", emoji: "🔴" },
  needs_info: { label: "Needs Info", color: "bg-amber-100 text-amber-800 border-amber-300", dot: "ℹ️", emoji: "ℹ️" },
};

export const ALL_STATUSES = ["pending", "approved", "contacted", "scheduled", "in_production", "published", "rejected", "needs_info"];

const FIELDS = ["All", "Academics", "Sports", "Arts", "Technology", "Social Impact", "Entertainment", "Science", "Literature", "Other"];

// Email template generators (mailto: links)
function buildMailto(to, subject, body) {
  const params = new URLSearchParams();
  params.set("subject", subject);
  params.set("body", body);
  // mailto: handles + characters; plus signs are not auto-encoded by URLSearchParams in mailto context
  const qs = params.toString().replace(/\+/g, "%20");
  return `mailto:${encodeURIComponent(to || "")}?${qs}`;
}

function emailIfPossible(contactInfo) {
  if (!contactInfo) return "";
  const m = String(contactInfo).match(/[^\s,;]+@[^\s,;]+\.[^\s,;]+/);
  return m ? m[0] : "";
}

const TEMPLATES = {
  approve: (n) => ({
    subject: `🌟 You've been nominated for Our Young India!`,
    body: `Hi ${n.nominee_name},

Great news! You've been nominated to be featured on Our Young India — India's first child-led platform celebrating young achievers.

Your achievement: ${n.achievement_brief}
Nominated by: ${n.your_name} (${n.relationship})

We'd love to interview you and share your inspiring journey with thousands of kids across India. Are you interested?

Reply to this email or WhatsApp +91-73866 66077 to confirm and we'll set up a friendly chat with Sharanya (our 9-year-old founder & host).

Warmly,
— Sharanya & Team Our Young India`,
  }),
  follow_up: (n) => ({
    subject: `Following up — Our Young India interview`,
    body: `Hi ${n.nominee_name},

Just following up on our earlier email about featuring you on Our Young India. We'd love to hear back from you whenever you have a moment!

If you have any questions, please reply or reach us at hi@sharanyamena.com.

Warmly,
— Sharanya & Team`,
  }),
  request_info: (n) => ({
    subject: `More info needed — ${n.nominee_name} nomination`,
    body: `Hi ${n.your_name},

Thank you so much for nominating ${n.nominee_name}!

To move forward we'd love a bit more information:
1. Could you share more details about their achievement?
2. Photos, certificates, or news links?
3. A direct contact email/phone for ${n.nominee_name} or their parent?
4. Any social media links (Instagram, YouTube)?

Just reply to this email with these details and we'll take it from there.

Warmly,
— Team Our Young India`,
  }),
  reject: (n, reason) => ({
    subject: `Update on your nomination of ${n.nominee_name}`,
    body: `Hi ${n.your_name},

Thank you for taking the time to nominate ${n.nominee_name} for Our Young India. After careful review, we won't be able to feature this nomination at this time.

${reason ? `Reason: ${reason}\n\n` : ""}Please don't be discouraged — you can nominate again in the future, or share other young achievers you know.

With gratitude,
— Team Our Young India`,
  }),
  schedule: (n, dateStr, link) => ({
    subject: `🎤 Your Our Young India interview is scheduled!`,
    body: `Hi ${n.nominee_name},

Exciting! Your interview with Sharanya is scheduled.

📅 When: ${dateStr || "[Date/Time]"}
🔗 Link: ${link || "[Video call link]"}

The chat will be friendly and casual — about 15-25 minutes long. Sharanya will ask about your journey, the spark, the struggles, the support, and what's next.

Tips:
• Find a quiet spot with good lighting
• Have a glass of water nearby
• Be yourself — kids love hearing real stories!

Looking forward to meeting you!
— Sharanya & Team`,
  }),
};

// Action workflow per status
function getActionsForStatus(status) {
  switch (status) {
    case "pending":
      return ["approve", "request_info", "reject"];
    case "approved":
      return ["send_contact", "schedule", "reject"];
    case "contacted":
      return ["schedule", "follow_up", "not_interested"];
    case "scheduled":
      return ["mark_in_production", "reschedule", "send_reminder"];
    case "in_production":
      return ["publish_now"];
    case "needs_info":
      return ["approve", "reject"];
    case "rejected":
    case "published":
    default:
      return [];
  }
}

export default function NominationsPanel({ nominations, reload, openAddStory }) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterField, setFilterField] = useState("All");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [emailModal, setEmailModal] = useState(null); // { nom, action, subject, body, mailto, postStatus }
  const [rejectModal, setRejectModal] = useState(null);
  const [scheduleModal, setScheduleModal] = useState(null);

  const filtered = useMemo(() => {
    return nominations.filter(n => {
      const status = n.status === "new" ? "pending" : (n.status || "pending");
      if (filterStatus !== "all" && status !== filterStatus) return false;
      if (filterField !== "All" && n.field !== filterField) return false;
      if (search) {
        const s = search.toLowerCase();
        const hay = `${n.nominee_name} ${n.your_name} ${n.city} ${n.state} ${n.achievement_brief}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [nominations, filterStatus, filterField, search]);

  const counts = useMemo(() => {
    const c = { all: nominations.length };
    for (const s of ALL_STATUSES) c[s] = 0;
    for (const n of nominations) {
      const status = n.status === "new" ? "pending" : (n.status || "pending");
      c[status] = (c[status] || 0) + 1;
    }
    return c;
  }, [nominations]);

  const updateStatus = async (nom, newStatus, note = "") => {
    try {
      await api.put(`/nominations/${nom.id}`, { status: newStatus, note });
      toast.success(`Marked as ${STATUS_META[newStatus]?.label || newStatus}`);
      await reload();
      if (detail && detail.id === nom.id) {
        setDetail(d => d ? { ...d, status: newStatus } : d);
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Status update failed");
    }
  };

  const saveNotes = async (nom, internal_notes) => {
    try {
      await api.put(`/nominations/${nom.id}`, { internal_notes });
      toast.success("Notes saved");
      await reload();
    } catch (e) {
      toast.error("Save failed");
    }
  };

  // Handle action button click
  const handleAction = (nom, action) => {
    const status = nom.status === "new" ? "pending" : nom.status;
    const recipient = nom.your_email || emailIfPossible(nom.contact_info);

    switch (action) {
      case "approve": {
        const tpl = TEMPLATES.approve(nom);
        setEmailModal({
          nom, action, title: "Approve & Send Contact Email",
          ...tpl, to: recipient,
          postStatus: "approved", postNote: "Approved by admin",
        });
        break;
      }
      case "send_contact": {
        const tpl = TEMPLATES.approve(nom);
        setEmailModal({
          nom, action, title: "Send Contact Email",
          ...tpl, to: recipient,
          postStatus: "contacted", postNote: "Contacted via email",
        });
        break;
      }
      case "follow_up":
      case "send_reminder": {
        const tpl = TEMPLATES.follow_up(nom);
        setEmailModal({
          nom, action, title: "Send Follow-Up",
          ...tpl, to: recipient,
          postStatus: nom.status, postNote: "Follow-up sent",
        });
        break;
      }
      case "request_info": {
        const tpl = TEMPLATES.request_info(nom);
        setEmailModal({
          nom, action, title: "Request More Info",
          ...tpl, to: recipient,
          postStatus: "needs_info", postNote: "Requested more info from nominator",
        });
        break;
      }
      case "reject":
        setRejectModal({ nom });
        break;
      case "not_interested":
        updateStatus(nom, "rejected", "Nominee not interested");
        break;
      case "schedule":
      case "reschedule":
        setScheduleModal({ nom });
        break;
      case "mark_in_production":
        updateStatus(nom, "in_production", "Interview completed, in production");
        break;
      case "publish_now":
        // Pre-fill add-story form with nominee data, then mark published after admin saves
        if (typeof openAddStory === "function") {
          openAddStory({
            name: nom.nominee_name,
            age: nom.nominee_age,
            field: nom.field,
            achievement: nom.achievement_brief,
            hook: nom.achievement_brief?.slice(0, 80) || "",
            city: nom.city,
            state: nom.state,
            photo_url: nom.photo_url || "",
            tags: [],
            __nominationId: nom.id,
          });
          toast.info("Story form pre-filled. Save to publish, then mark published.");
        }
        break;
      default:
        break;
    }
  };

  return (
    <div data-testid="nominations-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-cinzel text-2xl font-bold">Nominations</h2>
          <p className="font-mont text-sm text-gray-500">{counts.all} total · {counts.pending} pending review</p>
        </div>
      </div>

      {/* Status pipeline summary */}
      <div className="mb-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { key: "all", label: "All" },
          ...ALL_STATUSES.map(s => ({ key: s, label: STATUS_META[s].label })),
        ].map(({ key, label }) => (
          <button
            key={key}
            data-testid={`status-tab-${key}`}
            onClick={() => setFilterStatus(key)}
            className={`text-xs font-mont rounded-lg px-3 py-2 border transition-all ${filterStatus === key ? "bg-saffron text-white border-saffron shadow-md" : "bg-white text-gray-700 border-black/10 hover:border-saffron/50"}`}
          >
            <span className="block font-semibold">{label}</span>
            <span className="block text-[11px] opacity-80">{counts[key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-black/5 p-4 mb-5 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            data-testid="nom-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, city, achievement…"
            className="w-full pl-10 pr-4 py-2 bg-[#F5F5F5] rounded-md font-mont text-sm focus:outline-none focus:ring-2 focus:ring-saffron"
          />
        </div>
        <select
          data-testid="nom-filter-field"
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
          className="px-4 py-2 bg-[#F5F5F5] rounded-md font-mont text-sm focus:outline-none focus:ring-2 focus:ring-saffron"
        >
          {FIELDS.map(f => <option key={f}>{f}</option>)}
        </select>
        {(filterStatus !== "all" || filterField !== "All" || search) && (
          <button
            data-testid="nom-clear-filters"
            onClick={() => { setFilterStatus("all"); setFilterField("All"); setSearch(""); }}
            className="text-xs text-gray-600 underline font-mont"
          >Clear</button>
        )}
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(n => (
          <NominationCard
            key={n.id}
            nom={n}
            onAction={(action) => handleAction(n, action)}
            onView={() => setDetail(n)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 text-center text-gray-500 py-10 font-mont">No nominations match these filters.</p>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <DetailModal
          nom={detail}
          onClose={() => setDetail(null)}
          onAction={(action) => handleAction(detail, action)}
          onSaveNotes={(notes) => saveNotes(detail, notes)}
          onChangeStatus={(s) => updateStatus(detail, s, "Status changed manually")}
        />
      )}

      {/* Email modal */}
      {emailModal && (
        <EmailModal
          {...emailModal}
          onClose={() => setEmailModal(null)}
          onSent={async () => {
            if (emailModal.postStatus && emailModal.postStatus !== emailModal.nom.status) {
              await updateStatus(emailModal.nom, emailModal.postStatus, emailModal.postNote || "");
            }
            setEmailModal(null);
          }}
        />
      )}

      {/* Reject modal */}
      {rejectModal && (
        <RejectModal
          nom={rejectModal.nom}
          onClose={() => setRejectModal(null)}
          onConfirm={async (reason, sendEmail) => {
            try {
              await api.put(`/nominations/${rejectModal.nom.id}`, {
                status: "rejected", note: reason || "Rejected", rejection_reason: reason,
              });
              toast.success("Nomination rejected");
              if (sendEmail) {
                const tpl = TEMPLATES.reject(rejectModal.nom, reason);
                window.location.href = buildMailto(rejectModal.nom.your_email, tpl.subject, tpl.body);
              }
              await reload();
              setRejectModal(null);
            } catch {
              toast.error("Reject failed");
            }
          }}
        />
      )}

      {/* Schedule modal */}
      {scheduleModal && (
        <ScheduleModal
          nom={scheduleModal.nom}
          onClose={() => setScheduleModal(null)}
          onConfirm={async (date, link, sendEmail) => {
            try {
              await api.put(`/nominations/${scheduleModal.nom.id}`, {
                status: "scheduled", note: `Interview ${date}`,
                interview_date: date, interview_link: link,
              });
              toast.success("Interview scheduled");
              if (sendEmail) {
                const tpl = TEMPLATES.schedule(scheduleModal.nom, date, link);
                const recipient = scheduleModal.nom.your_email || emailIfPossible(scheduleModal.nom.contact_info);
                window.location.href = buildMailto(recipient, tpl.subject, tpl.body);
              }
              await reload();
              setScheduleModal(null);
            } catch {
              toast.error("Schedule failed");
            }
          }}
        />
      )}
    </div>
  );
}

// ======================== Card ========================
function NominationCard({ nom, onAction, onView }) {
  const status = nom.status === "new" ? "pending" : (nom.status || "pending");
  const meta = STATUS_META[status];
  const actions = getActionsForStatus(status);

  return (
    <div data-testid={`nomination-card-${nom.id}`} className="bg-white rounded-2xl p-5 border border-black/5 hover:border-saffron/30 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-2 gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-cinzel font-bold text-lg text-[#1a1a1a] truncate">{nom.nominee_name}</h3>
          <p className="font-mont text-xs text-gray-500">{nom.nominee_age} yrs · {nom.field} · {nom.city}, {nom.state}</p>
        </div>
        <span data-testid={`nom-status-${nom.id}`} className={`text-[10px] font-mont font-semibold uppercase tracking-wider px-2 py-1 rounded-full border ${meta.color} whitespace-nowrap`}>
          {meta.dot} {meta.label}
        </span>
      </div>

      <p className="font-mont text-sm text-gray-700 mb-2 line-clamp-2">{nom.achievement_brief}</p>

      <div className="font-mont text-xs text-gray-500 space-y-0.5 mb-4">
        <p><strong>Why feature:</strong> {nom.why_feature?.slice(0, 100)}{nom.why_feature?.length > 100 ? "…" : ""}</p>
        <p><strong>Nominator:</strong> {nom.your_name} ({nom.relationship}) · {nom.your_email}</p>
        <p><strong>Contact:</strong> {nom.contact_info}</p>
      </div>

      {/* Action buttons */}
      <div className="border-t border-black/5 pt-3 flex flex-wrap gap-2">
        {actions.includes("approve") && (
          <ActionBtn testid={`approve-${nom.id}`} onClick={() => onAction("approve")} icon={CheckCircle2} label="Approve" color="green" />
        )}
        {actions.includes("send_contact") && (
          <ActionBtn testid={`contact-${nom.id}`} onClick={() => onAction("send_contact")} icon={Send} label="Send Contact" color="blue" />
        )}
        {actions.includes("schedule") && (
          <ActionBtn testid={`schedule-${nom.id}`} onClick={() => onAction("schedule")} icon={Calendar} label="Schedule" color="purple" />
        )}
        {actions.includes("reschedule") && (
          <ActionBtn testid={`reschedule-${nom.id}`} onClick={() => onAction("reschedule")} icon={Calendar} label="Reschedule" color="purple" />
        )}
        {actions.includes("send_reminder") && (
          <ActionBtn testid={`remind-${nom.id}`} onClick={() => onAction("send_reminder")} icon={Send} label="Send Reminder" color="blue" />
        )}
        {actions.includes("follow_up") && (
          <ActionBtn testid={`followup-${nom.id}`} onClick={() => onAction("follow_up")} icon={Send} label="Follow Up" color="blue" />
        )}
        {actions.includes("mark_in_production") && (
          <ActionBtn testid={`production-${nom.id}`} onClick={() => onAction("mark_in_production")} icon={Mic} label="Mark Done" color="orange" />
        )}
        {actions.includes("publish_now") && (
          <ActionBtn testid={`publish-${nom.id}`} onClick={() => onAction("publish_now")} icon={Rocket} label="Ready to Publish" color="green" />
        )}
        {actions.includes("request_info") && (
          <ActionBtn testid={`info-${nom.id}`} onClick={() => onAction("request_info")} icon={Mail} label="Request Info" color="amber" />
        )}
        {actions.includes("not_interested") && (
          <ActionBtn testid={`notinterested-${nom.id}`} onClick={() => onAction("not_interested")} icon={XCircle} label="Not Interested" color="red" />
        )}
        {actions.includes("reject") && (
          <ActionBtn testid={`reject-${nom.id}`} onClick={() => onAction("reject")} icon={XCircle} label="Reject" color="red" />
        )}
        <button data-testid={`view-${nom.id}`} onClick={onView} className="ml-auto inline-flex items-center gap-1.5 text-xs font-mont font-semibold text-gray-700 hover:text-saffron px-3 py-1.5 rounded-md hover:bg-saffron/5 transition-all">
          <Eye size={14}/> Details
        </button>
      </div>
    </div>
  );
}

const COLOR_CLASSES = {
  green: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
  blue: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
  red: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
  purple: "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
  orange: "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200",
  amber: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
};

function ActionBtn({ onClick, icon: Icon, label, color, testid }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-mont font-semibold px-3 py-1.5 rounded-md border transition-all ${COLOR_CLASSES[color] || COLOR_CLASSES.blue}`}
    >
      <Icon size={13}/> {label}
    </button>
  );
}

// ======================== Detail Modal ========================
function DetailModal({ nom, onClose, onAction, onSaveNotes, onChangeStatus }) {
  const [notes, setNotes] = useState(nom.internal_notes || "");
  const status = nom.status === "new" ? "pending" : (nom.status || "pending");
  const meta = STATUS_META[status];
  const actions = getActionsForStatus(status);

  return (
    <div data-testid="nom-detail-modal" className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-10 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black/5 p-5 flex items-center justify-between z-10">
          <div>
            <h2 className="font-cinzel text-2xl font-bold">{nom.nominee_name}</h2>
            <p className="font-mont text-xs text-gray-500">Nomination Details</p>
          </div>
          <button onClick={onClose} data-testid="close-detail" className="text-gray-500 hover:text-[#1a1a1a]"><X size={20}/></button>
        </div>

        <div className="p-6 space-y-6 font-mont text-sm">
          {/* Status pill + change dropdown */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border ${meta.color}`}>
              {meta.dot} {meta.label}
            </span>
            <select
              data-testid="detail-change-status"
              value={status}
              onChange={(e) => onChangeStatus(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-md bg-[#F5F5F5] border-0 font-semibold focus:outline-none focus:ring-2 focus:ring-saffron"
            >
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_META[s].emoji} {STATUS_META[s].label}</option>
              ))}
            </select>
          </div>

          {/* Nominee info */}
          <Section icon={Award} title="Nominee Info">
            <KV label="Name" value={nom.nominee_name}/>
            <KV label="Age" value={`${nom.nominee_age} years`}/>
            <KV label="Field" value={nom.field}/>
            <KV label="Location" value={`${nom.city}, ${nom.state}`}/>
            <KV label="Contact" value={nom.contact_info} icon={Phone}/>
            {nom.instagram && <KV label="Instagram" value={nom.instagram} icon={Instagram}/>}
            {nom.youtube && <KV label="YouTube" value={nom.youtube} icon={YoutubeIcon}/>}
            {nom.photo_url && (
              <div className="mt-3">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Photo</p>
                <img src={`${process.env.REACT_APP_BACKEND_URL}${nom.photo_url}`} alt="" className="max-w-[200px] rounded-md border border-black/10"/>
              </div>
            )}
          </Section>

          <Section icon={Sparkles} title="Achievement">
            <p className="text-gray-700 whitespace-pre-wrap">{nom.achievement_brief}</p>
          </Section>

          <Section icon={Heart} title="Why Feature">
            <p className="text-gray-700 whitespace-pre-wrap">{nom.why_feature}</p>
          </Section>

          <Section icon={Mail} title="Nominator">
            <KV label="Name" value={nom.your_name}/>
            <KV label="Relationship" value={nom.relationship}/>
            <KV label="Email" value={nom.your_email}/>
          </Section>

          {nom.interview_date && (
            <Section icon={Calendar} title="Interview">
              <KV label="Date" value={nom.interview_date}/>
              {nom.interview_link && <KV label="Link" value={nom.interview_link}/>}
            </Section>
          )}

          {/* Status history */}
          <Section icon={Clock} title="Status History">
            <ol className="space-y-3 border-l-2 border-saffron/30 pl-4">
              {(nom.status_history || []).map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[22px] top-0.5 w-3 h-3 rounded-full bg-saffron border-2 border-white shadow"/>
                  <p className="text-xs font-semibold text-[#1a1a1a]">
                    {STATUS_META[h.status]?.emoji || "•"} {STATUS_META[h.status]?.label || h.status}
                  </p>
                  {h.note && <p className="text-xs text-gray-600">{h.note}</p>}
                  <p className="text-[11px] text-gray-400">{new Date(h.timestamp).toLocaleString()}</p>
                </li>
              ))}
            </ol>
          </Section>

          {/* Internal notes */}
          <Section icon={FileText} title="Internal Notes (private)">
            <textarea
              data-testid="detail-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add private admin notes…"
              className="w-full bg-[#F5F5F5] px-4 py-3 rounded-md font-mont text-sm focus:outline-none focus:ring-2 focus:ring-saffron resize-none"
            />
            <button data-testid="save-notes" onClick={() => onSaveNotes(notes)} className="mt-2 inline-flex items-center gap-2 text-xs font-mont font-semibold bg-saffron text-white px-4 py-2 rounded-md hover:brightness-105">
              <Save size={14}/> Save Notes
            </button>
          </Section>

          {/* Quick actions */}
          {actions.length > 0 && (
            <div className="border-t border-black/5 pt-5">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2"><AlertCircle size={12}/> Action Needed</p>
              <div className="flex flex-wrap gap-2">
                {actions.map(a => (
                  <ActionBtn
                    key={a}
                    testid={`detail-${a}`}
                    onClick={() => onAction(a)}
                    icon={ACTION_ICON[a] || Mail}
                    label={ACTION_LABEL[a] || a}
                    color={ACTION_COLOR[a] || "blue"}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ACTION_ICON = {
  approve: CheckCircle2, send_contact: Send, schedule: Calendar, reschedule: Calendar,
  send_reminder: Send, follow_up: Send, mark_in_production: Mic, publish_now: Rocket,
  request_info: Mail, not_interested: XCircle, reject: XCircle,
};
const ACTION_LABEL = {
  approve: "Approve", send_contact: "Send Contact", schedule: "Schedule", reschedule: "Reschedule",
  send_reminder: "Send Reminder", follow_up: "Follow Up", mark_in_production: "Mark Done",
  publish_now: "Ready to Publish", request_info: "Request Info", not_interested: "Not Interested", reject: "Reject",
};
const ACTION_COLOR = {
  approve: "green", send_contact: "blue", schedule: "purple", reschedule: "purple",
  send_reminder: "blue", follow_up: "blue", mark_in_production: "orange", publish_now: "green",
  request_info: "amber", not_interested: "red", reject: "red",
};

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <h3 className="font-cinzel font-bold text-base text-[#1a1a1a] mb-2 flex items-center gap-2">
        <Icon size={16} className="text-saffron"/> {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function KV({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="font-semibold text-gray-600 min-w-[100px]">{label}:</span>
      <span className="text-[#1a1a1a] flex items-center gap-1.5 break-all">{Icon && <Icon size={12} className="text-gray-400"/>} {value || "—"}</span>
    </div>
  );
}

// ======================== Email Modal ========================
function EmailModal({ title, subject, body, to, onClose, onSent }) {
  const [editSubject, setEditSubject] = useState(subject);
  const [editBody, setEditBody] = useState(body);

  const send = () => {
    const url = buildMailto(to, editSubject, editBody);
    window.open(url, "_blank");
    onSent();
  };
  const copyForWa = () => {
    navigator.clipboard.writeText(`${editSubject}\n\n${editBody}`);
    toast.success("Copied — paste into WhatsApp");
    onSent();
  };

  return (
    <div data-testid="email-modal" className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full my-10 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black/5 p-5 flex items-center justify-between">
          <h2 className="font-cinzel text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-3 font-mont text-sm">
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 mb-1 block">To</label>
            <input value={to || ""} readOnly className="w-full bg-[#F5F5F5] px-3 py-2 rounded-md text-sm"/>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 mb-1 block">Subject</label>
            <input data-testid="email-subject" value={editSubject} onChange={e => setEditSubject(e.target.value)} className="w-full bg-[#F5F5F5] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-saffron"/>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 mb-1 block">Body</label>
            <textarea data-testid="email-body" value={editBody} onChange={e => setEditBody(e.target.value)} rows={12} className="w-full bg-[#F5F5F5] px-3 py-2 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-saffron"/>
          </div>
        </div>
        <div className="border-t border-black/5 p-4 flex gap-2 justify-end flex-wrap">
          <button onClick={onClose} data-testid="email-cancel" className="px-4 py-2 rounded-md font-mont text-sm border border-black/10 hover:bg-black/5">Cancel</button>
          <button onClick={copyForWa} data-testid="email-copy-wa" className="px-4 py-2 rounded-md font-mont text-sm bg-india-green text-white hover:brightness-110 inline-flex items-center gap-2">📱 Copy for WhatsApp</button>
          <button onClick={send} data-testid="email-send" className="btn-saffron text-sm inline-flex items-center gap-2"><Send size={14}/> Open Email</button>
        </div>
      </div>
    </div>
  );
}

// ======================== Reject Modal ========================
function RejectModal({ nom, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [extra, setExtra] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const reasons = [
    "", "Doesn't fit platform mission", "Insufficient information",
    "Out of age range", "Duplicate submission", "Other",
  ];
  const finalReason = reason === "Other" ? extra : (reason ? `${reason}${extra ? ` — ${extra}` : ""}` : extra);

  return (
    <div data-testid="reject-modal" className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="border-b border-black/5 p-5 flex items-center justify-between">
          <h2 className="font-cinzel text-xl font-bold">Reject Nomination</h2>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="p-5 space-y-3 font-mont text-sm">
          <p className="text-gray-600">Rejecting <strong>{nom.nominee_name}</strong>.</p>
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 mb-1 block">Reason</label>
            <select data-testid="reject-reason" value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-[#F5F5F5] px-3 py-2 rounded-md">
              <option value="">— Select —</option>
              {reasons.filter(r => r).map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 mb-1 block">Additional notes</label>
            <textarea data-testid="reject-notes" value={extra} onChange={e => setExtra(e.target.value)} rows={3} className="w-full bg-[#F5F5F5] px-3 py-2 rounded-md resize-none"/>
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input data-testid="reject-send-email" type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="accent-[#FF9933]"/>
            Send polite rejection email to nominator
          </label>
        </div>
        <div className="border-t border-black/5 p-4 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md font-mont text-sm border border-black/10">Cancel</button>
          <button data-testid="reject-confirm" onClick={() => onConfirm(finalReason, sendEmail)} className="px-4 py-2 rounded-md font-mont text-sm bg-red-600 text-white hover:bg-red-700">Confirm Reject</button>
        </div>
      </div>
    </div>
  );
}

// ======================== Schedule Modal ========================
function ScheduleModal({ nom, onClose, onConfirm }) {
  const [date, setDate] = useState("");
  const [link, setLink] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

  return (
    <div data-testid="schedule-modal" className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="border-b border-black/5 p-5 flex items-center justify-between">
          <h2 className="font-cinzel text-xl font-bold">Schedule Interview</h2>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="p-5 space-y-3 font-mont text-sm">
          <p className="text-gray-600">For <strong>{nom.nominee_name}</strong></p>
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 mb-1 block">Date & Time</label>
            <input data-testid="schedule-date" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#F5F5F5] px-3 py-2 rounded-md"/>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 mb-1 block">Meeting Link (Google Meet, Zoom, etc.)</label>
            <input data-testid="schedule-link" value={link} onChange={e => setLink(e.target.value)} placeholder="https://meet.google.com/…" className="w-full bg-[#F5F5F5] px-3 py-2 rounded-md"/>
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input data-testid="schedule-send-email" type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="accent-[#FF9933]"/>
            Send confirmation email
          </label>
        </div>
        <div className="border-t border-black/5 p-4 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md font-mont text-sm border border-black/10">Cancel</button>
          <button
            data-testid="schedule-confirm"
            onClick={() => onConfirm(date ? new Date(date).toLocaleString() : "", link, sendEmail)}
            disabled={!date}
            className="btn-saffron text-sm disabled:opacity-50"
          >Confirm</button>
        </div>
      </div>
    </div>
  );
}
