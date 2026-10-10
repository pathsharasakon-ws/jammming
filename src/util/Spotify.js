const clientId = '778049b9b1af40f2827377b48aeb7be9';
const redirectUri = 'http://127.0.0.1:5173/';

// Helper functions สำหรับสร้าง PKCE Challenge
function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const Spotify = {
  async getAccessToken() {
    const accessToken = localStorage.getItem('access_token');
    const tokenExpiry = localStorage.getItem('token_expiry');

    // ถ้ามี Token อยู่และยังไม่หมดอายุ
    if (accessToken && Date.now() < Number(tokenExpiry)) {
      return accessToken;
    }

    // ตรวจสอบว่าเพิ่ง Redirect กลับมาพร้อม code หรือไม่
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      const codeVerifier = localStorage.getItem('code_verifier');

      const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      };

      try {
        const body = await fetch('https://accounts.spotify.com/api/token', payload);
        const response = await body.json();

        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('token_expiry', Date.now() + response.expires_in * 1000);
          window.history.replaceState({}, document.title, '/');
          return response.access_token;
        }
      } catch (err) {
        console.error('Error exchanging code for token:', err);
      }
    } else {
      // ส่งไปหน้าล็อกอินพร้อม PKCE
      const verifier = generateRandomString(64);
      const challenge = await generateCodeChallenge(verifier);

      localStorage.setItem('code_verifier', verifier);

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        scope: 'playlist-modify-public playlist-modify-private',
        code_challenge_method: 'S256',
        code_challenge: challenge,
        redirect_uri: redirectUri,
      });

      window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    }
  },

  async search(term) {
    const token = await Spotify.getAccessToken();
    if (!token) return [];

    try {
      const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const jsonResponse = await response.json();
      if (!jsonResponse.tracks) return [];

      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) return;

    const token = await Spotify.getAccessToken();
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      const userRes = await fetch('https://api.spotify.com/v1/me', { headers });
      const userData = await userRes.json();

      const playlistRes = await fetch(`https://api.spotify.com/v1/users/${userData.id}/playlists`, {
        headers,
        method: 'POST',
        body: JSON.stringify({ name: name, description: 'Created with Jammming' })
      });
      const playlistData = await playlistRes.json();

      await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
        headers,
        method: 'POST',
        body: JSON.stringify({ uris: trackUris })
      });
    } catch (err) {
      console.error('Save playlist error:', err);
    }
  }
};

export default Spotify;