import React, { useState } from 'react';
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import Playlist from "./components/Playlist";
import Spotify from '././util/Spotify';
import './App.css';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState('New Playlist');
  const [playlistTracks, setPlaylistTracks] = useState([]);

  // ค้นหาเพลงผ่าน Spotify API
  const search = async (term) => {
    const results = await Spotify.search(term);
    setSearchResults(results);
  };

  // เพิ่มเพลงไปยัง Playlist (ป้องกันเพลงซ้ำ)
  const addTrack = (track) => {
    if (playlistTracks.some(savedTrack => savedTrack.id === track.id)) return;
    setPlaylistTracks([...playlistTracks, track]);
  };

  // ลบเพลงออกจาก Playlist
  const removeTrack = (track) => {
    setPlaylistTracks(playlistTracks.filter(savedTrack => savedTrack.id !== track.id));
  };

  // บันทึก Playlist ไปยัง Spotify
  const savePlaylist = () => {
    const trackUris = playlistTracks.map(track => track.uri);
    Spotify.savePlaylist(playlistName, trackUris).then(() => {
      setPlaylistName('New Playlist');
      setPlaylistTracks([]);
    });
  };

  return (
    <div className="App">
      <h1>Ja<span className="highlight">mmm</span>ing</h1>
      <SearchBar onSearch={search} />
      
      <div className="App-playlist">
        <SearchResults searchResults={searchResults} onAdd={addTrack} />
        <Playlist 
          playlistName={playlistName} 
          playlistTracks={playlistTracks} 
          onNameChange={setPlaylistName}
          onRemove={removeTrack}
          onSave={savePlaylist}
        />
      </div>
    </div>
  );
}

export default App;