import devSyncLogo from '../assets/devsync_logo.webp';
import './Landing.css';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="signin-container">
      <div className="signin-content">
        <img 
          src={devSyncLogo} 
          alt="devSync Logo" 
          className="logo"
        />
        <h1 className="brand-name">
          <span className="brand-dev">dev</span>
          <span className="brand-sync">Sync</span>
        </h1>
        
        <h2 className="signin-heading">Use your UW email to continue</h2>
        
        <button 
          className="signin-button primary-button"
          onClick={() => navigate('/signup')}
        >
          Sign up with UW email
        </button>
        
        <div className="divider">
          <span>or</span>
        </div>
        
        <button 
          className="signin-button secondary-button"
          onClick={() => navigate('/sign-in')}
        >
          Sign in with UW email
        </button>
        
        <div className="footer-links">
          <a href="/terms">Terms of use</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

export default Landing; 
