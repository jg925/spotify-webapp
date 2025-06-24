"use client";
import { useState, useEffect } from "react";
import PlaylistWidget from "./playlistWidget";

export function PlaylistStack({ playlistIds }: { playlistIds: string[] }) {
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
          <PlaylistWidget
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
