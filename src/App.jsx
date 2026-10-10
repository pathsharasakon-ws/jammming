import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Playlist from './components/Playlist';
import Spotify from './util/Spotify';

function App() {
  // States สำหรับจัดการผลการค้นหาและ Playlist
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState('New Playlist');
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [isSaving, setIsSaving] = useState(false); // State จัดการสถานะกำลังบันทึก

  // 1. ค้นหาเพลงผ่าน Spotify API
  const search = (term) => {
    if (!term) return;
    Spotify.search(term).then((results) => {
      setSearchResults(results);
    });
  };

  // 2. เพิ่มเพลงจากผลการค้นหาเข้า Playlist (ป้องกันการเพิ่มเพลงซ้ำ)
  const addTrack = (track) => {
    if (playlistTracks.some((savedTrack) => savedTrack.id === track.id)) {
      return;
    }
    setPlaylistTracks((prevTracks) => [...prevTracks, track]);
  };

  // 3. ลบเพลงออกจาก Playlist
  const removeTrack = (track) => {
    setPlaylistTracks((prevTracks) =>
      prevTracks.filter((savedTrack) => savedTrack.id !== track.id)
    );
  };

  // 4. อัปเดตชื่อ Playlist
  const updatePlaylistName = (name) => {
    setPlaylistName(name);
  };

  // 5. บันทึก Playlist ไปยังบัญชี Spotify พร้อมจัดการ Loading State
  const savePlaylist = () => {
    const trackUris = playlistTracks.map((track) => track.uri);
    if (!trackUris.length) return;

    setIsSaving(true); // เริ่มบันทึก: ตั้งค่า loading เป็น true

    Spotify.savePlaylist(playlistName, trackUris)
      .then(() => {
        // เมื่อบันทึกสำเร็จ ให้รีเซ็ตชื่อและแทร็กใน Playlist
        setPlaylistName('New Playlist');
        setPlaylistTracks([]);
      })
      .catch((error) => {
        console.error('Error saving playlist:', error);
      })
      .finally(() => {
        setIsSaving(false); // จบการทำงาน: คืนสถานะ loading เป็น false
      });
  };

  return (
    <div className="App">
      <h1>
        Ja<span>mmm</span>ing
      </h1>

      <SearchBar onSearch={search} />

      <div className="App-playlist">
        <SearchResults 
          searchResults={searchResults} 
          onAdd={addTrack} 
        />
        <Playlist
          playlistName={playlistName}
          playlistTracks={playlistTracks}
          onNameChange={updatePlaylistName}
          onRemove={removeTrack}
          onSave={savePlaylist}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}

export default App;