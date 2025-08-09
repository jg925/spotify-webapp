"use client";
import { useSpring, animated as a, to as interpolate } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { useState, memo } from "react";
import styles from "../../components/playlistCardWidget.module.css";

type CardProps = {
  playlistId: string;
  onSwipe: () => void;
  isInteractive?: boolean;
  springApi?: any;
  cardIndex?: number; // which index (0=top, 1=back)
};

// Card needs to know what playlist to show and its transformation
const PlaylistCardWidget = memo(
  function PlaylistCardWidget({
    playlistId,
    onSwipe,
    isInteractive = true,
    springApi,
    cardIndex = 0,
  }: CardProps) {
    // dragging state
    const [isDragging, setIsDragging] = useState(false);

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
        const isFlicked = !down && (Math.abs(vx) > 0.2 || Math.abs(mx) > 100);

        if (isFlicked) {
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
        } else {
          // on drag with no flick, snap back to center
          if (springApi) {
            springApi.start((i: number) => {
              if (i === cardIndex) {
                return {
                  x: down ? mx : 0,
                  scale: down ? 1.02 : 1, //subtler when lower ratio
                  rotation: down ? mx * 0.1 : 0, //rotate based on drag
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
    return (
      <div
        className={`${styles.card} ${isInteractive ? styles.interactive : ""}`} // conditional class for interactive cards
        style={{
          //cursor: isInteractive ? "grab" : "default",
          touchAction: "none",
          position: "relative", // overlay positioning
        }}
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
        />
        {/* conditional overlay for only top card */}
        {isInteractive && (
          <div
            {...bind()} // moved gester binding to overlay instead of container
            className={`${styles.overlay} ${isDragging ? styles.dragging : ""}`}
            //dynamic class based on dragging state
          />
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // custom comparison to prevent unnecessary re-renders
    return (
      prevProps.playlistId === nextProps.playlistId &&
      prevProps.isInteractive === nextProps.isInteractive &&
      prevProps.cardIndex === nextProps.cardIndex &&
      prevProps.springApi === nextProps.springApi
    );
  }
);

export { PlaylistCardWidget };
