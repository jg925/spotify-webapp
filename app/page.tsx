"use client";
import { PlaylistStack } from "./components/playlistStack";
//import { PlaylistDeck } from "./components/playlistDeck";
import { useState, useEffect } from "react";
import { retrievePlaylists } from "./retrievePlaylists";
import { isMobile } from "../hooks/isMobile";
//import { PlaylistCardWidget } from "./components/playlistCardWidget";

export default function Page() {
  const [playlistIds, setPlaylistIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="pageContainer">
      <head>
        <link rel="icon" href="/assets/favico.png" />
        <title>My Public Spotify Playlists</title>
      </head>
      <div className="text">
        <h1>My Public Spotify Playlists</h1>
        <p>Hold the Shift key and click to drag the playlists around.</p>
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
          <p className="text">
            Please swap to desktop view. Mobile view is not setup.
          </p>
          {/*playlistIds.length > 0 && <PlaylistDeck playlists={playlistIds} />*/}
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
