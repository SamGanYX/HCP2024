import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from "../AuthContext";
import './Home.css';

function App() {
  const navigate = useNavigate(); // Initialize useNavigate
  const { isAuthenticated, login, logout, token } = useAuth();

  return (
    <div className="app">
      
      {(!isAuthenticated) && <div className="button-section">
        <button className="login-button" onClick={() => navigate('/login')}>Login</button>
        <button className="signup-button" onClick={() => navigate('/create_account')}>Sign-up</button>
      </div>}
    </div>
  );
}

export default App;
