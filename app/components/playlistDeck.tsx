"use client";
import { useState } from "react";
import styles from "../../components/playlistDeck.module.css";
import { PlaylistCardWidget } from "./playlistCardWidget";
import {
  useSprings,
  animated as a,
  to as interpolate,
} from "@react-spring/web";

// Deck needs to know what is gone, what is on top, what is next, and how much
// to render.
export function PlaylistDeck({ playlists }: { playlists: string[] }) {
  const [queue, setQueue] = useState(playlists);
  const [gone] = useState(() => new Set()); //for the playlists flicked away
  const [currentIndex, setCurrentIndex] = useState(0); //render top 2 cards
  const visibleCards = 2;

  const [springs, api] = useSprings(
    visibleCards,
    (index) => ({
      x: 0,
      scale: 1 - index * 0.05, // Scale down each card slightly
      opacity: 1 - index * 0.1, // Fade the second card slightly
      zIndex: visibleCards - index, // Ensure the top card is on top
      config: { tension: 500, friction: 50 }, //Spring physics
    }),
    []
  );

  const handleSwipe = () => {
    setQueue((prev) => prev.slice(1)); //remove the top playlist from the queue
    setCurrentIndex((prev) => prev + (1 % playlists.length)); //increment index
  };

  const getCurrentPlaylistId = (offset = 0) => {
    const index = (currentIndex + offset) % queue.length;
    return queue[index];
  };

  const top = getCurrentPlaylistId[0];
  const next = getCurrentPlaylistId[1]; //maybe stagger the top 2 cards.
  console.log("Length of playlists: ", playlists.length);
  console.log("Length of queue: ", queue.length);

  //Reminder: with drag gesture, use touch-action in css to make
  //sure phone scrolling doesn't happen

  return (
    <div className={styles.deckContainer}>
      {/* only map over the animated springs for the number of visible cards (top 2)*/}
      {springs.map((style, i) => {
        const playlistId = getCurrentPlaylistId(i);
        const isTopCard = i === 0; //only top card should be interactive
        if (!playlistId) return null; //if no playlist, skip rendering

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
          >
            {/* PlaylistCardWidget is the component that renders the actual playlist card */}
            <PlaylistCardWidget
              playlistId={playlistId}
              onSwipe={handleSwipe}
              isInteractive={isTopCard} //only the top card is interactive
              springApi={api} //pass the spring api for drag gestures
              cardIndex={i} //pass the index for styling
            />
          </a.div>
        );
      })}
      {/*next && (
        <div className={styles.backCard}>
          <iframe
            src={`https://open.spotify.com/embed/playlist/${next}`}
            loading="lazy"
          />
        </div>
      )}
      {top && <PlaylistCardWidget playlistId={top} onSwipe={handleSwipe} />*/}
    </div>
  );
}
