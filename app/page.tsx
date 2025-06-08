import { PlaylistStack } from "./playlistStack";
import { getMyPublicPlaylists } from "./spotify";

const userId = process.env.SPOTIFY_USER_ID;

export default async function Page() {
  const playlistIds = await getMyPublicPlaylists(userId);

  return (
    <div className="pageContainer">
      <div className="text">
        <h1>Shadow's Public Spotify Playlists</h1>
        <p>Click and hold the Shift key to drag the playlists around.</p>
        <p>I have **too many** playlists, they take a while to load.</p>
      </div>

      <PlaylistStack playlistIds={playlistIds} />
    </div>
  );
}
