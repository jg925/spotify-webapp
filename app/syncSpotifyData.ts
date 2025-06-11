import { db } from "./lib/firebaseAdmin";
import { getMyPublicPlaylists } from "./lib/spotify";

export async function syncPlaylistsToFirestore(userId: string) {
  const playlistIds = await getMyPublicPlaylists(userId);

  await db
    .collection("playlists")
    .doc("playlistIds")
    .set(
      { id: playlistIds, lastUpdated: new Date().toISOString() },
      { merge: true }
    );

  console.log(`Synced ${playlistIds.length} playlists to Firestore.`);
}
