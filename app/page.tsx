import { PlaylistStack } from "./playlistStack";
import { getMyPublicPlaylists } from "./spotify";
import Head from "next/head";

const userId = process.env.SPOTIFY_USER_ID;

export default async function Page() {
  const playlistIds = await getMyPublicPlaylists(userId);

  return (
    <div className="pageContainer">
      <head>
        <title>My Public Spotify Playlists</title>
      </head>
      <div className="text">
        <h1>My Public Spotify Playlists</h1>
        <p>Click and hold the Shift key to drag the playlists around.</p>
        <p>
          I have {playlistIds.length} public playlists, they take a while to
          load.
        </p>
      </div>

      <PlaylistStack playlistIds={playlistIds} />
    </div>
  );
}
