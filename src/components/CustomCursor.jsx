import React, { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState("default"); // default, hover, play
  const trailRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      const isPlay = target.closest('[data-cursor="play"]') || target.closest('.project-media') || target.closest('.showreel');
      const isHoverable = target.closest('a') || target.closest('button') || target.closest('.filters button') || target.closest('input') || target.closest('select') || target.closest('textarea');

      if (isPlay) {
        setCursorType("play");
      } else if (isHoverable) {
        setCursorType("hover");
      } else {
        setCursorType("default");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  // Trailing ring animation
  useEffect(() => {
    let animationFrameId;
    
    const updateTrail = () => {
      const dx = position.x - trailRef.current.x;
      const dy = position.y - trailRef.current.y;
      
      // Interpolate for lag effect
      trailRef.current.x += dx * 0.15;
      trailRef.current.y += dy * 0.15;
      
      setTrail({ x: trailRef.current.x, y: trailRef.current.y });
      animationFrameId = requestAnimationFrame(updateTrail);
    };
    
    animationFrameId = requestAnimationFrame(updateTrail);
    return () => cancelAnimationFrame(animationFrameId);
  }, [position]);

  // Hide cursor on touch devices
  if (typeof window !== "undefined" && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null;
  }

  return (
    <>
      <div 
        className={`custom-cursor-dot ${cursorType}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />
      <div 
        className={`custom-cursor-ring ${cursorType}`}
        style={{ left: `${trail.x}px`, top: `${trail.y}px` }}
      >
        {cursorType === "play" && <span className="cursor-play-label">PLAY</span>}
      </div>
    </>
  );
}
