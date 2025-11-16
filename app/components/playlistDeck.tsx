"use client";
import { useState, useEffect, useRef } from "react";
import PlaylistCardWidget from "./playlistCardWidget";
import styles from "../../components/playlistDeck.module.css";
import { on } from "events";

//playlist deck needs to know how to display the card widgets propery for swiping.
export function PlaylistDeck({
  playlistIds,
  onCurrentChange,
}: {
  playlistIds: string[];
  onCurrentChange?: (index: number) => void;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const VISIBLE_COUNT = 2;
  const [queue, setQueue] = useState<string[]>(playlistIds);
  const [visible, setVisibile] = useState<string[]>(() =>
    playlistIds.slice(0, VISIBLE_COUNT)
  );
  const [leavingCard, setLeavingCard] = useState<string | null>(null);
  const nextIndexRef = useRef(VISIBLE_COUNT);

  //index of the top card within original playlistIds
  const currentTopIndexRef = useRef(0);

  //notify parent of initial top index
  useEffect(() => {
    currentTopIndexRef.current = 0;
    onCurrentChange?.(0);
  }, [playlistIds, onCurrentChange]);

  //keep local queue/visible in sync when playlistIds change
  useEffect(() => {
    setQueue(playlistIds);
    nextIndexRef.current = VISIBLE_COUNT;
    setVisibile(playlistIds.slice(0, VISIBLE_COUNT));
    currentTopIndexRef.current = 0;
    onCurrentChange?.(0);
  }, [playlistIds, onCurrentChange]);

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

  const resetDeck = () => {
    setQueue(playlistIds);
    nextIndexRef.current = VISIBLE_COUNT;
    setVisibile(playlistIds.slice(0, VISIBLE_COUNT));
    currentTopIndexRef.current = 0;
    onCurrentChange?.(0);
  };

  //handle swiping the top card
  const handleSwipe = (direction: "left" | "right") => {
    currentTopIndexRef.current += 1;
    onCurrentChange?.(currentTopIndexRef.current);

    const outgoing = visible[0];
    setLeavingCard(outgoing);
    setVisibile((prev) => prev.slice(1));
    setTimeout(() => {
      setLeavingCard(null);
      //opt: load next card if needed
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
        return [nextId];
      }
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
      {/* Button to reset deck when all cards are gone */}
      {visible.length === 0 && (
        <div className={styles.emptyContainer}>
          <button className={styles.resetButton} onClick={resetDeck}>
            Reset Deck
          </button>
        </div>
      )}
    </div>
  );
}
