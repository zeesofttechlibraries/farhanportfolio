import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight, ChevronDown, ChevronUp, Play, Pause, Volume2, VolumeX, X, Film, Sparkles
} from "lucide-react";

export default function ReelModal({
  project,
  reelProjects = [],
  onClose,
  onSelectProject,
  onStartOrder
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPlayAnim, setShowPlayAnim] = useState(false);

  const currentIndex = reelProjects.findIndex(p => p.id === project.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < reelProjects.length - 1;

  useEffect(() => {
    setIsPlaying(true);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback: mute if needed
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => setIsPlaying(false));
        }
      });
    }
  }, [project.id]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      } else if (e.key === "ArrowUp" && hasPrev) {
        e.preventDefault();
        onSelectProject(reelProjects[currentIndex - 1]);
      } else if (e.key === "ArrowDown" && hasNext) {
        e.preventDefault();
        onSelectProject(reelProjects[currentIndex + 1]);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, hasPrev, hasNext, onClose, onSelectProject, reelProjects]);

  function togglePlay() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setShowPlayAnim(true);
    setTimeout(() => setShowPlayAnim(false), 600);
  }

  function toggleMute() {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  }

  function handleTimeUpdate() {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setCurrentTime(curr);
    setDuration(dur);
    setProgress((curr / dur) * 100);
  }

  function handleSeek(e) {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    videoRef.current.currentTime = newTime;
    setProgress((newTime / duration) * 100);
  }

  return (
    <div className="reel-modal-backdrop" onClick={onClose}>
      <div className="reel-modal-shell" onClick={e => e.stopPropagation()}>
        {/* Background Blur Glow */}
        {project.mediaUrl && project.mediaType === "video" && (
          <div className="reel-ambient-bg">
            <video src={project.mediaUrl} muted loop autoPlay playsInline />
          </div>
        )}

        {/* Smartphone Reel Container */}
        <div className="reel-container">
          {/* Header Bar */}
          <div className="reel-header">
            <div className="reel-badge-tag">
              <Film size={14} />
              <span>FIRST CUT REELS</span>
            </div>
            <button className="reel-close-btn" onClick={onClose} aria-label="Close Reel">
              <X size={20} />
            </button>
          </div>

          {/* Video Area */}
          <div className="reel-media-wrapper" onClick={togglePlay}>
            {project.mediaUrl ? (
              project.mediaType === "video" ? (
                <video
                  ref={videoRef}
                  src={project.mediaUrl}
                  loop
                  playsInline
                  autoPlay
                  onTimeUpdate={handleTimeUpdate}
                />
              ) : (
                <img src={project.mediaUrl} alt={project.title} />
              )
            ) : (
              <div className="reel-placeholder-art" style={{ "--accent": project.accent || "#ff6038" }}>
                <Film size={48} />
                <h3>{project.title}</h3>
                <p>{project.category}</p>
              </div>
            )}

            {/* Play/Pause Pulse Animation Overlay */}
            {showPlayAnim && (
              <div className="reel-play-pulse">
                {isPlaying ? <Play size={44} fill="currentColor" /> : <Pause size={44} fill="currentColor" />}
              </div>
            )}

            {/* Gradient Overlay for bottom text visibility */}
            <div className="reel-gradient-overlay" />

            {/* Bottom Project Details Overlay */}
            <div className="reel-bottom-info">
              <span className="reel-category-pill">{project.category} / {project.year}</span>
              <h2 className="reel-title">{project.title}</h2>
              {project.description && (
                <p className="reel-description">{project.description}</p>
              )}

              <button className="reel-cta-btn" onClick={(e) => { e.stopPropagation(); onStartOrder(project); }}>
                Start a similar project <ArrowUpRight size={16} />
              </button>
            </div>

            {/* Side Action Bar (Instagram / TikTok style) */}
            <div className="reel-side-actions" onClick={e => e.stopPropagation()}>
              <button
                className="reel-action-btn"
                onClick={togglePlay}
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
              </button>

              <button
                className="reel-action-btn"
                onClick={toggleMute}
                title={isMuted ? "Unmute (M)" : "Mute (M)"}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              {hasPrev && (
                <button
                  className="reel-action-btn nav-btn"
                  onClick={() => onSelectProject(reelProjects[currentIndex - 1])}
                  title="Previous Reel (Up Arrow)"
                >
                  <ChevronUp size={22} />
                </button>
              )}

              {hasNext && (
                <button
                  className="reel-action-btn nav-btn"
                  onClick={() => onSelectProject(reelProjects[currentIndex + 1])}
                  title="Next Reel (Down Arrow)"
                >
                  <ChevronDown size={22} />
                </button>
              )}
            </div>

            {/* Bottom Progress Bar */}
            <div className="reel-progress-track" onClick={(e) => { e.stopPropagation(); handleSeek(e); }}>
              <div className="reel-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
