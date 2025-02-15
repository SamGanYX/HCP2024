import { useState, useEffect } from 'react';
import devSyncLogo from '../assets/devsync_logo.webp';
import './Signup.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);

  useEffect(() => {
    setIsValidEmail(email.toLowerCase().endsWith('@uw.edu'));
  }, [email]);

  return (
    <div className="signup-container">
      <div className="signup-content">
        <img 
          src={devSyncLogo} 
          alt="devSync Logo" 
          className="logo"
        />
        <h1 className="brand-name">
          <span className="brand-dev">dev</span>
          <span className="brand-sync">Sync</span>
        </h1>

        <h2 className="signup-heading">My UW email</h2>
        
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
          <label>Create your password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input"
          />
        </div>

        <div className="form-group">
          <label>Retype your password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="password-input"
          />
        </div>

        <button 
          className="continue-button"
          disabled={!isValidEmail || !password || !confirmPassword}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Signup; 