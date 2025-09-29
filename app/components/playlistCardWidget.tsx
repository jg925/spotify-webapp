"use client";
import { useState, useRef, useEffect, useContext } from "react";
import { useSpring, animated as a } from "@react-spring/web";
import {
  InteractionModeContext,
  useInteractionMode,
} from "./interactionModeContext";
import styles from "../../components/playlistCardWidget.module.css";

let nextZIndex = 1000;

type PlaylistCardWidgetProps = {
  playlistId: string;
  initialX: number;
  initialY: number;
  initialZ?: number;
  isTop?: boolean;
  //onSwipe?: () => void;
};

export default function PlaylistCardWidget({
  playlistId,
  initialX,
  initialY,
  isTop = false,
  initialZ,
}: //onSwipe,
PlaylistCardWidgetProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const isSwipingRef = useRef(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [zIndex, setZIndex] = useState<number>(initialZ ?? nextZIndex++);
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
    if (isTop && interactionMode === "swipe") {
      console.log("touchStart");
      touchStartX.current = e.clientX;
      touchStartY.current = e.clientY;
      console.log(
        "touchStart coords:",
        touchStartX.current,
        touchStartY.current
      );
      setIsSwiping(true);
      setZIndex(nextZIndex++);
    }
  };

  const handlePointerMoveWindow = (e: globalThis.PointerEvent) => {
    if (isTop && interactionMode === "swipe" && isSwipingRef.current) {
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
    if (isTop && interactionMode === "swipe") {
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
    if (interactionMode === "tap") {
      setIsSwiping(false);
      return;
    }

    window.addEventListener("pointermove", handlePointerMoveWindow);
    window.addEventListener("pointerup", handlePointerUpWindow);
    window.addEventListener("pointerdown", handlePointerDownWindow);

    return () => {
      window.removeEventListener("pointermove", handlePointerMoveWindow);
      window.removeEventListener("pointerup", handlePointerUpWindow);
      window.removeEventListener("pointerdown", handlePointerDownWindow);
    };
  }, [interactionMode, isTop]);

  if (!hasMounted) {
    return null; // Prevent rendering on the server side
  }

  return (
    <a.div
      className={styles.container}
      style={{
        left: position.x,
        top: position.y,
        rotate: position.rotate,
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
        className={`${styles.overlay} ${
          interactionMode === "swipe" && isTop ? styles.swiping : ""
        }`}
        onPointerDown={isTop ? handlePointerDownReact : undefined}
        title="Flick fast enough to swipe card away"
        style={{
          cursor:
            interactionMode === "swipe" && isTop
              ? isSwiping
                ? "grabbing"
                : "grab"
              : "default",
          pointerEvents: interactionMode === "swipe" && isTop ? "auto" : "none",
        }}
      />
    </a.div>
  );
}
