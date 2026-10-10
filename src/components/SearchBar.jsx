import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [term, setTerm] = useState('');

  const handleSearch = () => {
    onSearch(term);
  };

  return (
    <div className="SearchBar">
      <input 
        placeholder="Enter A Song, Album, or Artist" 
        onChange={(e) => setTerm(e.target.value)} 
      />
      <button className="SearchButton" onClick={handleSearch}>SEARCH</button>
    </div>
  );
}

export default SearchBar;