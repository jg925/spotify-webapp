"use client";
import { useState, useEffect } from "react";
import PlaylistCardWidget from "./playlistCardWidget";
import styles from "../../components/playlistDeck.module.css";

//playlist deck needs to know how to display the card widgets propery for swiping.
export function PlaylistDeck({ playlistIds }: { playlistIds: string[] }) {
  const [containerWidth, setContainerWidth] = useState(0);

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

  const visible = playlistIds.slice(0, 2);

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
          />
        );
      })}
    </div>
  );
}
