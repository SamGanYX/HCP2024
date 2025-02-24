import { useState, useEffect } from 'react';
import devSyncLogo from '../assets/devsync_logo.webp';
import './Signin.css';
import { useAuth } from "../AuthContext";
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsValidEmail(email.toLowerCase().endsWith('@uw.edu'));
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your sign-in logic here
    // This is where you would make the API call to authenticate
  };

  return (
    <div className="signin-page-container">
      <div className="signin-page-content">
        <img 
          src={devSyncLogo} 
          alt="devSync Logo" 
          className="logo"
        />
        <h1 className="brand-name">
          <span className="brand-dev">dev</span>
          <span className="brand-sync">Sync</span>
        </h1>

        <h2 className="signin-page-heading">Sign in with UW email</h2>
        
        <div className="form-group">
          <label>UW Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="dev@uw.edu"
            className="email-input"
          />
          {email && (
            <div className={`email-validation ${isValidEmail ? 'valid' : 'invalid'}`}>
              {isValidEmail ? (
                <>
                  <span className="validation-icon">✓</span>
                  Verified UW email
                </>
              ) : (
                <>
                  <span className="validation-icon">✕</span>
                  Please enter a valid UW email address
                </>
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input"
          />
        </div>

        <button 
          className="continue-button"
          disabled={!isValidEmail || !password}
          onClick={handleSubmit}
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default SignIn; 