import { useState, useEffect } from 'react';
import devSyncLogo from '../assets/devsync_logo.webp';
import './Signup.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../AuthContext";

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    setIsValidEmail(email.toLowerCase().endsWith('@uw.edu'));
  }, [email]);

  useEffect(() => {
    setIsValidPassword(password == confirmPassword);
  }, [confirmPassword, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('username', email.split('@')[0]); // Use email prefix as username
      formData.append('FullName', email.split('@')[0]); // Use email prefix as full name
      formData.append('userType', 'Project Seeker'); // Default user type
      formData.append('bio', ''); // Empty bio by default

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account');
      }

      const data = await response.json();
      
      // Store userID and token
      localStorage.setItem('userID', data.userID);
      
      // Automatically log in after account creation
      const loginResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: email.split('@')[0],
          password: password 
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('Failed to log in after account creation');
      }

      const loginData = await loginResponse.json();
      login(loginData.token);
      
      // Redirect to dashboard
      navigate('/profile_details');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

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
        
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>UW Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dev@uw.edu"
              className="email-input"
              required
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
            {confirmPassword && (
              <div className={`password-validation ${isValidPassword ? 'valid' : 'invalid'}`}>
                {isValidPassword ? (
                  <>
                    <span className="validation-icon">✓</span>
                    Passwords match
                  </>
                ) : (
                  <>
                    <span className="validation-icon">✕</span>
                    Passwords do not match
                  </>
                )}
              </div>
            )}
          </div>
          
          <button 
            className="continue-button"
            onClick={handleSubmit}
            disabled={!isValidEmail || !password || !confirmPassword}
            type="submit"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup; 