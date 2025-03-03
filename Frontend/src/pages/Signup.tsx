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




  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

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
      // Sending the data to the backend API
      const response = await fetch('http://localhost:8081/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData), // Send the email and password data to the backend
      });

      const data = await response.json();
      if (response.ok) {
        console.log('User registered:', data);
        // Handle success (e.g., redirect or display success message)
      } else {
        console.error('Signup failed:', data);
        // Handle error (e.g., show error message)
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
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