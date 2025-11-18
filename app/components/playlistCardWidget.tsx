"use client";
import { useState, useRef, useEffect, useContext } from "react";
import { useSpring, animated as a } from "@react-spring/web";
import { useInteractionMode } from "./interactionModeContext";
import styles from "../../components/playlistCardWidget.module.css";

let nextZIndex = 100000; //make sure it starts high.

const bringToTop = () => ++nextZIndex;

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
  const [zIndex, setZIndex] = useState<number>(() => initialZ ?? 1000);
  const { interactionMode } = useInteractionMode();
  const [position, api] = useSpring(() => ({
    x: initialX,
    y: initialY,
    rotate: 0,
    config: { tension: 300, friction: 30 },
  }));
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const pointerStartedOnTopRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // velocity
  const lastMoveX = useRef<number | null>(null);
  const lastMoveTime = useRef<number | null>(null);
  const velocityRef = useRef(0); // px/sec

  useEffect(() => {
    if (!isSwiping) {
      //small delay to allow prefetch to load
      const timer = setTimeout(() => {
        api.start({
          y: initialY,
          config: { tension: 300, friction: 30 },
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isTop, initialY, api, isSwiping]);

  useEffect(() => {
    console.log(
      `Widget mounted: playlistId=${playlistId}, initialZ=${initialZ}, isTop=${isTop}`
    );
  }, [playlistId, initialZ, isTop]);

  useEffect(() => {
    isSwipingRef.current = isSwiping;
  }, [isSwiping]);

  const handlePointerDownWindow = (e: globalThis.PointerEvent) => {
    if (!isTop || interactionMode !== "swipe") return;
    //add to check if the touch starts on the top card.
    if (isTop && interactionMode === "swipe") {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) {
        pointerStartedOnTopRef.current = false;
        return;
      }
      pointerStartedOnTopRef.current = true;
      touchStartX.current = e.clientX;
      touchStartY.current = e.clientY;
      setIsSwiping(true);
      setZIndex(bringToTop());
      //initialize velocity tracking
      lastMoveX.current = e.clientX;
      lastMoveTime.current = e.timeStamp ?? Date.now();
      velocityRef.current = 0;
    }
  };

  const handlePointerMoveWindow = (e: globalThis.PointerEvent) => {
    if (
      isTop &&
      interactionMode === "swipe" &&
      isSwipingRef.current &&
      pointerStartedOnTopRef.current
    ) {
      const dx = e.clientX - touchStartX.current;
      const dy = e.clientY - touchStartY.current;
      //compute instantaneous velocity
      const now = e.timeStamp ?? Date.now();
      if (lastMoveX.current !== null && lastMoveTime.current !== null) {
        const dt = now - lastMoveTime.current; //ms
        if (dt > 0) {
          const vx = (e.clientX - lastMoveX.current) / (dt / 1000); // px/sec
          velocityRef.current = vx;
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
    if (!(isTop && interactionMode === "swipe")) return;
    //only process if pointerdown started on top card
    if (isTop && interactionMode === "swipe") {
      if (!pointerStartedOnTopRef.current) return;
      const dx = e.clientX - touchStartX.current;
      const vx = velocityRef.current;
      const speed = Math.abs(vx);
      const VELOC_THRESH = 1000;
      const isFlick = speed > VELOC_THRESH;
      console.log("is flick: ", isFlick, " card=", playlistId);
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
            pointerStartedOnTopRef.current = false;
            onSwipe?.(dx > 0 ? "right" : "left");
          },
        });
      } else {
        //snap back to original position
        api.start({ x: initialX, y: initialY, rotate: 0 });
        pointerStartedOnTopRef.current = false;
        setIsSwiping(false);
      }
      //reset velocity tracking
      lastMoveX.current = null;
      lastMoveTime.current = null;
      velocityRef.current = 0;
    }
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handlePointerDownReact = (e: React.PointerEvent) =>
    handlePointerDownWindow(e.nativeEvent as globalThis.PointerEvent);
  /*const handlePointerMoveReact = (e: React.PointerEvent) =>
    handlePointerMoveWindow(e.nativeEvent as globalThis.PointerEvent);
  const handlePointerUpReact = (e: React.PointerEvent) =>
    handlePointerUpWindow(e.nativeEvent as globalThis.PointerEvent);*/

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
      ref={containerRef}
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
        style={{ pointerEvents: isTop ? "auto" : "none" }}
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
