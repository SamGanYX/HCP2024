import { useState, useEffect } from 'react';
import devSyncLogo from '../assets/devsync_logo.webp';
import './Signup.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsValidEmail(email.toLowerCase().endsWith('@uw.edu'));
  }, [email]);

  useEffect(() => {
    setIsValidPassword(password == confirmPassword);
  }, [confirmPassword, password]);


  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('1. Submit started');

    if (password !== confirmPassword) {
      console.error('Passwords do not match');
      return;
    }

    // Create user data object with required fields
    const userData = {
      email,
      password,
      userType: 'Project Seeker', // Default user type
      bio: '', // Optional field
    };

    try {
      console.log('2. About to send request to:', `${import.meta.env.VITE_BACKEND_URL}/signup`);
      const response = await fetch('http://localhost:8081/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData), // Send the email and password data to the backend
      });

      const data = await response.json();
      console.log('3. Response received:', response.status, data);
      
      if (response.ok) {
        console.log('4. Signup successful, attempting navigation');
        // Store the user ID in localStorage if you need it later
        localStorage.setItem('userId', data.userId.toString());
        // Use navigate instead of window.location.href
        navigate('/create_account');
        console.log('5. Navigation attempted');
      } else {
        console.error('Signup failed:', data);
        // Handle error (e.g., show error message)
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      // Handle error (e.g., show error message)
    }
  }

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
          onClick={handleSubmit}  // Call handleSubmit when the button is clicked
          disabled={!isValidEmail || !password || !confirmPassword}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Signup; 