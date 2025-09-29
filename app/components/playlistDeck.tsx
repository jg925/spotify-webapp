"use client";
import { useState, useEffect, useRef } from "react";
import PlaylistCardWidget from "./playlistCardWidget";
import styles from "../../components/playlistDeck.module.css";

//playlist deck needs to know how to display the card widgets propery for swiping.
export function PlaylistDeck({ playlistIds }: { playlistIds: string[] }) {
  const [containerWidth, setContainerWidth] = useState(0);
  const VISIBLE_COUNT = 2;
  const [queue, setQueue] = useState<string[]>(playlistIds);
  const [visible, setVisibile] = useState<string[]>(() =>
    playlistIds.slice(0, VISIBLE_COUNT)
  );
  const nextIndexRef = useRef(VISIBLE_COUNT);

  useEffect(() => {
    setQueue(playlistIds);
    nextIndexRef.current = VISIBLE_COUNT;
    setVisibile(playlistIds.slice(0, VISIBLE_COUNT));
  }, [playlistIds]);

  useEffect(() => {
    const updateContainerWidth = () => {
      const container = document.querySelector(".deckContainer");
      if (container) {
        setContainerWidth(container.clientWidth);
      }
    };
    updateContainerWidth(); // Initial width on mount
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, []);

  const cardWidth = 400;
  const columnCenter = containerWidth ? (containerWidth - cardWidth) / 2 : 0;
  const rowHeight = 20; // Adjust as needed

  //handle swiping the top card
  const handleSwipe = (direction: "left" | "right") => {
    setVisibile((prev) => {
      const [, ...rest] = prev; //drop the top
      const nextId = queue[nextIndexRef.current];
      if (nextId) {
        nextIndexRef.current += 1;
        //prefetch next embed (hidden iframe to warm cache)
        const url = `https://open.spotify.com/embed/playlist/${nextId}`;
        const iframe = document.createElement("iframe");
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.position = "absolute";
        iframe.style.left = "-9999px";
        iframe.src = url;
        iframe.loading = "lazy";
        document.body.appendChild(iframe);
        setTimeout(() => iframe.remove(), 5000);
        return [...rest, nextId];
      }
      return rest;
    });
  };

  return (
    <div className={styles.deckContainer}>
      {visible.map((p, index) => {
        const stackIndex = visible.length - index - 1;
        const baseZ = 1000;
        const initialX = columnCenter; // center horizontally
        const initialY = stackIndex * rowHeight; //slight vertical stagger
        const initialZ = baseZ + (visible.length - index); // top card is on top
        const isTop = index === 0;
        return (
          <PlaylistCardWidget
            key={p}
            playlistId={p}
            initialX={initialX} //all in one column
            initialY={initialY} //stagger vertically
            isTop={isTop}
            initialZ={initialZ}
            onSwipe={isTop ? handleSwipe : undefined}
          />
        );
      })}
    </div>
  );
}
