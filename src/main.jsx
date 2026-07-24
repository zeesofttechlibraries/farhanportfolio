import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight, CalendarDays, Check, ChevronRight, CirclePlay, Film, Image as ImageIcon,
  LogOut, Mail, Menu, MessageSquare, Pencil, Play, Plus, Trash2, Upload, X
} from "lucide-react";
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query,
  serverTimestamp, updateDoc, where
} from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db, firebaseReady } from "./firebase";
import "./styles.css";

const demoProjects = [
  { id:"demo-1", title:"Midnight Drive", category:"Commercial Edit", year:"2026", mediaType:"image", mediaUrl:"", description:"A high-energy automotive film shaped with bold pacing, sound design, and cinematic color.", featured:true, published:true, order:1, accent:"#ff6038" },
  { id:"demo-2", title:"Good Noise", category:"Social Campaign", year:"2026", mediaType:"image", mediaUrl:"", description:"Platform-first short content with kinetic captions, clean motion, and a strong visual hook.", featured:true, published:true, order:2, accent:"#8f72ff" },
  { id:"demo-3", title:"Human / Motion", category:"Motion Graphics", year:"2025", mediaType:"image", mediaUrl:"", description:"A graphic brand film combining animated typography, editorial cuts, and a polished finish.", featured:false, published:true, order:3, accent:"#31c9ff" },
  { id:"demo-4", title:"Still Speaks", category:"Graphic Design", year:"2025", mediaType:"image", mediaUrl:"", description:"Campaign posters and social artwork designed to create a consistent, memorable identity.", featured:false, published:true, order:4, accent:"#e8ff46" }
];

const services = [
  ["01","Short-form editing","Reels, TikToks, Shorts, captions, pacing, sound design, and platform-ready exports."],
  ["02","Commercial videos","Product promos, ads, brand films, color work, transitions, and polished delivery."],
  ["03","Motion graphics","Titles, logo animation, kinetic typography, compositing, and visual effects."],
  ["04","Graphic design","Thumbnails, social posts, campaign graphics, posters, and visual identity work."]
];

const emptyProject = {
  title:"", category:"Short-form editing", year:String(new Date().getFullYear()),
  description:"", mediaType:"image", mediaUrl:"", featured:false, published:true, order:1, accent:"#ff6038"
};

function Brand(){ return <a className="brand" href="/"><span className="brand-play">▶</span>FIRST CUT<span>.</span></a>; }
function Arrow(){ return <ArrowUpRight size={17}/>; }

function App(){
  return window.location.pathname.startsWith("/admin") ? <Admin/> : <Portfolio/>;
}

