"use client";
import { useState, useEffect, useRef } from "react";
import { useSpring, animated as a, to as interpolate } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import styles from "../../components/playlistCardWidget.module.css";

type CardProps = {
  playlistId: string;
  onSwipe: () => void;
};

// Card needs to know what playlist to show and its transformation
export function PlaylistCardWidget({ playlistId, onSwipe }: CardProps) {
  return (
    <a.div>
      <iframe
        key={playlistId}
        src={`https://open.spotify.com/embed/playlist/${playlistId}`}
        className={styles.iframe}
        allow="encrypted-media;"
        loading="lazy"
      />
    </a.div>
  );
}
