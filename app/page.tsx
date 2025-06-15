"use client";
import { PlaylistStack } from "./playlistStack";
import { useState, useEffect } from "react";
import { retrievePlaylists } from "./retrievePlaylists";

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

      {/*Conditionally render playlistStack.*/}
      {playlistIds.length > 0 && <PlaylistStack playlistIds={playlistIds} />}
    </div>
  );
}
