import useState from "react";
import PlaylistWidget from "./playlistWidget";
import SpotifyWebApi from "spotify-web-api-js";

export const spotifyApi = new SpotifyWebApi();

spotifyApi.setAccessToken(process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "");

export default function Page() {
  function LibraryBody() {
    return (
      <div>
        <p>I'm the library body.</p>
        <PlaylistWidget playlist="1" />
        <PlaylistWidget playlist="2" />
      </div>
    );
  }

  return (
    <div>
      <h1>Shadow's Public Spotify Playlists</h1>
      <LibraryBody />
    </div>
  );
}
