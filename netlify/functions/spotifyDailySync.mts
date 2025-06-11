import { syncPlaylistsToFirestore } from "../../app/syncSpotifyData.ts";
import { Config } from "@netlify/functions";

export default async (req, context) => {
  const userId = process.env.SPOTIFY_USER_ID;
  if (!userId) {
    throw new Error("SPOTIFY_USER_ID environment variable is not defined.");
  }
  await syncPlaylistsToFirestore(userId);
  return new Response(
    JSON.stringify({ message: "Playlists synced successfully." }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};

export const config: Config = {
  schedule: "@daily",
};
