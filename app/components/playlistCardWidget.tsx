"use client";
import { useSpring, animated as a, to as interpolate } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import {
  useState,
  memo,
  useCallback,
  TouchEvent,
  MouseEvent,
  PointerEvent,
} from "react";
import styles from "../../components/playlistCardWidget.module.css";
import { useSwipeDetection } from "./useSwipeDetection"; // custom hook for swipe detection.
import { InteractionMode } from "./types";

type CardProps = {
  playlistId: string;
  onSwipe: () => void;
  onTap?: (playlistId: string) => void; // tap interactions
  isInteractive?: boolean;
  springApi?: any;
  cardIndex?: number; // which index (0=top, 1=back)
  interactionMode: InteractionMode; // global interaction mode
};

// Card needs to know what playlist to show and its transformation
const PlaylistCardWidget = memo(
  function PlaylistCardWidget({
    playlistId,
    onSwipe,
    onTap,
    isInteractive = true,
    springApi,
    cardIndex = 0,
    interactionMode,
  }: CardProps) {
    // dragging state
    const [isDragging, setIsDragging] = useState(false);

    const {
      isDragging: isGestureActive,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    } = useSwipeDetection();

    // Setup gesture using useDrag, but only if top card
    const bind = useDrag(
      ({
        down,
        movement: [mx, my],
        direction: [xDir],
        velocity: [vx],
        first, // first drag
        last, // end of drag
      }) => {
        //only top card responds to gestures
        if (!isInteractive) return;

        //tracking dragging state
        if (first) setIsDragging(true);
        if (last) setIsDragging(false);

        //only count as a flick if velocity is high enough
        const isFlicked = !down && (Math.abs(vx) > 0.3 || Math.abs(mx) > 120);

        if (isFlicked) {
          if (interactionMode === "swipe") {
            const flyX = xDir > 0 ? window.innerWidth : -window.innerWidth;

            if (springApi) {
              //animate the card off, animate next into place
              springApi.start((i: number) => {
                if (i === cardIndex) {
                  return {
                    x: flyX,
                    opacity: 0,
                    scale: 0.9, //smoother exit
                    config: { tension: 200, friction: 30 }, //lower friction = faster exit
                  };
                }
                // don't animate the second
                return {};
              });
            }
            //After animation completes, inform parent to update queue
            setTimeout(() => {
              onSwipe();
            }, 250); // snappier response = lower timeout
          }
        } else {
          // on drag with no flick, snap back to center
          if (springApi) {
            springApi.start((i: number) => {
              if (i === cardIndex) {
                return {
                  x: down ? (interactionMode === "swipe" ? mx : 0) : 0,
                  scale: down ? 1.02 : 1, //subtler when lower ratio
                  rotation: down
                    ? interactionMode === "swipe"
                      ? mx * 0.1
                      : 0
                    : 0, //rotate based on drag
                  config: {
                    tension: down ? 800 : 500,
                    friction: down ? 40 : 50, //smoother friction
                  },
                };
              }
              // second card stays in place
              return {};
            });
          }
        }
      },
      {
        axis: "x", //only allow horizontal dragging?
        bounds: { left: -200, right: 200 }, //soft bounds so card doesn't get dragged too far
        rubberband: true, //stretchy feeling
        pointer: { touch: true }, // allow touch gestures
        preventScroll: true, //prevent page scrolling during drag
      }
    );

    // handle tap
    const handlePointerUp = useCallback(
      (e: PointerEvent) => {
        const gesture = onTouchEnd();
        if (gesture === "tap" && !isGestureActive && onTap && isInteractive) {
          onTap(playlistId);
        }
      },
      [onTouchEnd, isGestureActive, onTap, playlistId, isInteractive]
    );

    const handleClick = useCallback(
      (e: MouseEvent) => {
        // prevent clicks during drag or in swipe
        if (isDragging || interactionMode === "swipe" || isGestureActive) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (onTap && isInteractive) {
          onTap(playlistId); // call tap callback
        }
      },
      [
        isDragging,
        interactionMode,
        isGestureActive,
        onTap,
        playlistId,
        isInteractive,
      ]
    );

    return (
      // gesture detection in main container, not just pointer events
      <a.div
        className={`${styles.card} ${isInteractive ? styles.interactive : ""} ${
          interactionMode === "tap" ? styles.tapMode : styles.swipeMode
        }`} // conditional class for interactive cards
        style={{
          touchAction: "none",
          position: "relative", // overlay positioning
          // visual feedback on mode
          cursor: isInteractive // probably won't need this because mobile view, unless stylus
            ? interactionMode === "tap"
              ? "pointer"
              : "grab"
            : "default",
          //probably delete this later
          border:
            interactionMode === "tap" && isInteractive
              ? "2px solid #1DB954"
              : "none",
          //probably also delete this later
          boxShadow:
            interactionMode === "tap" && isInteractive
              ? "0 0 20px rgba(29, 185, 84, 0.3)"
              : undefined,
        }}
        // touch handlers for gestures
        onClick={(e) => e.stopPropagation()} // prevent click events from bubbling up
        onTouchStart={isInteractive ? onTouchStart : undefined}
        onTouchMove={isInteractive ? onTouchMove : undefined}
        onTouchEnd={(e) => e.stopPropagation()} // prevent touch events from bubbling up
      >
        {/* spotify playlist embed */}
        <iframe
          src={`https://open.spotify.com/embed/playlist/${playlistId}`}
          width="100%"
          height="100%"
          frameBorder="0"
          className={styles.iframe}
          allow="encrypted-media;"
          loading="lazy"
          style={{
            pointerEvents:
              interactionMode === "tap" && isInteractive ? "auto" : "none",
          }}
          // prevent iframe from blocking long press events
          onClick={(e) => e.stopPropagation()} // prevent click events from bubbling up
          onTouchEnd={(e) => e.stopPropagation()} // prevent touch events from bubbling up
          //onTouchStart={(e) => {
          //  if (interactionMode === "tap") {
          //    e.stopPropagation(); // prevent iframe from capturing touch events
          //  }
          //}}
        />
      </a.div>
    );
  },
  (prevProps, nextProps) => {
    // custom comparison to prevent unnecessary re-renders
    return (
      prevProps.playlistId === nextProps.playlistId &&
      prevProps.isInteractive === nextProps.isInteractive &&
      prevProps.cardIndex === nextProps.cardIndex &&
      prevProps.springApi === nextProps.springApi &&
      prevProps.onTap === nextProps.onTap
    );
  }
);

export { PlaylistCardWidget };
