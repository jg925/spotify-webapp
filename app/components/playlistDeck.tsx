"use client";
import { useState } from "react";
import styles from "../../components/playlistDeck.module.css";
import { PlaylistCardWidget } from "./playlistCardWidget";
import { useSpring, animated as a, to as interpolate } from "@react-spring/web";

// Deck needs to know what is gone, what is on top, what is next, and how much
// to render.
export function PlaylistDeck({ playlists }: { playlists: string[] }) {
  const [queue, setQueue] = useState(playlists);
  const [gone] = useState(() => new Set()); //for the playlists flicked away

  const handleSwipe = () => {
    setQueue((prev) => prev.slice(1));
  };

  const top = queue[0];
  const next = queue[1]; //maybe stagger the top 2 cards.
  console.log("Length of playlists: ", playlists.length);
  console.log("Length of queue: ", queue.length);

  //Reminder: with drag gesture, use touch-action in css to make
  //sure phone scrolling doesn't happen

  return (
    <a.div className={styles.deckContainer}>
      {next && (
        <div className={styles.backCard}>
          <iframe
            src={`https://open.spotify.com/embed/playlist/${next}`}
            loading="lazy"
          />
        </div>
      )}
      {top && <PlaylistCardWidget playlistId={top} onSwipe={handleSwipe} />}
    </a.div>
  );
}
