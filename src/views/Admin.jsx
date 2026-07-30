import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowUpRight, Check, Image as ImageIcon, LogOut, Mail, Pencil, Plus, Trash2, Upload,
  LayoutDashboard, FolderKanban, Sparkles, Calendar, ExternalLink, Menu, X
} from "lucide-react";
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query,
  serverTimestamp, updateDoc, setDoc
} from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db, firebaseReady } from "../firebase";
import { services } from "../constants";
import BeforeAfterSlider from "../components/BeforeAfterSlider";

const emptyProject = {
  title: "", category: "Short-form editing", year: String(new Date().getFullYear()),
  description: "", mediaType: "image", mediaUrl: "", featured: false, published: true, isReel: false, order: 1, accent: "#ff6038"
};

function Brand() {
  return (
    <a className="brand" href="/">
      <span className="brand-play">▶</span>FIRST CUT<span>.</span>
    </a>
  );
}

function Arrow() {
  return <ArrowUpRight size={17} />;
}

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [draft, setDraft] = useState(emptyProject);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState("dashboard"); // Default is dashboard
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Spotlight States
  const [spotlightDraft, setSpotlightDraft] = useState({
    beforeUrl: "",
    beforeType: "image",
    afterUrl: "",
    afterType: "image"
  });
  const [spotlightUploading, setSpotlightUploading] = useState({ before: false, after: false });
  const [spotlightMessage, setSpotlightMessage] = useState("");

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const a = onSnapshot(query(collection(db, "projects"), orderBy("order", "asc")), s => setProjects(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const b = onSnapshot(query(collection(db, "inquiries"), orderBy("createdAt", "desc")), s => setInquiries(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const c = onSnapshot(query(collection(db, "meetings"), orderBy("createdAt", "desc")), s => setMeetings(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    // Load spotlight settings
    const spotlightRef = doc(db, "settings", "spotlight");
    const unsubscribeSpotlight = onSnapshot(spotlightRef, (docSnap) => {
      if (docSnap.exists()) {
        setSpotlightDraft(docSnap.data());
      }
    });

    return () => {
      a();
      b();
      c();
      unsubscribeSpotlight();
    };
  }, [user]);

  async function login(e) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setMessage("Signing in…");
    try {
      await signInWithEmailAndPassword(auth, String(d.get("email")), String(d.get("password")));
      setMessage("");
    } catch {
      setMessage("Sign-in failed. Check your Firebase account and password.");
    }
  }

  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloud || !preset) {
      setMessage("Add Cloudinary variables in .env or Netlify first.");
      return;
    }
    setUploading(true);
    setMessage("Uploading media…");
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", preset);
      data.append("folder", "first-cut/projects");
      const type = file.type.startsWith("video/") ? "video" : "image";
      const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${type}/upload`, { method: "POST", body: data });
      if (!r.ok) throw 0;
      const result = await r.json();
      setDraft({ ...draft, mediaUrl: result.secure_url, mediaType: type });
      setMessage("Upload complete.");
    } catch {
      setMessage("Upload failed. Confirm your unsigned Cloudinary preset.");
    } finally {
      setUploading(false);
    }
  }

  // Cloudinary Upload for Spotlight
  async function uploadSpotlight(e, slot) {
    const file = e.target.files?.[0];
    if (!file) return;
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloud || !preset) {
      setSpotlightMessage("Add Cloudinary variables in .env or Netlify first.");
      return;
    }
    setSpotlightUploading(prev => ({ ...prev, [slot]: true }));
    setSpotlightMessage(`Uploading ${slot} media…`);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", preset);
      data.append("folder", "first-cut/spotlight");
      const type = file.type.startsWith("video/") ? "video" : "image";
      const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${type}/upload`, { method: "POST", body: data });
      if (!r.ok) throw 0;
      const result = await r.json();
      setSpotlightDraft(prev => ({
        ...prev,
        [`${slot}Url`]: result.secure_url,
        [`${slot}Type`]: type
      }));
      setSpotlightMessage(`${slot === "before" ? "Raw" : "Graded"} media upload complete.`);
    } catch {
      setSpotlightMessage("Upload failed. Check your Cloudinary preset.");
    } finally {
      setSpotlightUploading(prev => ({ ...prev, [slot]: false }));
    }
  }

  async function saveSpotlight(e) {
    e.preventDefault();
    setSpotlightMessage("Saving spotlight settings…");
    try {
      await setDoc(doc(db, "settings", "spotlight"), spotlightDraft);
      setSpotlightMessage("Spotlight settings saved successfully!");
    } catch {
      setSpotlightMessage("Could not save settings. Verify Firestore security rules.");
    }
  }

  async function save(e) {
    e.preventDefault();
    setMessage("Saving…");
    try {
      if (editing) {
        await updateDoc(doc(db, "projects", editing), { ...draft, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "projects"), { ...draft, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      setDraft({ ...emptyProject, order: projects.length + 1 });
      setEditing(null);
      setMessage("Project saved. The public portfolio updates automatically.");
    } catch {
      setMessage("Could not save. Check Firestore rules.");
    }
  }

  async function remove(p) {
    if (!confirm(`Delete “${p.title}”?`)) return;
    await deleteDoc(doc(db, "projects", p.id));
  }

  function edit(p) {
    const { id, ...rest } = p;
    setDraft(rest);
    setEditing(id);
    scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) return <div className="admin-center">Loading First Cut…</div>;
  
  if (!firebaseReady) {
    return (
      <div className="admin-center">
        <Brand />
        <p className="eyebrow">Admin setup required</p>
        <h1>CONNECT FIREBASE<br />& CLOUDINARY.</h1>
        <p>Add the variables from <code>.env.example</code> in Netlify, enable Firebase Email/Password authentication, create the owner account, and deploy again.</p>
        <div className="setup-grid">
          <span>01 Firebase Auth</span>
          <span>02 Firestore</span>
          <span>03 Cloudinary preset</span>
          <span>04 Netlify variables</span>
        </div>
        <a className="button dark" href="/">Back to portfolio</a>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-center login">
        <Brand />
        <form onSubmit={login}>
          <p className="eyebrow">Owner access</p>
          <h1>ADMIN SIGN IN.</h1>
          <label>Email<input name="email" type="email" required /></label>
          <label>Password<input name="password" type="password" required /></label>
          <button className="button dark">Sign in <Arrow /></button>
          {message && <p>{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <button className="admin-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      <aside className={`admin-sidebar ${mobileMenuOpen ? "admin-sidebar--open" : ""}`}>
        <div className="sidebar-brand">
          <Brand />
          <span className="sidebar-subtitle">Studio Manager</span>
        </div>
        
        <nav className="admin-sidebar-nav">
          <button className={tab === "dashboard" ? "active" : ""} onClick={() => { setTab("dashboard"); setMobileMenuOpen(false); }}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={tab === "projects" ? "active" : ""} onClick={() => { setTab("projects"); setMobileMenuOpen(false); }}>
            <FolderKanban size={18} /> Projects <span className="nav-badge">{projects.length}</span>
          </button>
          <button className={tab === "spotlight" ? "active" : ""} onClick={() => { setTab("spotlight"); setMobileMenuOpen(false); }}>
            <Sparkles size={18} /> Spotlight
          </button>
          <button className={tab === "inquiries" ? "active" : ""} onClick={() => { setTab("inquiries"); setMobileMenuOpen(false); }}>
            <Mail size={18} /> Orders <span className="nav-badge">{inquiries.length}</span>
          </button>
          <button className={tab === "meetings" ? "active" : ""} onClick={() => { setTab("meetings"); setMobileMenuOpen(false); }}>
            <Calendar size={18} /> Meetings <span className="nav-badge">{meetings.length}</span>
          </button>
        </nav>
        
        <div className="admin-sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> View site
          </a>
          <button onClick={() => signOut(auth)}>
            <LogOut size={16} /> Sign out
          </button>
          <small className="user-email">{user.email}</small>
        </div>
      </aside>
      
      <main className="admin-main">
        <header className="admin-main-header">
          <div>
            <span className="eyebrow">First Cut Studio</span>
            <h1>{tab === "dashboard" ? "Good morning, Admin." : tab.toUpperCase()}</h1>
            <p>
              {tab === "dashboard" && "Manage the content that makes your video editing portfolio stand out."}
              {tab === "projects" && "Publish, organize, and edit your portfolio work."}
              {tab === "spotlight" && "Configure raw versus color graded video/image comparisons."}
              {tab === "inquiries" && "Review client project inquiries and orders."}
              {tab === "meetings" && "Manage booked client scheduling and calls."}
            </p>
          </div>
          {tab === "projects" && !editing && (
            <button className="button primary" onClick={() => {
              const element = document.querySelector(".editor");
              if (element) {
                scrollTo({ top: element.offsetTop - 40, behavior: "smooth" });
              }
            }}>
              <Plus size={16} /> New project
            </button>
          )}
        </header>
        
        {/* DASHBOARD TAB WITH PREMIUM GRAPHS */}
        {tab === "dashboard" && (
          <DashboardView 
            projects={projects} 
            inquiries={inquiries} 
            meetings={meetings} 
            setTab={setTab} 
          />
        )}
        
        {/* SPOTLIGHT TAB FOR MANAGING THE BEFORE/AFTER SLIDER */}
        {tab === "spotlight" && (
          <section className="spotlight-manager">
            <div className="editor">
              <div className="editor-head">
                <div>
                  <p className="eyebrow">Interactive Spotlight</p>
                  <h2>RAW VS GRADED EDIT</h2>
                </div>
              </div>
              
              <form onSubmit={saveSpotlight} className="form-grid">
                {/* Raw / Before Media */}
                <div className="upload-box">
                  <h3>1. RAW MEDIA (BEFORE)</h3>
                  <label className="upload">
                    <Upload />
                    <b>{spotlightUploading.before ? "Uploading..." : spotlightDraft.beforeUrl ? "Replace Raw Media" : "Upload Raw Media"}</b>
                    <span>JPG, PNG, WebP, MP4, MOV</span>
                    <input type="file" accept="image/*,video/*" onChange={e => uploadSpotlight(e, "before")} />
                  </label>
                  {spotlightDraft.beforeUrl && (
                    <div className="preview">
                      {spotlightDraft.beforeType === "video" ? (
                        <video src={spotlightDraft.beforeUrl} controls muted />
                      ) : (
                        <img src={spotlightDraft.beforeUrl} alt="Raw Preview" />
                      )}
                    </div>
                  )}
                </div>
                
                {/* Graded / After Media */}
                <div className="upload-box">
                  <h3>2. GRADED MEDIA (AFTER)</h3>
                  <label className="upload">
                    <Upload />
                    <b>{spotlightUploading.after ? "Uploading..." : spotlightDraft.afterUrl ? "Replace Graded Media" : "Upload Graded Media"}</b>
                    <span>JPG, PNG, WebP, MP4, MOV</span>
                    <input type="file" accept="image/*,video/*" onChange={e => uploadSpotlight(e, "after")} />
                  </label>
                  {spotlightDraft.afterUrl && (
                    <div className="preview">
                      {spotlightDraft.afterType === "video" ? (
                        <video src={spotlightDraft.afterUrl} controls muted />
                      ) : (
                        <img src={spotlightDraft.afterUrl} alt="Graded Preview" />
                      )}
                    </div>
                  )}
                </div>
                
                <div className="full live-preview-box">
                  <h3>LIVE PREVIEW</h3>
                  <div className="spotlight-slider-wrapper">
                    <BeforeAfterSlider 
                      beforeUrl={spotlightDraft.beforeUrl}
                      beforeType={spotlightDraft.beforeType}
                      afterUrl={spotlightDraft.afterUrl}
                      afterType={spotlightDraft.afterType}
                    />
                  </div>
                </div>
                
                <div className="editor-foot full">
                  <button className="button primary" type="submit">Save Spotlight Configuration</button>
                  <span>{spotlightMessage}</span>
                </div>
              </form>
            </div>
          </section>
        )}
        
        {tab === "projects" && (
          <>
            <form className="editor" onSubmit={save}>
              <div className="editor-head">
                <div>
                  <p className="eyebrow">{editing ? "Editing project" : "New project"}</p>
                  <h2>{editing ? draft.title : "ADD PORTFOLIO WORK"}</h2>
                </div>
                {editing && (
                  <button type="button" onClick={() => { setEditing(null); setDraft(emptyProject); }}>Cancel edit</button>
                )}
              </div>
              
              <div className="form-grid">
                <label>Title<input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} required /></label>
                <label>Category
                  <select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}>
                    {services.map(s => <option key={s[1]}>{s[1]}</option>)}
                  </select>
                </label>
                <label>Year<input value={draft.year} onChange={e => setDraft({ ...draft, year: e.target.value })} required /></label>
                <label>Display order<input type="number" min="1" value={draft.order} onChange={e => setDraft({ ...draft, order: Number(e.target.value) })} /></label>
                <label className="full">Description<textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} minLength={20} required /></label>
                
                <label className="upload full">
                  <Upload />
                  <b>{uploading ? "Uploading…" : draft.mediaUrl ? "Replace image or video" : "Upload project image or video"}</b>
                  <span>JPG, PNG, WebP, MP4 or MOV</span>
                  <input type="file" accept="image/*,video/*" onChange={upload} />
                </label>
                
                {draft.mediaUrl && (
                  <div className="preview full">
                    {draft.mediaType === "video" ? <video src={draft.mediaUrl} controls /> : <img src={draft.mediaUrl} alt="" />}
                  </div>
                )}
                
                <label className="check">
                  <input type="checkbox" checked={draft.isReel || false} onChange={e => setDraft({ ...draft, isReel: e.target.checked })} /> Reel / Portrait Video (9:16 Vertical View)
                </label>
                <label className="check">
                  <input type="checkbox" checked={draft.featured} onChange={e => setDraft({ ...draft, featured: e.target.checked })} /> Featured project
                </label>
                <label className="check">
                  <input type="checkbox" checked={draft.published} onChange={e => setDraft({ ...draft, published: e.target.checked })} /> Published
                </label>
              </div>
              
              <div className="editor-foot">
                <button className="button primary"><Plus size={17} />{editing ? "Update project" : "Publish project"}</button>
                <span>{message}</span>
              </div>
            </form>
            
            <AdminProjects items={projects} edit={edit} remove={remove} />
          </>
        )}
        
        {tab === "inquiries" && <LeadList items={inquiries} type="inquiries" />}
        {tab === "meetings" && <LeadList items={meetings} type="meetings" />}
      </main>
    </div>
  );
}

function DashboardView({ projects, inquiries, meetings, setTab }) {
  const newInquiries = inquiries.filter(i => i.status === "new").length;
  const newMeetings = meetings.filter(m => m.status === "new").length;

  // Process project categories data for SVG chart
  const categoriesData = useMemo(() => {
    const counts = services.reduce((acc, s) => {
      acc[s[1]] = 0;
      return acc;
    }, {});
    
    projects.forEach(p => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });

    const maxCount = Math.max(...Object.values(counts), 1);
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percent: (count / projects.length) * 100 || 0,
      relativePercent: (count / maxCount) * 100 || 0
    }));
  }, [projects]);

  // Process recent inquiry timelines
  const inquiriesSummary = useMemo(() => {
    const total = inquiries.length;
    const read = inquiries.filter(i => i.status === "read").length;
    const pending = total - read;
    return { total, read, pending };
  }, [inquiries]);

  return (
    <section className="dashboard-view">
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card" onClick={() => setTab("projects")}>
          <small>Total Projects</small>
          <h2>{projects.length}</h2>
          <span className="badge">{projects.filter(p => p.published).length} Published</span>
        </div>
        
        <div className="metric-card alertable" onClick={() => setTab("inquiries")}>
          <small>Inquiries / Orders</small>
          <h2>{inquiries.length}</h2>
          {newInquiries > 0 ? (
            <span className="badge warning">{newInquiries} Action Required</span>
          ) : (
            <span className="badge success">All Clean</span>
          )}
        </div>

        <div className="metric-card alertable" onClick={() => setTab("meetings")}>
          <small>Booked Meetings</small>
          <h2>{meetings.length}</h2>
          {newMeetings > 0 ? (
            <span className="badge warning">{newMeetings} Action Required</span>
          ) : (
            <span className="badge success">All Clean</span>
          )}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-grid">
        {/* Category breakdown bar graph */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>PROJECT CATEGORIES</h3>
            <small>Work distribution</small>
          </div>
          <div className="bar-chart-vertical">
            {categoriesData.map(d => (
              <div className="bar-row" key={d.name}>
                <div className="bar-label">
                  <span>{d.name}</span>
                  <strong>{d.count}</strong>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${d.relativePercent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Conversion Pipeline */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>INQUIRY PIPELINE</h3>
            <small>Status & conversions</small>
          </div>
          
          <div className="pipeline-graph">
            {/* SVG Pie/Donut Chart */}
            <div className="donut-wrapper">
              <svg viewBox="0 0 100 100" width="120" height="120">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#2a2927" strokeWidth="12" />
                {inquiriesSummary.total > 0 && (
                  <>
                    {/* Read segment */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="#8f72ff" 
                      strokeWidth="12" 
                      strokeDasharray={`${(inquiriesSummary.read / inquiriesSummary.total) * 251.2} 251.2`}
                      transform="rotate(-90 50 50)"
                    />
                    {/* New segment (starts after read segment) */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="#ff6038" 
                      strokeWidth="12" 
                      strokeDasharray={`${(inquiriesSummary.pending / inquiriesSummary.total) * 251.2} 251.2`}
                      transform={`rotate(${-90 + (inquiriesSummary.read / inquiriesSummary.total) * 360} 50 50)`}
                    />
                  </>
                )}
              </svg>
              <div className="donut-center">
                <span>{inquiriesSummary.total}</span>
                <small>leads</small>
              </div>
            </div>

            <div className="pipeline-legend">
              <div className="legend-item">
                <span className="dot warning-dot" />
                <span>New Requests:</span>
                <strong>{inquiriesSummary.pending}</strong>
              </div>
              <div className="legend-item">
                <span className="dot primary-dot" />
                <span>Replied/Read:</span>
                <strong>{inquiriesSummary.read}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminProjects({ items, edit, remove }) {
  return (
    <section className="admin-list">
      <div className="list-head">
        <h2>ALL PROJECTS</h2>
        <span>{items.filter(i => i.published).length} live</span>
      </div>
      {items.length ? (
        items.map(p => (
          <article key={p.id}>
            <div className="thumb">
              {p.mediaUrl ? (
                p.mediaType === "video" ? <video src={p.mediaUrl} /> : <img src={p.mediaUrl} alt="" />
              ) : (
                <ImageIcon />
              )}
            </div>
            <div>
              <small>{p.category} / {p.year}</small>
              <h3>{p.title}</h3>
              <p>{p.published ? "Published" : "Draft"} {p.featured ? "• Featured" : ""}</p>
            </div>
            <span>#{p.order}</span>
            <button onClick={() => edit(p)}><Pencil size={16} /> Edit</button>
            <button className="danger" onClick={() => remove(p)}><Trash2 size={16} /> Delete</button>
          </article>
        ))
      ) : (
        <p className="empty">No projects yet.</p>
      )}
    </section>
  );
}

function LeadList({ items, type }) {
  return (
    <section className="admin-list leads">
      <div className="list-head">
        <h2>{type === "meetings" ? "MEETING REQUESTS" : "CLIENT ORDERS"}</h2>
        <span>{items.filter(i => i.status === "new").length} new</span>
      </div>
      {items.length ? (
        items.map(item => (
          <article key={item.id}>
            <div className="avatar">{item.name?.[0] || "?"}</div>
            <div>
              <small>{item.service || `${item.date || ""} ${item.time || ""}`}</small>
              <h3>{item.name}</h3>
              <p>{item.email}</p>
              <p className="brief">{item.brief}</p>
            </div>
            <a href={`mailto:${item.email}`}><Mail size={16} /> Reply</a>
            {item.status === "new" && (
              <button onClick={() => updateDoc(doc(db, type, item.id), { status: "read" })}>
                <Check size={16} /> Mark read
              </button>
            )}
          </article>
        ))
      ) : (
        <p className="empty">New requests will appear here.</p>
      )}
    </section>
  );
}
