import React, { useState, useRef, useEffect } from "react";

export default function BeforeAfterSlider({ 
  beforeUrl, 
  beforeType, 
  afterUrl, 
  afterType, 
  labelBefore = "RAW FOOTAGE", 
  labelAfter = "FINAL GRADE" 
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  const isVideo = (url, type) => {
    if (type === "video") return true;
    if (type === "image") return false;
    return url ? (url.endsWith(".mp4") || url.endsWith(".mov") || url.includes("/video/upload/")) : false;
  };

  return (
    <div 
      ref={containerRef}
      className="before-after-container"
      onMouseDown={(e) => {
        e.preventDefault();
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={() => setIsDragging(true)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Before media */}
      <div className="media-layer before-layer">
        {beforeUrl ? (
          isVideo(beforeUrl, beforeType) ? (
            <video src={beforeUrl} autoPlay loop muted playsInline />
          ) : (
            <img src={beforeUrl} alt="Before" />
          )
        ) : (
          <div className="fallback-media before-fallback">
            <span>RAW Log Profile (Flat)</span>
          </div>
        )}
        <span className="slider-label before-tag">{labelBefore}</span>
      </div>

      {/* After media */}
      <div 
        className="media-layer after-layer" 
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        {afterUrl ? (
          isVideo(afterUrl, afterType) ? (
            <video src={afterUrl} autoPlay loop muted playsInline />
          ) : (
            <img src={afterUrl} alt="After" />
          )
        ) : (
          <div className="fallback-media after-fallback">
            <span>Cinematic Color Grading & Motion Graphics</span>
          </div>
        )}
        <span className="slider-label after-tag">{labelAfter}</span>
      </div>

      {/* Slider Bar & Handle */}
      <div 
        className="slider-bar" 
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="slider-button">
          <span>◂ ▸</span>
        </div>
      </div>
    </div>
  );
}
