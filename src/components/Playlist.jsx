import React from 'react';
import TrackList from './TrackList';

function Playlist({ playlistName, playlistTracks, onNameChange, onRemove, onSave }) {
  return (
    <div className="Playlist">
      <input value={playlistName} onChange={(e) => onNameChange(e.target.value)} />
      <TrackList tracks={playlistTracks} onRemove={onRemove} isRemoval={true} />
      <button className="Playlist-save" onClick={onSave}>SAVE TO SPOTIFY</button>
    </div>
  );
}

export default Playlist;