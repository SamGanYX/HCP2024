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

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [investorInfo, setInvestorInfo] = useState<Investor | null>(null);
  const userID = localStorage.getItem("userID");
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userID) {
        console.error('No userID found in localStorage');
        navigate('/auth');
        return;
      }

      try {
        // Replace with your actual API endpoint
        const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/${userID}`);
        setUser(userResponse.data);

         // Parse tags inline before updating the state
        const parsedUser = {
          ...userResponse.data,
          tags: typeof userResponse.data.tags === 'string' 
          ? JSON.parse(userResponse.data.tags).join(', ') : userResponse.data.tags,
        };

        setUser(parsedUser);

        // Fetch additional data based on user type
        const projectsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/projects/user/${userID}`);
        setProjects(projectsResponse.data);
        if (userResponse.data.userType === 'Mentor/Advisor') {
          const investorResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/investors/${userResponse.data.ID}`);
          setInvestorInfo(investorResponse.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load dashboard data');
      }
    };

    fetch(`${import.meta.env.VITE_BACKEND_URL}/project_images`)
      .then((response) => response.json())
      .then((data) => setProjectImages(data))
      .catch((error) => console.error("Error fetching project images:", error));

    fetchUserData();
  }, [userID, navigate]);

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
              href={`${import.meta.env.VITE_BACKEND_URL}/uploads/${user.resumePath}`} 
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
                      src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${image.imageURL}`}
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
        <div className="dashboard-content">
            {renderUser()}
            {projects.length > 0 && renderProjects()}
            {user.userType === 'Mentor/Advisor' && renderMentorAdvisor()}
        </div>
    </div>
  );
};

export default Dashboard;

