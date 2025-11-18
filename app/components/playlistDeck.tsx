"use client";
import { useState, useEffect, useRef } from "react";
import PlaylistCardWidget from "./playlistCardWidget";
import styles from "../../components/playlistDeck.module.css";

// playlist deck needs to know how to display the card widgets properly for swiping.
export function PlaylistDeck({
  playlistIds,
  onCurrentChange,
}: {
  playlistIds: string[];
  onCurrentChange?: (index: number) => void;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const VISIBLE_COUNT = 2;
  const BASE_Z = 1000; //base Z so initialZ values for prefetched cards are low enough

  // master queue and visible slice
  const [queue, setQueue] = useState<string[]>(playlistIds);
  const [visible, setVisibile] = useState<string[]>(() =>
    playlistIds.slice(0, VISIBLE_COUNT)
  );

  const nextIndexRef = useRef(VISIBLE_COUNT); // next index in queue to pull
  const currentTopIndexRef = useRef(0); // index (in original playlistIds) of current top
  const handlingSwipeRef = useRef(false); // prevent re-entrance

  // notify parent of initial top index
  useEffect(() => {
    currentTopIndexRef.current = 0;
    onCurrentChange?.(0);
  }, [playlistIds, onCurrentChange]);

  // keep local queue/visible in sync when playlistIds change
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
      if (container) setContainerWidth(container.clientWidth);
    };
    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, []);

  const cardWidth = 400;
  const columnCenter = containerWidth ? (containerWidth - cardWidth) / 2 : 0;
  const rowHeight = 20;

  const resetDeck = () => {
    setQueue(playlistIds);
    nextIndexRef.current = VISIBLE_COUNT;
    setVisibile(playlistIds.slice(0, VISIBLE_COUNT));
    currentTopIndexRef.current = 0;
    onCurrentChange?.(0);
    handlingSwipeRef.current = false;
  };

  // called when the top card's widget completes its fly-away animation
  const handleSwipe = (direction: "left" | "right") => {
    if (handlingSwipeRef.current) return; // prevent re-entrance
    handlingSwipeRef.current = true;
    // advance top index and notify parent
    currentTopIndexRef.current += 1;
    onCurrentChange?.(currentTopIndexRef.current);

    // drop the top id, append next queued id (if any)
    setVisibile((prev) => {
      const [, ...rest] = prev; // remove first element
      const nextId = queue[nextIndexRef.current];
      if (nextId) {
        nextIndexRef.current += 1;

        // prefetch the next embed to warm the browser cache
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

        // new visible: [old index 1, new prefetched card]
        // old index 1 becomes index 0 (new top)
        // new card becomes index 1 (behind)
        return [...rest, nextId];
      }
      // no more queued ids: just remove the top
      return rest;
    });

    //small delay to avoid race widget conditions
    setTimeout(() => {
      handlingSwipeRef.current = false;
    }, 50);
  };

  return (
    <div className={styles.deckContainer}>
      {visible
        .slice()
        .reverse()
        .map((p, index) => {
          const actualIndex = visible.length - 1 - index;
          const isTop = actualIndex === 0;
          const initialZ = BASE_Z + (VISIBLE_COUNT - actualIndex);
          const stackIndex = visible.length - actualIndex - 1;
          const initialX = columnCenter;
          const initialY = stackIndex * rowHeight;

          return (
            <PlaylistCardWidget
              key={p}
              playlistId={p}
              initialX={initialX}
              initialY={initialY}
              isTop={isTop}
              initialZ={initialZ}
              onSwipe={isTop ? handleSwipe : undefined}
            />
          );
        })}

      {/* show Reset when deck is exhausted */}
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
