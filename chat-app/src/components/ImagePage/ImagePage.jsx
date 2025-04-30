import React, { useState, useContext } from 'react';
import './ImagePage.css';
import axios from 'axios';
import NoteContext from '../NoteContext';

function ImagePage() {
  const { chatHistory, setChatHistory } = useContext(NoteContext);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userQuery, setUserQuery] = useState('');

  const handleImageSubmit = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await axios.post('http://127.0.0.1:5002/api/ImageAi', formData);
      console.log("✅ Flask Response:", response.data);

      const newMessage = {
        type: 'image',
        query: userQuery || image.name,
        result: response.data.result,
        treatment: response.data.treatment,
        doctors: response.data.doctors || [],
        imageURL: URL.createObjectURL(image),
      };

      setChatHistory(prev => [...(prev || []), newMessage]);
      setImage(null);
      setUserQuery('');
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    setLoading(false);
  };

  const renderChatHistory = () =>
    (chatHistory || []).map((message, index) => (
      <div key={index} className="result-container">
        <div className="user-query-bubble">{message.query}</div>

        <div className="result-box">
          <p className="result-heading">RESULT: {message.result?.toUpperCase()}</p>
          <div className="result-body" dangerouslySetInnerHTML={{ __html: message.treatment }} />
        </div>

        {message.doctors && message.doctors.length > 0 && (
          <div className="doctor-section">
            <h3>Recommended Doctors</h3>
            <div className="doctor-cards">
              {message.doctors.map((doctor, idx) => (
                <div key={idx} className="doctor-card">
                  <h4>{doctor.name}</h4>
                  <a href={doctor.link} target="_blank" rel="noopener noreferrer" className="view-profile">
                    View Profile
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ));

  return (
    <div className="chat-container">
      <h1>Skin Disease Detection AI</h1>

      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}

      <div className="chat-history">{renderChatHistory()}</div>

      <div className="input-section">
        <input
          type="text"
          placeholder="Enter your query (optional)..."
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          className="text-input"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="file-input"
        />
        <button onClick={handleImageSubmit} disabled={loading || !image} className="send-btn">
          Upload Image
        </button>
      </div>
    </div>
  );
}

export default ImagePage;
