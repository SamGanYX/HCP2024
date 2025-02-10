import devSyncLogo from '../assets/devsync_logo.webp';
import './SignIn.css';

const SignIn: React.FC = () => {
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
        
        <h2 className="signin-heading">Sign up to continue</h2>
        
        <button className="signin-button primary-button">
          Use your UW email
        </button>
        
        <div className="divider">
          <span>or sign in with</span>
        </div>
        
        <button className="signin-button secondary-button">
          Continue with UW email
        </button>
        
        <div className="footer-links">
          <a href="/terms">Terms of use</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 