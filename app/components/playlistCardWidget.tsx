"use client";
import { useState, useRef, useEffect } from "react";
import { useSpring, animated as a } from "@react-spring/web";
import { useInteractionMode } from "./interactionModeContext";
import styles from "../../components/playlistCardWidget.module.css";

let nextZIndex = 1;

type PlaylistCardWidgetProps = {
  playlistId: string;
  initialX: number;
  initialY: number;
  //onSwipe?: () => void;
};

//Need to change all of the mouse interactions to be touch interactions. And add a button?

export default function PlaylistCardWidget({
  playlistId,
  initialX,
  initialY,
}: //onSwipe,
PlaylistCardWidgetProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const isSwipingRef = useRef(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const { interactionMode } = useInteractionMode();
  const [position, setPosition] = useSpring(() => ({
    x: initialX,
    y: initialY,
    rotate: 0,
  }));
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    isSwipingRef.current = isSwiping;
  }, [isSwiping]);

  const handlePointerDownWindow = (e: globalThis.PointerEvent) => {
    if (interactionMode === "swipe") {
      console.log("touchStart");
      touchStartX.current = e.clientX;
      touchStartY.current = e.clientY;
      console.log(
        "touchStart coords:",
        touchStartX.current,
        touchStartY.current
      );
      setIsSwiping(true);
    }
  };

  const handlePointerMoveWindow = (e: globalThis.PointerEvent) => {
    if (interactionMode === "swipe") {
      const dx = e.clientX - touchStartX.current;
      const dy = e.clientY - touchStartY.current;
      setPosition({
        x: dx,
        y: dy,
        rotate: dx / 10,
      });
    }
  };

  const handlePointerUpWindow = (e: globalThis.PointerEvent) => {
    if (interactionMode === "swipe") {
      const dx = e.clientX - touchStartX.current;
      if (Math.abs(dx) > 100) {
        //becomes a flick
        setPosition({ x: dx > 0 ? 500 : -500, rotate: dx / 10 });
        //onSwipe();
      } else {
        //snap back to original position
        setPosition({ x: initialX, y: initialY, rotate: 0 });
      }
      setIsSwiping(false);
      console.log("touchEnd");
    }
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handlePointerDownReact = (e: React.PointerEvent) =>
    handlePointerDownWindow(e.nativeEvent as globalThis.PointerEvent);
  const handlePointerMoveReact = (e: React.PointerEvent) =>
    handlePointerMoveWindow(e.nativeEvent as globalThis.PointerEvent);
  const handlePointerUpReact = (e: React.PointerEvent) =>
    handlePointerUpWindow(e.nativeEvent as globalThis.PointerEvent);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMoveWindow);
    window.addEventListener("pointerup", handlePointerUpWindow);
    window.addEventListener("pointerdown", handlePointerDownWindow);

    return () => {
      window.removeEventListener("pointermove", handlePointerMoveWindow);
      window.removeEventListener("pointerup", handlePointerUpWindow);
      window.removeEventListener("pointerdown", handlePointerDownWindow);
    };
  }, [isSwiping]);

  if (!hasMounted) {
    return null; // Prevent rendering on the server side
  }

  return (
    <a.div
      className={styles.container}
      //style={{ left: position.x, top: position.y}}
    >
      <iframe
        key={playlistId}
        src={`https://open.spotify.com/embed/playlist/${playlistId}`}
        className={styles.iframe}
        allow="encrypted-media;"
        loading="lazy"
      />
      <div
        className={`${styles.overlay} ${
          interactionMode === "swipe" ? styles.swiping : ""
        }`}
        onPointerDown={handlePointerDownReact}
        onPointerMove={handlePointerMoveReact}
        onPointerUp={handlePointerUpReact}
        title="Flick fast enough to swipe card away"
        style={{
          cursor:
            interactionMode === "swipe"
              ? isSwiping
                ? "grabbing"
                : "grab"
              : "default",
          pointerEvents: isSwiping ? "auto" : "none",
        }}
      />
    </a.div>
  );
}
