import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

interface User {
  ID: number;
  Username: string;
  Email: string;
  userType: 'Project Seeker' | 'Project Owner' | 'Mentor/Advisor';
  bio?: string;
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
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Replace with your actual API endpoint
        const userResponse = await axios.get(`http://localhost:8081/users/${userID}`);
        setUser(userResponse.data);

        // Fetch additional data based on user type
        const projectsResponse = await axios.get(`http://localhost:8081/projects/user/${userID}`);
        setProjects(projectsResponse.data);
        if (userResponse.data.userType === 'Mentor/Advisor') {
          const investorResponse = await axios.get(`/api/investors/${userResponse.data.ID}`);
          setInvestorInfo(investorResponse.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetch("http://localhost:8081/project_images")
      .then((response) => response.json())
      .then((data) => setProjectImages(data))
      .catch((error) => console.error("Error fetching project images:", error));

    fetchUserData();
  }, []);

  const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return imageExtensions.includes(extension);
  };

  const renderUser = () => (
    <div className="dashboard-content">
      <h2>Welcome, {user?.Username}</h2>
      <div className="user-info">
        <h3>Your Profile</h3>
        <p>Email: {user?.Email}</p>
        <p>Bio: {user?.bio || 'No bio added yet'}</p>
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
                      src={`http://localhost:8081/uploads/${image.imageURL}`}
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

