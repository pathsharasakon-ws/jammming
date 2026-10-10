import React from 'react';
import TrackList from './TrackList';

function Playlist(props) {
  // รับ props.isSaving เข้ามาใช้งาน
  return (
    <div className="Playlist">
      <input 
        value={props.playlistName} 
        onChange={(e) => props.onNameChange(e.target.value)} 
      />
      <TrackList 
        tracks={props.playlistTracks} 
        onRemove={props.onRemove} 
        isRemoval={true} 
      />
      {/* ปรับปุ่มให้เปลี่ยนข้อความและคลิกซ้ำไม่ได้ขณะกำลังบันทึก */}
      <button 
        className="Playlist-save" 
        onClick={props.onSave} 
        disabled={props.isSaving}
      >
        {props.isSaving ? 'SAVING...' : 'SAVE TO SPOTIFY'}
      </button>
    </div>
  );
}

export default Playlist;