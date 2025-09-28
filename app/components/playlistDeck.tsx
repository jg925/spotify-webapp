"use client";
import { useState, useEffect } from "react";
import PlaylistCardWidget from "./playlistCardWidget";

//playlist deck needs to know how to display the card widgets propery for swiping.
export function PlaylistDeck({ playlistIds }: { playlistIds: string[] }) {
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateContainerWidth = () => {
      const container = document.querySelector(".playlistContainer");
      if (container) {
        setContainerWidth(container.clientWidth);
      }
    };
    updateContainerWidth(); // Initial width on mount
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, []);

  const columnWidth = containerWidth / 3;
  const rowHeight = 20; // Adjust as needed

  return (
    <div className="playlistContainer">
      {playlistIds.map((p, index) => {
        const column = Math.floor(index / 10);
        const row = index % 10;
        return (
          <PlaylistCardWidget
            key={p}
            playlistId={p}
            initialX={column * columnWidth}
            initialY={row * rowHeight} //stagger vertically
          />
        );
      })}
    </div>
  );
}
