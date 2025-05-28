import React from 'react';
import './MatchPopup.css';

interface MatchPopupProps {
  matchedUserId: number;
  matchedUserName: string;
  matchedUserPhoto?: string;
  currentUserPhoto?: string;
  onClose: () => void;
}

const MatchPopup: React.FC<MatchPopupProps> = ({
  matchedUserId,
  matchedUserName,
  matchedUserPhoto,
  currentUserPhoto,
  onClose,
}) => {
  return (
    <div className="match-popup-overlay">
      <div className="match-popup">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="match-content">
          <div className="match-header">
            <h2><strong>It's a Match!</strong></h2>
            <div>
              <p>You and <strong>{matchedUserName}</strong> have matched!</p>
            </div>
          </div>
          
          <div className="match-photos">
            <div className="photo-container">
              <img
                src={currentUserPhoto || `${import.meta.env.VITE_BACKEND_URL}/uploads/photos/default-avatar.png`}
                alt="Your profile"
                className="profile-photo"
              />
            </div>
            <div className="photo-container">
              <img
                src={matchedUserPhoto || `${import.meta.env.VITE_BACKEND_URL}/uploads/photos/default-avatar.png`}
                alt={`${matchedUserName}'s profile`}
                className="profile-photo"
              />
            </div>
          </div>

          <div className="match-message">
            <p>Start a conversation and explore opportunities together!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchPopup; 