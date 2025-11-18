import { db } from "./lib/firebase";
import { doc, getDocFromServer, setLogLevel } from "firebase/firestore";

//setLogLevel("debug");

export async function retrievePlaylists() {
  const cacheKey = "playlistIdsCache";
  try {
    // Check for playlist cache
    const cachedPlaylists = localStorage.getItem(cacheKey);
    const cachedExpiry = localStorage.getItem("playlistIdsCacheExpiry");
    if (cachedPlaylists && cachedExpiry) {
      const expiryTime = parseInt(cachedExpiry, 10);
      if (Date.now() < expiryTime) {
        console.log("Using cached playlists");
        return JSON.parse(cachedPlaylists);
      }
    }
    const docRef = doc(db, "playlists", "playlistIds");
    // Fetch playlist IDs from Firestore
    for (let i = 0; i < 3; i++) {
      try {
        console.log(`before docSnap attempt ${i + 1}`);
        const docSnap = await getDocFromServer(docRef);
        console.log(`after docSnap attempt ${i + 1}`);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Document data", data);
          const playlistIds = Array.isArray(data.id) ? data.id : [];
          if (playlistIds.length === 0) {
            console.warn("No playlists found in Firestore.");
          }

          //Cache the playlists in localStorage
          localStorage.setItem(cacheKey, JSON.stringify(playlistIds));
          console.log("Fetched playlists from Firestore");
          return playlistIds;
        } else {
          console.error("No such document!");
          return [];
        }
      } catch (error) {
        if (error.code === "unavailable") {
          console.warn("Firestore is unavailable, retrying...");
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error("Error retrieving playlists:", error);
    return [];
  }
}
