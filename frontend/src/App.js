import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    await axios.post("http://localhost:8000/api/upload/", formData);
  };

  const handleAsk = async () => {
    const res = await axios.post("http://localhost:8000/api/ask/", { query });
    setResponse(res.data.answer);
  };

  return (
    <div>
      <h1>RAG App</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
      <br /><br />
      <input
        type="text"
        placeholder="Ask a question"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleAsk}>Ask</button>
      <p><strong>Answer:</strong> {response}</p>
    </div>
  );
}

export default App;
