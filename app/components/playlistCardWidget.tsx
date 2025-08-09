"use client";
import { useSpring, animated as a, to as interpolate } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import styles from "../../components/playlistCardWidget.module.css";

type CardProps = {
  playlistId: string;
  onSwipe: () => void;
  isInteractive?: boolean;
  springApi?: any;
  cardIndex?: number; // which index (0=top, 1=back)
};

// Card needs to know what playlist to show and its transformation
export function PlaylistCardWidget({
  playlistId,
  onSwipe,
  isInteractive = true,
  springApi,
  cardIndex = 0,
}: CardProps) {
  // Setup gesture using useDrag, but only if top card
  const bind = useDrag(
    ({ down, movement: [mx], direction: [xDir], velocity: [vx] }) => {
      //only top card responds to gestures
      if (!isInteractive) return;

      //only count as a flick if velocity is high enough
      const isFlicked = !down && (Math.abs(vx) > 0.3 || Math.abs(mx) > 150);

      if (isFlicked) {
        const flyX = mx > 0 ? window.innerWidth : -window.innerWidth;

        if (springApi) {
          //animate the card off, animate next into place
          springApi.start((i: number) => {
            if (i === cardIndex) {
              return {
                x: flyX,
                opacity: 0,
                config: { tension: 200, friction: 30 },
              };
            }
            // second card animates forward
            return {
              x: 0,
              scale: 1,
              opacity: 1,
              zIndex: 2,
              config: { tension: 500, friction: 50 },
            };
          });
        }
        //After animation completes, inform parent to update queue
        setTimeout(() => {
          onSwipe();
        }, 300);
      } else {
        // on drag with no flick, snap back to center
        if (springApi) {
          springApi.start((i: number) => {
            if (i === cardIndex) {
              return {
                x: down ? mx : 0,
                scale: down ? 1.05 : 1,
                config: { tension: down ? 800 : 500, friction: 50 },
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
    }
  );
  return (
    <div
      {...(isInteractive ? bind() : {})}
      className={styles.cardContainer}
      style={{
        cursor: isInteractive ? "grab" : "default",
        touchAction: "none",
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
        style={{ pointerEvents: isInteractive ? "auto" : "none" }}
      />
    </div>
  );
}