function Portfolio(){
  const [projects,setProjects]=useState(demoProjects);
  const [active,setActive]=useState(null);
  const [formOpen,setFormOpen]=useState(false);
  const [meetingOpen,setMeetingOpen]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const [status,setStatus]=useState("");
  const [filter,setFilter]=useState("All");

  useEffect(()=>{
    if(!db) return;
    const q=query(collection(db,"projects"),where("published","==",true));
    return onSnapshot(q,(snap)=>{
      const rows=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order||0)-(b.order||0));
      if(rows.length) setProjects(rows);
    },()=>{});
  },[]);
  useEffect(()=>{document.body.style.overflow=(active||formOpen||meetingOpen)?"hidden":"";},[active,formOpen,meetingOpen]);
  const categories=useMemo(()=>["All",...new Set(projects.map(p=>p.category))],[projects]);
  const visible=filter==="All"?projects:projects.filter(p=>p.category===filter);

  function openOrder(project=null){setActive(project);setFormOpen(true);setStatus("");}
  async function sendLead(e,type){
    e.preventDefault(); const form=e.currentTarget; const data=Object.fromEntries(new FormData(form).entries());
    setStatus("Sending…");
    try{
      if(db){await addDoc(collection(db,type),{...data,projectTitle:active?.title||"",status:"new",createdAt:serverTimestamp()});setStatus(type==="meetings"?"Meeting request sent. Farhan will confirm by email.":"Project request sent. Farhan will reply shortly.");form.reset();}
      else{
        const email=import.meta.env.VITE_CONTACT_EMAIL||"hello@firstcut.studio";
        const subject=encodeURIComponent(type==="meetings"?"Meeting request — First Cut":"Project inquiry — First Cut");
        const body=encodeURIComponent(Object.entries(data).map(([k,v])=>`${k}: ${v}`).join("\n"));
        window.location.href=`mailto:${email}?subject=${subject}&body=${body}`; setStatus("Opening your email app with the completed request.");
      }
    }catch{setStatus("Could not send. Please email hello@firstcut.studio.");}
  }

  return <main>
    <header className="site-header">
      <Brand/>
      <button className="menu-toggle" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen?<X/>:<Menu/>}</button>
      <nav className={menuOpen?"open":""}>
        <a href="#work" onClick={()=>setMenuOpen(false)}>Work</a><a href="#services" onClick={()=>setMenuOpen(false)}>Services</a><a href="#about" onClick={()=>setMenuOpen(false)}>About</a><a href="#contact" onClick={()=>setMenuOpen(false)}>Contact</a>
      </nav>
      <button className="header-cta" onClick={()=>openOrder()}>Start a project <Arrow/></button>
    </header>

    <section className="hero" id="top">
      <div className="hero-grid"/>
      <div className="hero-copy">
        <p className="eyebrow">Video editor · Graphic designer</p>
        <h1>EVERY STORY<br/>NEEDS A<br/><em>FIRST CUT.</em></h1>
        <p className="hero-text">Mohammad Farhan turns raw footage and bold ideas into scroll-stopping films, motion, and graphic design.</p>
        <div className="credentials">
          <div className="experience"><strong>1+</strong><span>Year<br/>experience</span></div>
          <div className="tools"><span><b>Pr</b>Premiere Pro</span><span><b>Ae</b>After Effects</span><span><b>Cc</b>CapCut</span><span><b>Ps</b>Photoshop</span></div>
        </div>
        <div className="hero-actions"><button className="button primary" onClick={()=>openOrder()}><Play size={16} fill="currentColor"/> Start a project</button><button className="button secondary" onClick={()=>setMeetingOpen(true)}><CalendarDays size={17}/> Book a meeting</button></div>
      </div>
      <div className="hero-visual">
        <div className="editor-silhouette"><div className="head"/><div className="body"/></div>
        <div className="screen screen-one"><div className="screen-frame"/><div className="timeline-lines"/></div>
        <div className="screen screen-two"><div className="screen-frame alt"/><div className="timeline-lines"/></div>
        <button className="showreel" onClick={()=>document.getElementById("work")?.scrollIntoView()}><CirclePlay size={40}/><span>VIEW SHOWREEL</span></button>
        <div className="film-strip"><span/><span/><span/><span/><span/></div>
      </div>
      <div className="timeline"><span>00:00:00</span><span>00:00:05</span><span>00:00:10</span><span>00:00:15</span><i/></div>
    </section>

    <section className="section work" id="work">
      <SectionHead eyebrow="Selected work / 01" title={<>EDITS MADE TO<br/>BE REMEMBERED.</>} copy="Commercials, short-form content, motion graphics, and visual identities built with intention."/>
      <div className="filters">{categories.map(c=><button className={filter===c?"active":""} onClick={()=>setFilter(c)} key={c}>{c}</button>)}</div>
      <div className="project-grid">{visible.map((p,i)=><article className={`project-card ${i===0?"wide":""}`} key={p.id}>
        <button className="project-media" onClick={()=>setActive(p)}>
          {p.mediaUrl?(p.mediaType==="video"?<video src={p.mediaUrl} muted loop autoPlay playsInline/>:<img src={p.mediaUrl} alt=""/>):<DemoArt project={p} index={i}/>}
          <span className="project-open">View <Arrow/></span>
        </button>
        <div className="project-info"><div><p>{p.category} / {p.year}</p><h3>{p.title}</h3></div><button onClick={()=>openOrder(p)}>Start similar <Arrow/></button></div>
      </article>)}</div>
    </section>

    <section className="section services" id="services">
      <SectionHead eyebrow="Capabilities / 02" title={<>FROM ROUGH IDEA<br/>TO FINAL EXPORT.</>} copy="One creative partner for sharp edits, confident motion, and campaign-ready graphics."/>
      <div className="service-list">{services.map(([n,t,d])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p><ChevronRight/></article>)}</div>
    </section>

    <section className="section about" id="about">
      <div className="about-stamp"><Film size={58}/><span>CUT WITH INTENT<br/>DESIGNED TO MOVE</span></div>
      <div><p className="eyebrow">About Farhan / 03</p><h2>I FIND THE FRAME, RHYTHM, AND FEELING THAT MAKE PEOPLE STOP.</h2><p>I'm Mohammad Farhan, the editor and designer behind First Cut. For more than a year, I’ve shaped ideas into clear visual stories—combining editing, motion, sound, and design into work that feels complete.</p>
      <div className="stats"><span><strong>4</strong>Creative tools</span><span><strong>100%</strong>Focused craft</span><span><strong>1:1</strong>Direct collaboration</span></div></div>
    </section>

    <section className="cta" id="contact"><p className="eyebrow">Have footage or an idea?</p><h2>LET’S MAKE THE<br/>FIRST CUT COUNT<span>.</span></h2><div><button className="button ink" onClick={()=>openOrder()}>Place an order <Arrow/></button><button className="button outline" onClick={()=>setMeetingOpen(true)}>Book a meeting <CalendarDays size={17}/></button></div><p className="available"><i/> Available for projects · Pakistan / Worldwide</p></section>
    <footer><Brand/><p>Mohammad Farhan — Video Editor & Graphic Designer</p><div><a href="mailto:hello@firstcut.studio">Email</a><a href="/admin">Admin</a><a href="#top">Back to top ↑</a></div></footer>

    {active&&!formOpen&&<Modal close={()=>setActive(null)} wide><ProjectMedia project={active}/><p className="eyebrow">{active.category} / {active.year}</p><h2>{active.title}</h2><p>{active.description}</p><button className="button primary" onClick={()=>setFormOpen(true)}>Start a similar project <Arrow/></button></Modal>}
    {formOpen&&<Modal close={()=>{setFormOpen(false);setActive(null)}}><LeadForm active={active} status={status} submit={e=>sendLead(e,"inquiries")}/></Modal>}
    {meetingOpen&&<Modal close={()=>setMeetingOpen(false)}><MeetingForm status={status} submit={e=>sendLead(e,"meetings")}/></Modal>}
  </main>;
}

