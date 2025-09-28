"use client";

import { useState, useRef, useEffect } from "react";
import styles from "../../components/playlistCardWidget.module.css";

let nextZIndex = 1;

type PlaylistCardWidgetProps = {
  playlistId: string;
  initialX: number;
  initialY: number;
};

//Need to change all of the mouse interactions to be touch interactions. And add a button?

export default function PlaylistCardWidget({
  playlistId,
  initialX,
  initialY,
}: PlaylistCardWidgetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zIndex, setZIndex] = useState(nextZIndex++);
  const [hasMounted, setHasMounted] = useState(false);
  const [isShiftHeld, setIsShiftHeld] = useState(false);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!e.shiftKey) return;
    setIsDragging(true);
    console.log("dragging is true", isDragging);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    setZIndex(nextZIndex++);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Shift") {
      setIsShiftHeld(true);
    }
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Shift") {
      setIsShiftHeld(false);
      if (isDraggingRef.current) {
        setIsDragging(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      }
    }
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offset]);

  if (!hasMounted) {
    return null; // Prevent rendering on the server side
  }

  return (
    <div
      className={styles.container}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        zIndex,
      }}
    >
      <iframe
        key={playlistId}
        src={`https://open.spotify.com/embed/playlist/${playlistId}`}
        className={styles.iframe}
        allow="encrypted-media;"
        loading="lazy"
      />
      <div
        className={`${styles.overlay} ${isDragging ? styles.dragging : ""}`}
        onMouseDown={handleMouseDown}
        title="Hold Shift and drag to move"
        style={{
          cursor: isShiftHeld ? (isDragging ? "grabbing" : "grab") : "default",
          pointerEvents: isShiftHeld ? "auto" : "none",
        }}
      />
    </div>
  );
}
