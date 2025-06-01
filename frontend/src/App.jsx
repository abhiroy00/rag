// frontend/src/App.js
import React, { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [document, setDocument] = useState(null);

  return (
    <div className="App">
      <header>
        <h1>Document Chat Assistant</h1>
      </header>
      
      <main>
        {!document ? (
          <div>
            <h2>Upload a Document</h2>
            <DocumentUpload onUploadSuccess={setDocument} />
          </div>
        ) : (
          <ChatInterface document={document} />
        )}
      </main>
    </div>
  );
}

export default App;