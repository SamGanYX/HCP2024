import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from "../AuthContext";
import './Home.css';

function App() {
  const navigate = useNavigate(); // Initialize useNavigate
  const { isAuthenticated, login, logout, token } = useAuth();

  return (
    <div className="app">
      <div className="title-section">
        <h1 className="eatvolution-title">
          {/* SparkHub */}
        </h1>
        <div className="welcome-section">
        {/* <h1>Welcome to Your Entrepreneurial home</h1> */}
      </div>
      </div>
      {(!isAuthenticated) && <div className="button-section">
        <button className="login-button" onClick={() => navigate('/login')}>Login</button>
        <button className="signup-button" onClick={() => navigate('/create_account')}>Sign-up</button>
      </div>}
    </div>
  );
}

export default App;
