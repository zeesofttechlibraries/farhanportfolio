import React from "react";
import { ArrowUpRight } from "lucide-react";
import { services } from "../constants";

export default function LeadForm({ active, status, submit }) {
  return (
    <form onSubmit={submit}>
      <p className="eyebrow">New project inquiry</p>
      <h2>TELL ME ABOUT THE EDIT.</h2>
      {active && <p className="selected">Inspired by: {active.title}</p>}
      
      <div className="form-grid">
        <label>
          Name
          <input name="name" required placeholder="Your name" />
        </label>
        <label>
          Email
          <input name="email" type="email" required placeholder="you@company.com" />
        </label>
        <label>
          Service
          <select name="service" required defaultValue="">
            <option value="" disabled>Select service</option>
            {services.map((s) => (
              <option key={s[1]} value={s[1]}>{s[1]}</option>
            ))}
          </select>
        </label>
        <label>
          Budget
          <select name="budget" required defaultValue="">
            <option value="" disabled>Select budget</option>
            <option>Under $100</option>
            <option>$100–$300</option>
            <option>$300–$750</option>
            <option>$750+</option>
          </select>
        </label>
        <label>
          Timeline
          <input name="timeline" placeholder="e.g. 2 weeks" />
        </label>
        <label className="full">
          Project brief
          <textarea 
            name="brief" 
            required 
            minLength={20} 
            placeholder="What are you making, for whom, and what footage do you have?" 
          />
        </label>
      </div>
      
      <button className="button primary" type="submit">
        Send project request <ArrowUpRight size={17} />
      </button>
      {status && <p className="form-status">{status}</p>}
    </form>
  );
}
