"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import styles from "../../components/playlistDeck.module.css";
import { PlaylistCardWidget } from "./playlistCardWidget";
import { useInteractionMode } from "./interactionModeContext";
import { useSprings, animated as a } from "@react-spring/web";

// Deck needs to know what is gone, what is on top, what is next, and how much
// to render.
export function PlaylistDeck({
  playlists,
  onCurrentChange, // playlist tracking like a page number.
}: {
  playlists: string[];
  onCurrentChange?: (index: number) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0); //render top 2 cards
  const visibleCards = 2;

  // global interaction mode
  const { interactionMode, resetToSwipeMode } = useInteractionMode();

  // memoize spring config prevent recreation[57]
  const springConfig = useMemo(() => {
    return {
      tension: 500,
      friction: 50,
    };
  }, []);

  const [springs, api] = useSprings(
    visibleCards,
    (index) => ({
      x: 0,
      scale: 1 - index * 0.03, // Scale down each card slightly
      opacity: 1 - index * 0.15, // Fade the second card slightly
      zIndex: visibleCards - index, // Ensure the top card is on top
      rotation: 0, // better animations
      config: springConfig, // use the memoized config
    }),
    [springConfig] //only recreate springs if config changes
  );

  // call the parent's callback when the current index changes
  useEffect(() => {
    if (onCurrentChange) {
      onCurrentChange(currentIndex);
    }
  }, [currentIndex, onCurrentChange]);

  //handle swipe is a callback to prevent recreation[56å] ?
  const handleSwipe = useCallback(() => {
    //setQueue((prev) => prev.slice(1)); //remove the top playlist from the queue
    setCurrentIndex((prev) => prev + (1 % playlists.length)); //increment index
  }, [playlists.length]);

  const handleTap = useCallback((playlistId: string) => {
    console.log("Playlist tapped:", playlistId);
    // handle tap interaction
  }, []);

  /*const handleOutsideClick = useCallback(
    (e: React.TouchEvent) => {
      // only reset to swipe mode if currently in tap mode
      if (interactionMode === "tap") {
        console.log("outside area tapped, switching to swipe mode");
        resetToSwipeMode();
      }
    },
    [interactionMode, resetToSwipeMode]
  );*/

  // memoize getCurrentPlaylistId
  const getCurrentPlaylistId = useCallback(
    (offset = 0) => {
      const index = (currentIndex + offset) % playlists.length;
      return playlists[index]; // use the original playlists array
    },
    [currentIndex, playlists]
  );

  const top = getCurrentPlaylistId(0);
  const next = getCurrentPlaylistId(1); //maybe stagger the top 2 cards.
  console.log("Length of playlists: ", playlists.length);
  console.log("currentIndex: ", currentIndex);
  console.log("top playlist:", top);
  console.log("next playlist:", next);

  //Reminder: with drag gesture, use touch-action in css to make
  //sure phone scrolling doesn't happen
  const renderedCards = useMemo(() => {
    return springs.map((style, i) => {
      const playlistId = getCurrentPlaylistId(i);
      const isTopCard = i === 0; //only top card should be interactive
      if (!playlistId) return null; //if no playlist, skip rendering
      //<div className={styles.deckContainer}>
      {
        /* only map over the animated springs for the number of visible cards (top 2)*/
      }
      return (
        // The animated container for each playlist card
        <a.div
          key={`${currentIndex}-${i}`}
          style={{
            ...style, //apply all animated styles from useSprings
            position: "absolute", // stack cards
            width: "300px",
            height: "380px",
            touchAction: "none", // prevent browser from intercepting touch gestures
            //use react-spring's transform for animation (drag and flick)
            transform: style.x.to(
              (x) => `translateX(${x}px) scale(${style.scale.get()})`
            ),
          }}
          onTouchEnd={(e) => e.stopPropagation()} //prevent touch events from bubbling up
        >
          {/* PlaylistCardWidget is the component that renders the actual playlist card */}
          <PlaylistCardWidget
            playlistId={playlistId}
            onSwipe={handleSwipe}
            onTap={handleTap}
            isInteractive={isTopCard} //only the top card is interactive
            springApi={api} //pass the spring api for drag gestures
            cardIndex={i} //pass the index for styling
          />
        </a.div>
      );
    });
  }, [
    springs,
    currentIndex,
    getCurrentPlaylistId,
    handleSwipe,
    api,
    handleTap,
  ]);
  return (
    <div
      className={styles.deckContainer}
      onClick={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {renderedCards}
    </div>
  );
}
