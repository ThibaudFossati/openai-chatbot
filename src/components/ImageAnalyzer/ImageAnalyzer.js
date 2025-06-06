import React, { useState } from 'react';

export default function ImageAnalyzer({ onAnalyze }) {
  const [file, setFile] = useState(null);

  function handleFileChange(e) {
    const img = e.target.files[0];
    setFile(img);
    // Placeholder : appelez un endpoint d’analyse ici
    onAnalyze(img);
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {file && <p>Fichier sélectionné : {file.name}</p>}
    </div>
  );
}