function SectionHead({eyebrow,title,copy}){return <div className="section-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><p>{copy}</p></div>}
function DemoArt({project,index}){return <span className="demo-art" style={{"--accent":project.accent}}><b>{String(index+1).padStart(2,"0")}</b><i>{project.category}</i><div className="orbit"/></span>}
function ProjectMedia({project}){return <div className="modal-media">{project.mediaUrl?(project.mediaType==="video"?<video src={project.mediaUrl} controls autoPlay/>:<img src={project.mediaUrl} alt={project.title}/>):<DemoArt project={project} index={0}/>}</div>}
function Modal({children,close,wide=false}){return <div className="modal-backdrop" onMouseDown={close}><article className={`modal ${wide?"wide":""}`} onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={close}><X size={19}/> Close</button>{children}</article></div>}
function LeadForm({active,status,submit}){return <form onSubmit={submit}><p className="eyebrow">New project inquiry</p><h2>TELL ME ABOUT THE EDIT.</h2>{active&&<p className="selected">Inspired by: {active.title}</p>}<div className="form-grid"><label>Name<input name="name" required placeholder="Your name"/></label><label>Email<input name="email" type="email" required placeholder="you@company.com"/></label><label>Service<select name="service" required defaultValue=""><option value="" disabled>Select service</option>{services.map(s=><option key={s[1]}>{s[1]}</option>)}</select></label><label>Budget<select name="budget" required defaultValue=""><option value="" disabled>Select budget</option><option>Under $100</option><option>$100–$300</option><option>$300–$750</option><option>$750+</option></select></label><label>Timeline<input name="timeline" placeholder="e.g. 2 weeks"/></label><label className="full">Project brief<textarea name="brief" required minLength="20" placeholder="What are you making, for whom, and what footage do you have?"/></label></div><button className="button primary" type="submit">Send project request <Arrow/></button>{status&&<p className="form-status">{status}</p>}</form>}
function MeetingForm({status,submit}){return <form onSubmit={submit}><p className="eyebrow">Book a meeting</p><h2>LET’S TALK ABOUT YOUR IDEA.</h2><p className="modal-intro">Request a 30-minute discovery call. Farhan will confirm the time by email.</p><div className="form-grid"><label>Name<input name="name" required/></label><label>Email<input name="email" type="email" required/></label><label>Preferred date<input name="date" type="date" required/></label><label>Preferred time<input name="time" type="time" required/></label><label className="full">Project overview<textarea name="brief" minLength="20" required placeholder="What would you like to discuss?"/></label></div><button className="button primary" type="submit">Request meeting <CalendarDays size={17}/></button>{status&&<p className="form-status">{status}</p>}</form>}

function Admin(){
  const [user,setUser]=useState(null),[loading,setLoading]=useState(true),[projects,setProjects]=useState([]),[inquiries,setInquiries]=useState([]),[meetings,setMeetings]=useState([]);
  const [draft,setDraft]=useState(emptyProject),[editing,setEditing]=useState(null),[message,setMessage]=useState(""),[uploading,setUploading]=useState(false),[tab,setTab]=useState("projects");
  useEffect(()=>{if(!auth){setLoading(false);return;}return onAuthStateChanged(auth,u=>{setUser(u);setLoading(false)})},[]);
  useEffect(()=>{if(!user||!db)return;const a=onSnapshot(query(collection(db,"projects"),orderBy("order","asc")),s=>setProjects(s.docs.map(d=>({id:d.id,...d.data()}))));const b=onSnapshot(query(collection(db,"inquiries"),orderBy("createdAt","desc")),s=>setInquiries(s.docs.map(d=>({id:d.id,...d.data()}))));const c=onSnapshot(query(collection(db,"meetings"),orderBy("createdAt","desc")),s=>setMeetings(s.docs.map(d=>({id:d.id,...d.data()}))));return()=>{a();b();c()}},[user]);
  async function login(e){e.preventDefault();const d=new FormData(e.currentTarget);setMessage("Signing in…");try{await signInWithEmailAndPassword(auth,String(d.get("email")),String(d.get("password")));setMessage("")}catch{setMessage("Sign-in failed. Check your Firebase account and password.")}}
  async function upload(e){const file=e.target.files?.[0];if(!file)return;const cloud=import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,preset=import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;if(!cloud||!preset){setMessage("Add Cloudinary variables in .env or Netlify first.");return;}setUploading(true);setMessage("Uploading media…");try{const data=new FormData();data.append("file",file);data.append("upload_preset",preset);data.append("folder","first-cut/projects");const type=file.type.startsWith("video/")?"video":"image";const r=await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${type}/upload`,{method:"POST",body:data});if(!r.ok)throw 0;const result=await r.json();setDraft({...draft,mediaUrl:result.secure_url,mediaType:type});setMessage("Upload complete.")}catch{setMessage("Upload failed. Confirm your unsigned Cloudinary preset.")}finally{setUploading(false)}}
  async function save(e){e.preventDefault();setMessage("Saving…");try{if(editing)await updateDoc(doc(db,"projects",editing),{...draft,updatedAt:serverTimestamp()});else await addDoc(collection(db,"projects"),{...draft,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});setDraft({...emptyProject,order:projects.length+1});setEditing(null);setMessage("Project saved. The public portfolio updates automatically.")}catch{setMessage("Could not save. Check Firestore rules.")}}
  async function remove(p){if(!confirm(`Delete “${p.title}”?`))return;await deleteDoc(doc(db,"projects",p.id))}
  function edit(p){const{id,...rest}=p;setDraft(rest);setEditing(id);scrollTo({top:0,behavior:"smooth"})}
  if(loading)return <div className="admin-center">Loading First Cut…</div>;
  if(!firebaseReady)return <div className="admin-center"><Brand/><p className="eyebrow">Admin setup required</p><h1>CONNECT FIREBASE<br/>& CLOUDINARY.</h1><p>Add the variables from <code>.env.example</code> in Netlify, enable Firebase Email/Password authentication, create the owner account, and deploy again.</p><div className="setup-grid"><span>01 Firebase Auth</span><span>02 Firestore</span><span>03 Cloudinary preset</span><span>04 Netlify variables</span></div><a className="button dark" href="/">Back to portfolio</a></div>;
  if(!user)return <div className="admin-center login"><Brand/><form onSubmit={login}><p className="eyebrow">Owner access</p><h1>ADMIN SIGN IN.</h1><label>Email<input name="email" type="email" required/></label><label>Password<input name="password" type="password" required/></label><button className="button dark">Sign in <Arrow/></button>{message&&<p>{message}</p>}</form></div>;
  const leads=tab==="inquiries"?inquiries:meetings;
  return <main className="admin">
    <header><Brand/><div><span>{user.email}</span><a href="/" target="_blank">View site <Arrow/></a><button onClick={()=>signOut(auth)}><LogOut size={16}/> Sign out</button></div></header>
    <section className="admin-title"><div><p className="eyebrow">First Cut studio</p><h1>PORTFOLIO<br/>MANAGER</h1></div><nav><button className={tab==="projects"?"active":""} onClick={()=>setTab("projects")}>Projects {projects.length}</button><button className={tab==="inquiries"?"active":""} onClick={()=>setTab("inquiries")}>Orders {inquiries.length}</button><button className={tab==="meetings"?"active":""} onClick={()=>setTab("meetings")}>Meetings {meetings.length}</button></nav></section>
    {tab==="projects"?<><form className="editor" onSubmit={save}><div className="editor-head"><div><p className="eyebrow">{editing?"Editing project":"New project"}</p><h2>{editing?draft.title:"ADD PORTFOLIO WORK"}</h2></div>{editing&&<button type="button" onClick={()=>{setEditing(null);setDraft(emptyProject)}}>Cancel edit</button>}</div><div className="form-grid">
      <label>Title<input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} required/></label><label>Category<select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}>{services.map(s=><option key={s[1]}>{s[1]}</option>)}</select></label><label>Year<input value={draft.year} onChange={e=>setDraft({...draft,year:e.target.value})} required/></label><label>Display order<input type="number" min="1" value={draft.order} onChange={e=>setDraft({...draft,order:Number(e.target.value)})}/></label><label className="full">Description<textarea value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})} minLength="20" required/></label>
      <label className="upload full"><Upload/><b>{uploading?"Uploading…":draft.mediaUrl?"Replace image or video":"Upload project image or video"}</b><span>JPG, PNG, WebP, MP4 or MOV</span><input type="file" accept="image/*,video/*" onChange={upload}/></label>{draft.mediaUrl&&<div className="preview full">{draft.mediaType==="video"?<video src={draft.mediaUrl} controls/>:<img src={draft.mediaUrl} alt=""/>}</div>}<label className="check"><input type="checkbox" checked={draft.featured} onChange={e=>setDraft({...draft,featured:e.target.checked})}/> Featured project</label><label className="check"><input type="checkbox" checked={draft.published} onChange={e=>setDraft({...draft,published:e.target.checked})}/> Published</label>
    </div><div className="editor-foot"><button className="button primary"><Plus size={17}/>{editing?"Update project":"Publish project"}</button><span>{message}</span></div></form><AdminProjects items={projects} edit={edit} remove={remove}/></>:<LeadList items={leads} type={tab}/>}
  </main>
}

function AdminProjects({items,edit,remove}){return <section className="admin-list"><div className="list-head"><h2>ALL PROJECTS</h2><span>{items.filter(i=>i.published).length} live</span></div>{items.length?items.map(p=><article key={p.id}><div className="thumb">{p.mediaUrl?(p.mediaType==="video"?<video src={p.mediaUrl}/>:<img src={p.mediaUrl} alt=""/>):<ImageIcon/>}</div><div><small>{p.category} / {p.year}</small><h3>{p.title}</h3><p>{p.published?"Published":"Draft"} {p.featured?"• Featured":""}</p></div><span>#{p.order}</span><button onClick={()=>edit(p)}><Pencil size={16}/> Edit</button><button className="danger" onClick={()=>remove(p)}><Trash2 size={16}/> Delete</button></article>):<p className="empty">No projects yet.</p>}</section>}
function LeadList({items,type}){return <section className="admin-list leads"><div className="list-head"><h2>{type==="meetings"?"MEETING REQUESTS":"CLIENT ORDERS"}</h2><span>{items.filter(i=>i.status==="new").length} new</span></div>{items.length?items.map(item=><article key={item.id}><div className="avatar">{item.name?.[0]||"?"}</div><div><small>{item.service||`${item.date||""} ${item.time||""}`}</small><h3>{item.name}</h3><p>{item.email}</p><p className="brief">{item.brief}</p></div><a href={`mailto:${item.email}`}><Mail size={16}/> Reply</a>{item.status==="new"&&<button onClick={()=>updateDoc(doc(db,type,item.id),{status:"read"})}><Check size={16}/> Mark read</button>}</article>):<p className="empty">New requests will appear here.</p>}</section>}

createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);
