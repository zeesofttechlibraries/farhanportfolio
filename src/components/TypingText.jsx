import React, { useState, useEffect } from "react";

export default function TypingText({
  words = ["Video Editor", "Motion Designer", "Visual Storyteller", "Graphic Designer"],
  speed = 90,
  pause = 1800
}) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  // Blinking cursor timer
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing logic
  useEffect(() => {
    if (!words || words.length === 0) return;

    const currentWord = words[index % words.length] || "";

    if (subIndex === currentWord.length + 1 && !reverse) {
      const timeout = setTimeout(() => {
        setReverse(true);
      }, pause);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words, speed, pause]);

  if (!words || words.length === 0) return null;

  const currentWord = words[index % words.length] || "";

  return (
    <span className="typing-text-container">
      <span className="typing-text">{currentWord.substring(0, subIndex)}</span>
      <span className={`typing-cursor ${blink ? "active" : ""}`}>|</span>
    </span>
  );
}
