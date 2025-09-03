"use client";
import { PlaylistStack } from "./components/playlistStack";
import { PlaylistDeck } from "./components/playlistDeck";
import {
  InteractionModeProvider,
  useInteractionMode,
} from "./components/interactionModeContext";
import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { retrievePlaylists } from "./retrievePlaylists";
import { isMobile } from "../hooks/isMobile";

function PageContent() {
  const [playlistIds, setPlaylistIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { interactionMode, resetToSwipeMode, setInteractionMode } =
    useInteractionMode();

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        console.log("Fetching playlists on page...");
        const playlistIds = await retrievePlaylists();
        if (playlistIds.length > 0) {
          setPlaylistIds(playlistIds);
        } else {
          console.warn("No playlists found or failed to fetch.");
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
        setError("Failed to fetch playlists. Please try again later.");
      }
    }
    fetchPlaylists();
  }, []);

  // Check if the user is on a mobile device
  const useMobile = isMobile();
  const [currentIndex, setCurrentIndex] = useState(0);

  // memoize the callback to prevent PlaylistDeck from re-rendering
  const handleCurrentChange = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // handler outside clicks
  const handleGlobalClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // only reset to swipe mode if currently in tap mode
      if (interactionMode === "tap") {
        resetToSwipeMode();
      }
    },
    [interactionMode, resetToSwipeMode]
  );

  //memoize the deck component
  const playlistDeck = useMemo(() => {
    if (playlistIds.length === 0) return null;

    return (
      <PlaylistDeck
        playlists={playlistIds}
        onCurrentChange={handleCurrentChange}
      />
    );
  }, [playlistIds, handleCurrentChange]);

  return (
    <div
      onClick={handleGlobalClick}
      onTouchEnd={handleGlobalClick}
      style={{ minHeight: "100vh", width: "100%" }}
    >
      <head>
        <link rel="icon" href="/assets/favico.png" />
        <title>My Public Spotify Playlists</title>
      </head>
      <div className="text">
        <h1>My Public Spotify Playlists</h1>
        {/* conditionally display instruction text */}
        {useMobile ? (
          <p>
            Swipe the playlist deck to flip through the playlists. Press and
            hold on the embed to switch into Tap Mode to be able to interact
            with embed. Tap again on or around the embed to switch back to Swipe
            Mode.
          </p>
        ) : (
          <p>Hold the Shift key and click to drag the playlists around.</p>
        )}

        {error ? (
          <p className="error">{error}</p>
        ) : (
          <p>
            I have {playlistIds.length} public playlists, they take a while to
            load.
          </p>
        )}
      </div>
      {/*Conditionally render playlistStack or playlistDeck.*/}
      {useMobile ? (
        <div className="mobileView">
          {playlistIds.length > 0 && (
            <div
              style={{
                width: "100%",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "20px",
                color: "white",
                margin: "20px 0",
              }}
            >
              {currentIndex + 1} / {playlistIds.length}
            </div>
          )}
          {playlistDeck}
        </div>
      ) : (
        <div className="desktopView">
          {playlistIds.length > 0 && (
            <PlaylistStack playlistIds={playlistIds} />
          )}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    // wrap entire app with interaction mode provider
    <InteractionModeProvider>
      <PageContent />
    </InteractionModeProvider>
  );
}
