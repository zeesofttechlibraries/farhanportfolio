import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight, CalendarDays, ChevronRight, CirclePlay, Film, Menu, Play, X
} from "lucide-react";
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../firebase";
import { demoProjects, services } from "../constants";
import Modal from "../components/Modal";
import ReelModal from "../components/ReelModal";
import LeadForm from "../components/LeadForm";
import MeetingForm from "../components/MeetingForm";
import BeforeAfterSlider from "../components/BeforeAfterSlider";

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

function SectionHead({ eyebrow, title, copy }) {
  return (
    <div className="section-head">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <p>{copy}</p>
    </div>
  );
}

function DemoArt({ project, index }) {
  return (
    <span className="demo-art" style={{ "--accent": project.accent }}>
      <b>{String(index + 1).padStart(2, "0")}</b>
      <i>{project.category}</i>
      <div className="orbit" />
    </span>
  );
}

function ProjectMedia({ project }) {
  return (
    <div className="modal-media">
      {project.mediaUrl ? (
        project.mediaType === "video" ? (
          <video src={project.mediaUrl} controls autoPlay />
        ) : (
          <img src={project.mediaUrl} alt={project.title} />
        )
      ) : (
        <DemoArt project={project} index={0} />
      )}
    </div>
  );
}

export default function Portfolio() {
  const [projects, setProjects] = useState(demoProjects);
  const [active, setActive] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [filter, setFilter] = useState("All");
  const [spotlight, setSpotlight] = useState({
    beforeUrl: "",
    beforeType: "image",
    afterUrl: "",
    afterType: "image"
  });

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "projects"), where("published", "==", true));
    const unsubscribeProjects = onSnapshot(q, (snap) => {
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 0) - (b.order || 0));
      if (rows.length) setProjects(rows);
    }, () => {});

    // Listen for spotlight settings
    const spotlightRef = doc(db, "settings", "spotlight");
    const unsubscribeSpotlight = onSnapshot(spotlightRef, (docSnap) => {
      if (docSnap.exists()) {
        setSpotlight(docSnap.data());
      }
    }, () => {});

    return () => {
      unsubscribeProjects();
      unsubscribeSpotlight();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = (active || formOpen || meetingOpen) ? "hidden" : "";
  }, [active, formOpen, meetingOpen]);

  const [verticalVideoIds, setVerticalVideoIds] = useState({});

  const isReelProject = (p) => {
    if (!p) return false;
    if (p.isReel) return true;
    if (verticalVideoIds[p.id]) return true;
    if (p.mediaType === "video" && p.category && (p.category.toLowerCase().includes("reel") || p.category.toLowerCase().includes("short-form"))) {
      return true;
    }
    return false;
  };

  const categories = useMemo(() => ["All", ...new Set(projects.map(p => p.category))], [projects]);
  const visible = filter === "All" ? projects : projects.filter(p => p.category === filter);
  const reelProjects = useMemo(() => projects.filter(p => isReelProject(p)), [projects, verticalVideoIds]);

  function openOrder(project = null) {
    setActive(project);
    setFormOpen(true);
    setStatus("");
  }

  async function sendLead(e, type) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("Sending…");
    try {
      if (db) {
        await addDoc(collection(db, type), {
          ...data,
          projectTitle: active?.title || "",
          status: "new",
          createdAt: serverTimestamp()
        });
        setStatus(type === "meetings" ? "Meeting request sent. Farhan will confirm by email." : "Project request sent. Farhan will reply shortly.");
        form.reset();
      } else {
        const email = import.meta.env.VITE_CONTACT_EMAIL || "hello@firstcut.studio";
        const subject = encodeURIComponent(type === "meetings" ? "Meeting request — First Cut" : "Project inquiry — First Cut");
        const body = encodeURIComponent(Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n"));
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        setStatus("Opening your email app with the completed request.");
      }
    } catch {
      setStatus("Could not send. Please email hello@firstcut.studio.");
    }
  }

  return (
    <main>
      <header className="site-header">
        <Brand />
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={menuOpen ? "open" : ""}>
          <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
        <button className="header-cta" onClick={() => openOrder()}>
          Start a project <Arrow />
        </button>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" />
        <div className="hero-copy">
          <p className="eyebrow">Video editor · Graphic designer</p>
          <h1>EVERY STORY<br />NEEDS A<br /><em>FIRST CUT.</em></h1>
          <p className="hero-text">Mohammad Farhan turns raw footage and bold ideas into scroll-stopping films, motion, and graphic design.</p>
          <div className="credentials">
            <div className="experience">
              <strong>1+</strong>
              <span>Year<br />experience</span>
            </div>
            <div className="tools">
              <span><b>Pr</b>Premiere Pro</span>
              <span><b>Ae</b>After Effects</span>
              <span><b>Cc</b>CapCut</span>
              <span><b>Ps</b>Photoshop</span>
            </div>
          </div>
          <div className="hero-actions">
            <button className="button primary" onClick={() => openOrder()}>
              <Play size={16} fill="currentColor" /> Start a project
            </button>
            <button className="button secondary" onClick={() => setMeetingOpen(true)}>
              <CalendarDays size={17} /> Book a meeting
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="editor-silhouette">
            <div className="head" />
            <div className="body" />
          </div>
          <div className="screen screen-one">
            <div className="screen-frame" />
            <div className="timeline-lines" />
          </div>
          <div className="screen screen-two">
            <div className="screen-frame alt" />
            <div className="timeline-lines" />
          </div>
          <button className="showreel" onClick={() => document.getElementById("work")?.scrollIntoView()}>
            <CirclePlay size={40} />
            <span>VIEW SHOWREEL</span>
          </button>
          <div className="film-strip">
            <span /><span /><span /><span /><span />
          </div>
        </div>
        <div className="timeline">
          <span>00:00:00</span>
          <span>00:00:05</span>
          <span>00:00:10</span>
          <span>00:00:15</span>
          <i />
        </div>
      </section>

      <section className="section work" id="work">
        <SectionHead 
          eyebrow="Selected work / 01" 
          title={<>EDITS MADE TO<br />BE REMEMBERED.</>} 
          copy="Commercials, short-form content, motion graphics, and visual identities built with intention." 
        />
        
        <div className="filters">
          {categories.map(c => (
            <button className={filter === c ? "active" : ""} onClick={() => setFilter(c)} key={c}>
              {c}
            </button>
          ))}
        </div>

        <div className="project-grid">
          {visible.map((p, i) => {
            const isReel = isReelProject(p);
            return (
              <article className={`project-card ${i === 0 ? "wide" : ""} ${isReel ? "reel-project-card" : ""}`} key={p.id}>
                <button className="project-media" onClick={() => setActive(p)}>
                  {isReel && (
                    <span className="reel-badge-pill">
                      <Film size={12} /> REEL
                    </span>
                  )}
                  {p.mediaUrl ? (
                    p.mediaType === "video" ? (
                      <video
                        src={p.mediaUrl}
                        muted
                        loop
                        autoPlay
                        playsInline
                        onLoadedMetadata={(e) => {
                          if (e.target.videoHeight > e.target.videoWidth) {
                            setVerticalVideoIds(prev => ({ ...prev, [p.id]: true }));
                          }
                        }}
                      />
                    ) : (
                      <img src={p.mediaUrl} alt="" />
                    )
                  ) : (
                    <DemoArt project={p} index={i} />
                  )}
                  <span className="project-open">{isReel ? "Play Reel" : "View"} <Arrow /></span>
                </button>
                <div className="project-info">
                  <div>
                    <p>{p.category} / {p.year}</p>
                    <h3>{p.title}</h3>
                  </div>
                  <button onClick={() => openOrder(p)}>
                    Start similar <Arrow />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* BEFORE / AFTER SPOTLIGHT SECTION */}
      <section className="section spotlight-section">
        <SectionHead 
          eyebrow="Spotlight / Raw vs graded" 
          title={<>CINEMATIC TRANSFORMATION</>} 
          copy="Drag the slider to see how raw flat log footage is colored and paced to create a premium final export." 
        />
        <div className="spotlight-slider-wrapper">
          <BeforeAfterSlider 
            beforeUrl={spotlight.beforeUrl} 
            beforeType={spotlight.beforeType} 
            afterUrl={spotlight.afterUrl} 
            afterType={spotlight.afterType} 
          />
        </div>
      </section>

      <section className="section services" id="services">
        <SectionHead 
          eyebrow="Capabilities / 02" 
          title={<>FROM ROUGH IDEA<br />TO FINAL EXPORT.</>} 
          copy="One creative partner for sharp edits, confident motion, and campaign-ready graphics." 
        />
        <div className="service-list">
          {services.map(([n, t, d]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
              <ChevronRight />
            </article>
          ))}
        </div>
      </section>

      <section className="section about" id="about">
        <div className="about-stamp">
          <Film size={58} />
          <span>CUT WITH INTENT<br />DESIGNED TO MOVE</span>
        </div>
        <div>
          <p className="eyebrow">About Farhan / 03</p>
          <h2>I FIND THE FRAME, RHYTHM, AND FEELING THAT MAKE PEOPLE STOP.</h2>
          <p>I'm Mohammad Farhan, the editor and designer behind First Cut. For more than a year, I’ve shaped ideas into clear visual stories—combining editing, motion, sound, and design into work that feels complete.</p>
          <div className="stats">
            <span><strong>4</strong>Creative tools</span>
            <span><strong>100%</strong>Focused craft</span>
            <span><strong>1:1</strong>Direct collaboration</span>
          </div>
        </div>
      </section>

      <section className="cta" id="contact">
        <p className="eyebrow">Have footage or an idea?</p>
        <h2>LET’S MAKE THE<br />FIRST CUT COUNT<span>.</span></h2>
        <div>
          <button className="button ink" onClick={() => openOrder()}>
            Place an order <Arrow />
          </button>
          <button className="button outline" onClick={() => setMeetingOpen(true)}>
            Book a meeting <CalendarDays size={17} />
          </button>
        </div>
        <p className="available"><i /> Available for projects · Pakistan / Worldwide</p>
      </section>

      <footer>
        <Brand />
        <p>Mohammad Farhan — Video Editor & Graphic Designer</p>
        <div>
          <a href="mailto:hello@firstcut.studio">Email</a>
          <a href="/admin">Admin</a>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>

      {active && !formOpen && (
        isReelProject(active) ? (
          <ReelModal
            project={active}
            reelProjects={reelProjects.length > 0 ? reelProjects : [active]}
            onClose={() => setActive(null)}
            onSelectProject={(proj) => setActive(proj)}
            onStartOrder={(proj) => openOrder(proj)}
          />
        ) : (
          <Modal close={() => setActive(null)} wide>
            <ProjectMedia project={active} />
            <p className="eyebrow">{active.category} / {active.year}</p>
            <h2>{active.title}</h2>
            <p>{active.description}</p>
            <button className="button primary" onClick={() => setFormOpen(true)}>
              Start a similar project <Arrow />
            </button>
          </Modal>
        )
      )}
      
      {formOpen && (
        <Modal close={() => { setFormOpen(false); setActive(null); }}>
          <LeadForm active={active} status={status} submit={e => sendLead(e, "inquiries")} />
        </Modal>
      )}
      
      {meetingOpen && (
        <Modal close={() => setMeetingOpen(false)}>
          <MeetingForm status={status} submit={e => sendLead(e, "meetings")} />
        </Modal>
      )}
    </main>
  );
}
