import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  ID: number;
  Username: string;
  Email: string;
  userType: string;
  bio: string;
  resumePath: string;
}

interface Project {
  projectID: number;
  projectName: string;
  projectDescription: string;
  startDate: string;
  endDate: string;
  fundGoal: number;
  fundAmount: number;
  field?: string;
  requiredSkills?: string;
  status: 'Open' | 'Closed';
}

const User: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const userId = window.location.pathname.split('/')[2]; // Assuming URL pattern is /user/:id

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user details
        const userResponse = await axios.get(`http://localhost:8081/users/${userId}`);
        setUser(userResponse.data);

        // Fetch user's projects
        const projectsResponse = await axios.get(`http://localhost:8081/projects`);
        const filteredProjects = projectsResponse.data.filter(
          (project: Project) => project.userID === parseInt(userId)
        );
        setUserProjects(filteredProjects);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4">{user.Username}'s Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Email: {user.Email}</p>
            <p className="text-gray-600">User Type: {user.userType}</p>
            {user.bio && <p className="text-gray-600">Bio: {user.bio}</p>}
          </div>
          {user.resumePath && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Resume</h3>
              <a 
                href={`http://localhost:8081/uploads/${user.resumePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                View Resume
              </a>
            </div>
          )}
        </div>
      </div>

      {/* User's Projects Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Projects</h2>
        {userProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userProjects.map((project) => (
              <div key={project.projectID} className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2">{project.projectName}</h3>
                <p className="text-gray-600 mb-2">{project.projectDescription}</p>
                <div className="text-sm text-gray-500">
                  <p>Start Date: {new Date(project.startDate).toLocaleDateString()}</p>
                  <p>End Date: {new Date(project.endDate).toLocaleDateString()}</p>
                  <p>Funding: ${project.fundAmount} / ${project.fundGoal}</p>
                  <p>Status: {project.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No projects found.</p>
        )}
      </div>
    </div>
  );
};

export default User;
