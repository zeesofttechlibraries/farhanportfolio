import React from "react";
import { CalendarDays } from "lucide-react";

export default function MeetingForm({ status, submit }) {
  return (
    <form onSubmit={submit}>
      <p className="eyebrow">Book a meeting</p>
      <h2>LET’S TALK ABOUT YOUR IDEA.</h2>
      <p className="modal-intro">Request a 30-minute discovery call. Farhan will confirm the time by email.</p>
      
      <div className="form-grid">
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Preferred date
          <input name="date" type="date" required />
        </label>
        <label>
          Preferred time
          <input name="time" type="time" required />
        </label>
        <label className="full">
          Project overview
          <textarea 
            name="brief" 
            minLength={20} 
            required 
            placeholder="What would you like to discuss?" 
          />
        </label>
      </div>
      
      <button className="button primary" type="submit">
        Request meeting <CalendarDays size={17} />
      </button>
      {status && <p className="form-status">{status}</p>}
    </form>
  );
}
