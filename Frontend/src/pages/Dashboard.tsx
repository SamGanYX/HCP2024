import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

interface User {
  ID: number;
  FullName: string;
  Email: string;
  userType: 'Project Seeker' | 'Project Owner' | 'Mentor/Advisor';
  bio?: string;
  tags?: string[];
  resumePath?: string;

}

interface Project {
  projectID: number;
  projectName: string;
  projectDescription: string;
  startDate: string;
  endDate: string;
  fundGoal: number;
  fundAmount: number;
  field: string;
  status: 'Open' | 'Closed';
  imageURL?: string;
}

interface Investor {
  id: number;
  name: string;
  email: string;
  description: string;
  expertise: string;
  investmentRange: string;
}
interface ProjectImage {
  projectID: number;
  imageURL: string; 
}

interface Match {
  ID: number;
  FullName: string;
  Email: string;
  userType: 'Project Seeker' | 'Project Owner' | 'Mentor/Advisor';
  profileImage?: string;
  matchDate: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [investorInfo, setInvestorInfo] = useState<Investor | null>(null);
  const userID = localStorage.getItem("userID");
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userID) {
        console.error('No userID found in localStorage');
        navigate('/auth');
        return;
      }

      try {
        // Fetch user data
        const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/${userID}`);
        
        // Parse tags inline before updating the state
        const parsedUser = {
          ...userResponse.data,
          tags: typeof userResponse.data.tags === 'string' 
            ? JSON.parse(userResponse.data.tags).join(', ') : userResponse.data.tags,
        };

        setUser(parsedUser);

        // Fetch projects
        const projectsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/projects/user/${userID}`);
        setProjects(projectsResponse.data);
        
        // Fetch mutual matches - add this
        const matchesResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/matches/mutual/${userID}`);
        setMatches(matchesResponse.data);
        
        if (userResponse.data.userType === 'Mentor/Advisor') {
          const investorResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/investors/${userResponse.data.ID}`);
          setInvestorInfo(investorResponse.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load dashboard data');
      }
    };

    // Fetch project images
    fetch(`${import.meta.env.VITE_BACKEND_URL}/project_images`)
      .then((response) => response.json())
      .then((data) => setProjectImages(data))
      .catch((error) => console.error("Error fetching project images:", error));

    fetchUserData();
  }, [userID, navigate]);

  useEffect(() => {
    if (matches.length === 0) {
      const fetchPotentialConnections = async () => {
        try {
          console.log('Fetching potential connections for user:', userID); // Debug log
          
          // First try to get users who swiped right on the current user
          const swipedRightResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/swiped-right-on/${userID}`);
          console.log('Swiped right response:', swipedRightResponse.data); // Debug log
          
          if (swipedRightResponse.data && swipedRightResponse.data.length > 0) {
            console.log('Setting matches from swiped right users'); // Debug log
            setMatches(swipedRightResponse.data);
            return;
          }
        } catch (error) {
          console.error('Error fetching potential connections:', error);
          setError('Failed to load potential connections');
        }
      };

      fetchPotentialConnections();
    }
  }, [matches, userID]);

  const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return imageExtensions.includes(extension);
  };

  const renderUser = () => (
    <div className="dashboard-content">
      <h2>Welcome, {user?.FullName}</h2>
      <div className="user-info">
        <h3>Your Profile</h3>
        <p><strong>Full Name:</strong> {user?.FullName || 'Not provided yet'}</p>
        <p><strong>Email:</strong> {user?.Email}</p>
        <p><strong>User Type:</strong> {user?.userType || 'Not specified'}</p>
        <p><strong>Bio:</strong> {user?.bio || 'No bio added yet'}</p>
        <p><strong>Tags:</strong> {user?.tags || 'No tags selected'}</p>
        {user?.resumePath ? (
          <p>
            <strong>Resume:</strong> 
            <a 
              href={`${import.meta.env.VITE_BACKEND_URL}/uploads/resumes/${user.resumePath}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View Resume
            </a>
          </p>
        ) : (
          <p><strong>Resume:</strong> Not uploaded yet</p>
        )}
      </div>
      {/* Add matched projects, liked projects, etc. */}
    </div>
  );

  const renderProjects = () => (
    <div className="dashboard-content">
     <h3>Your Projects</h3>
      <div className="projects-section">
        {projects.map((project: Project) => (
          <div key={project.projectID} className="project-card">
            <h2>{project.projectName}</h2>
            <p>{project.projectDescription}</p>
            <div className="image-gallery">
              {projectImages
                .filter((image) => image.projectID === project.projectID)
                .map((image, index) => (
                  isImageFile(image.imageURL) ? (
                    <img
                      key={index}
                      src={`${import.meta.env.VITE_BACKEND_URL}/uploads/photos/${image.imageURL}`}
                      alt={`Project ${project.projectName} - Image ${index + 1}`}
                      className="project-image"
                    />
                  ) : null
                ))}
            </div>
            <div className="button-container">
              <button 
                className="btn"
                onClick={() => navigate(`/project/${project.projectID}`)}
              >
                Details
              </button>
              <button 
                className="btn"
                onClick={() => navigate(`/user/${userID}`)}
              >
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMentorAdvisor = () => (
    <div className="dashboard-content">
      {investorInfo && (
        <div className="investor-info">
          <h3>Investor Profile</h3>
          <p>Expertise: {investorInfo.expertise}</p>
          <p>Investment Range: {investorInfo.investmentRange}</p>
          <p>Description: {investorInfo.description}</p>
        </div>
      )}
    </div>
  );

  const handleMatchAction = async (matchedUserID: number, status: 'Accepted' | 'Rejected') => {
    try {
        const userID = localStorage.getItem("userID");

        if (status === 'Accepted') {
            // Send request to backend to record the swipe
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/swipe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userID,
                    swiped_user_id: matchedUserID,
                    swipeType: 'right',
                }),
            });

            const data = await response.json();
            if (data.match) {
                alert(`You matched with ${matchedUserID}!`);
            }
        } else if (status === 'Rejected') {
            // Call the reject endpoint when skip button is pressed
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reject-swipe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userID,
                    swipedUserId: matchedUserID,
                }),
            });

            const data = await response.json();
            if (data.message) {
                alert(data.message);
            }
        }

        await axios.patch(
            `${import.meta.env.VITE_BACKEND_URL}/api/matches/status/${userID}/${matchedUserID}`, 
            { status }
        );

        // Update matches locally to reflect the new status
        setMatches(matches.map(match => 
            match.ID === matchedUserID ? { ...match, status } : match
        ));
    } catch (error) {
        console.error('Error updating match status:', error);
        setError('Failed to update match status');
    }
  };

  const renderMutualMatches = () => (
    <div className="dashboard-section">
      <h3>Potential Connections</h3>
      {matches.length > 0 ? (
        <div className="matches-grid">
          {matches.map((match) => (
            <div key={match.ID} className="match-card">
              <div className="match-header">
                {match.profileImage ? (
                  <img 
                    src={`${import.meta.env.VITE_BACKEND_URL}/uploads/photos/${match.profileImage}`} 
                    alt={match.FullName} 
                    className="match-avatar"
                  />
                ) : (
                  <div className="match-avatar-placeholder">
                    {match.FullName.charAt(0)}
                  </div>
                )}
                <h4>{match.FullName}</h4>
              </div>
              
              <div className="match-details">
                <p><strong>User Type:</strong> {match.userType}</p>
                <p><strong>Email:</strong> {match.Email}</p>
                <p><strong>Status:</strong> <span className={`status-${match.status.toLowerCase()}`}>{match.status}</span></p>
              </div>
              
              <div className="match-actions">
                <button 
                  className="btn view-btn"
                  onClick={() => navigate(`/user/${match.ID}`)}
                >
                  View Profile
                </button>
                
                {match.status === 'Pending' && (
                  <>
                    <button 
                      className="btn accept-btn"
                      onClick={() => handleMatchAction(match.ID, 'Accepted')}
                    >
                      Connect
                    </button>
                    <button 
                      className="btn reject-btn"
                      onClick={() => handleMatchAction(match.ID, 'Rejected')}
                    >
                      Skip
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-matches">
          <p>No users found.</p>
          <button className="btn" onClick={() => navigate('/swiping')}>Go to Swiping</button>
        </div>
      )}
    </div>
  );

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
        <div className="dashboard-content">
            {renderUser()}
            {renderMutualMatches()}
            {projects.length > 0 && renderProjects()}
            {user.userType === 'Mentor/Advisor' && renderMentorAdvisor()}
        </div>
    </div>
  );
};

export default Dashboard;

