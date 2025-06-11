"use client";
import { PlaylistStack } from "./playlistStack";
import { useState, useEffect } from "react";
import { retrievePlaylists } from "./retrievePlaylists";

export default function Page() {
  const [playlistIds, setPlaylistIds] = useState<string[]>([]);
  useEffect(() => {
    async function fetchPlaylists() {
      const playlistIds = await retrievePlaylists();
      setPlaylistIds(playlistIds);
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
        <p>
          I have {playlistIds.length} public playlists, they take a while to
          load.
        </p>
      </div>

      <PlaylistStack playlistIds={playlistIds} />
    </div>
  );
}
