import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [filename, setFilename] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState("medium"); // NEW

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCompressionChange = (e) => {
    setCompressionLevel(e.target.value); // NEW
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("compression", compressionLevel); // NEW - send compression level

    setLoading(true);
    setSuccess(false);

    try {
      const response = await axios.post("http://localhost:8000/api/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message);
      setFilename(file.name);
      setSuccess(true);
    } catch (error) {
      setMessage("Failed to upload image.");
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/download-compressed/", {
        params: { image_name: filename },
      });
      setDownloadUrl(response.data.download_url);
      window.open(response.data.download_url, "_blank");
    } catch (error) {
      setMessage("Failed to get compressed image.");
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="logo">ImageCompressor</div>
        <nav className="nav-links">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </nav>
      </header>

      <div className="card">
        <h1>Compress Your Image</h1>

        <div className="upload-zone">
          <input type="file" id="fileUpload" onChange={handleFileChange} />
          <label htmlFor="fileUpload">Choose or Drag & Drop Image</label>
          {file && <p className="filename">{file.name}</p>}
        </div>

        {/* COMPRESSION OPTIONS */}
        <div className="compression-options">
          <label>Select Compression Level:</label>
          <select value={compressionLevel} onChange={handleCompressionChange}>
            <option value="high">High Compression (Low Quality)</option>
            <option value="medium">Medium Compression (Recommended)</option>
            <option value="low">Low Compression (High Quality)</option>
          </select>
        </div>

        <button className="upload-btn" onClick={handleUpload} disabled={!file || loading}>
          {loading ? "Uploading..." : "Upload Image"}
        </button>

        {loading && <div className="loader"></div>}

        {success && (
          <>
            <svg className="success-checkmark" viewBox="0 0 52 52">
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark" fill="none" d="M14 27l7 7 16-16" />
            </svg>
            <p className="message">Image uploaded successfully.</p>
          </>
        )}

        {filename && (
          <div>
            <button className="download-btn" onClick={handleDownload}>
              Get Compressed Image
            </button>
            {downloadUrl && (
              <p className="download-link">
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                  Download Compressed Image
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
