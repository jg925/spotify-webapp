const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const authOptions = {
  url: "https://accounts.spotify.com/api/token",
  headers: {
    Authorization:
      "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
  },
  form: {
    grant_type: "client_credentials",
  },
  json: true,
};

async function getAccessToken() {
  console.log("Cliend Id: ", clientId);
  console.log("Client Secret: ", clientSecret);
  const response = await fetch(authOptions.url, {
    method: "POST",
    headers: authOptions.headers,
    body: new URLSearchParams(authOptions.form),
  });
  const clonedResponse = response.clone();
  console.log("Response status: ", clonedResponse.status);
  if (response.ok && response.status == 200) {
    const accessTokenData = await response.json();
    return accessTokenData.access_token;
  } else {
    throw new Error("Failed to fetch access token");
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getMyPublicPlaylists(userId: string): Promise<string[]> {
  const accessToken = await getAccessToken();
  console.log("Access Token: ", accessToken);
  await sleep(500);
  const response = await fetch(
    `https://api.spotify.com/v1/users/${userId}/playlists?`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const clonedResponse = response.clone();
  console.log("Response status: ", clonedResponse.status);
  if (!response.ok) {
    throw new Error("Failed to fetch playlists");
  }

  const data = await response.json();
  const playlistIds = data.items
    .filter((p) => p.public)
    .filter((p) => p.owner.id == userId)
    .map((p) => p.id);
  console.log("number of playlists: " + playlistIds.length);
  return playlistIds;
}
