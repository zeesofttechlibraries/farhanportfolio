import React from "react";
import { X } from "lucide-react";

export default function Modal({ children, close, wide = false }) {
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <article 
        className={`modal ${wide ? "wide" : ""}`} 
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="close" onClick={close}>
          <X size={19} /> Close
        </button>
        {children}
      </article>
    </div>
  );
}
