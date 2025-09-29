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
  onSwipe?: (direction: "left" | "right") => void;
};

export default function PlaylistCardWidget({
  playlistId,
  initialX,
  initialY,
  isTop = false,
  initialZ,
  onSwipe,
}: PlaylistCardWidgetProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const isSwipingRef = useRef(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [zIndex, setZIndex] = useState<number>(initialZ ?? nextZIndex++);
  const { interactionMode } = useInteractionMode();
  const [position, api] = useSpring(() => ({
    x: initialX,
    y: initialY,
    rotate: 0,
    config: { tension: 300, friction: 30 },
  }));
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  // velocity
  const lastMoveX = useRef<number | null>(null);
  const lastMoveTime = useRef<number | null>(null);
  const velocityRef = useRef(0); // px/sec

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
      //initialize velocity tracking
      lastMoveX.current = e.clientX;
      lastMoveTime.current = e.timeStamp ?? Date.now();
      velocityRef.current = 0;
    }
  };

  const handlePointerMoveWindow = (e: globalThis.PointerEvent) => {
    if (isTop && interactionMode === "swipe" && isSwipingRef.current) {
      const dx = e.clientX - touchStartX.current;
      const dy = e.clientY - touchStartY.current;
      //compute instantaneous velocity
      const now = e.timeStamp ?? Date.now();
      if (lastMoveX.current !== null && lastMoveTime.current !== null) {
        const dt = now - lastMoveTime.current; //ms
        if (dt > 0) {
          const vx = (e.clientX - lastMoveX.current) / (dt / 1000); // px/sec
          velocityRef.current = vx;
          console.log("vx:", vx);
        }
      }
      lastMoveX.current = e.clientX;
      lastMoveTime.current = now;
      api.start({
        x: initialX + dx,
        y: initialY + dy,
        rotate: dx / 10,
        immediate: true,
      });
    }
  };

  const handlePointerUpWindow = (e: globalThis.PointerEvent) => {
    if (isTop && interactionMode === "swipe") {
      const dx = e.clientX - touchStartX.current;
      const vx = velocityRef.current;
      const speed = Math.abs(vx);
      const VELOC_THRESH = 800;
      const DIST_THRESH = 100;
      const isFlick = speed > VELOC_THRESH || Math.abs(dx) > DIST_THRESH;
      if (isFlick) {
        //becomes a flick
        const targetX =
          dx > 0 ? window.innerWidth * 1.2 : -window.innerWidth * 1.2;
        api.start({
          x: targetX,
          rotate: dx / 10,
          config: { tension: 200, friction: 20 },
          onRest: () => {
            setIsSwiping(false);
            onSwipe?.(dx > 0 ? "right" : "left");
          },
        });
      } else {
        //snap back to original position
        api.start({ x: initialX, y: initialY, rotate: 0 });
      }
      //reset velocity tracking
      lastMoveX.current = null;
      lastMoveTime.current = null;
      velocityRef.current = 0;
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
        x: position.x,
        y: position.y,
        rotate: position.rotate,
        //apply animated transform from spring
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
