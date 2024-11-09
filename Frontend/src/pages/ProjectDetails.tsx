import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCalendar, FaMapMarkerAlt, FaBookOpen, FaCheckCircle } from 'react-icons/fa';
import './ProjectDetails.css';

interface Project {
  projectID: number;
  projectName: string;
  projectDescription: string;
  startDate: string;
  endDate: string;
  fundGoal: number;
  fundAmount: number;
  field: string;
  requiredSkills: string;
  location: string;
  status: 'Open' | 'Closed';
}

interface ProjectImage {
  projectID: number;
  imageURL: string; 
}

interface ProjectFile {
  projectID: number;
  imageURL: string;  // This will store the file path/name
  fileType?: string; // Optional: if you have file type info from backend
}

const ProjectDetails: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get project ID from URL params
  const projectId = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetch(`http://localhost:8081/projects/${projectId}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => setProject(data))
      .catch((error) => console.error("Error fetching project:", error))
      .finally(() => setLoading(false));

    fetch("http://localhost:8081/project_images")
      .then((response) => response.json())
      .then((data) => setProjectFiles(data))
      .catch((error) => console.error("Error fetching project files:", error));
  }, [projectId]);

  if (loading) return (
    <div className="max-w-4xl mx-auto p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
  if (error) return <div>{error}</div>;
  if (!project) return <div>Project not found</div>;

  const fundingProgress = (project.fundAmount / project.fundGoal) * 100;
  console.log(project);

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['mp4', 'webm', 'mov'].includes(extension)) return 'video';
    if (['doc', 'docx'].includes(extension)) return 'document';
    return 'other';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4" style={{ textAlign: 'center' }}>{project.projectName}</h1>
        
        {/* Funding Progress */}
        <div className="mb-8" style={styles.halfWidth}>
          <h2 className="text-xl font-semibold mb-4">Funding Progress</h2>
          <div className="relative pt-1">
            
            <div className="funding-goal">
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${Math.min(fundingProgress, 100)}%` }}></div>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100 relative">
              {/* Loading animation overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              <div
                style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500 relative"
              >
                {/* Progress bar animation overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span className="font-medium">Raised: ${project.fundAmount.toLocaleString()}</span>
              <span className="font-medium">Goal: ${project.fundGoal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Project Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" style={styles.halfWidth}>
          <div>
            <h2 className="text-xl font-semibold mb-4">About the Project</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">{project.projectDescription}</p>

            <div style={styles.fileGallery}>
              {projectFiles
                .filter((file) => file.projectID === project.projectID)
                .map((file, index) => {
                  const fileType = getFileType(file.imageURL);
                  const fileUrl = `http://localhost:8081/uploads/${file.imageURL}`;
                  
                  switch (fileType) {
                    case 'image':
                      return (
                        <img
                          key={index}
                          src={fileUrl}
                          alt={`Project ${project.projectName} - File ${index + 1}`}
                          style={styles.projectFile}
                        />
                      );
                    case 'video':
                      return (
                        <video
                          key={index}
                          controls
                          style={styles.projectFile}
                        >
                          <source src={fileUrl} type={`video/${file.imageURL.split('.').pop()}`} />
                          Your browser does not support the video tag.
                        </video>
                      );
                    case 'pdf':
                      return (
                        <embed
                          key={index}
                          src={fileUrl}
                          type="application/pdf"
                          style={styles.projectFile}
                        />
                      );
                    default:
                      return (
                        <a
                          key={index}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-2 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <span>Download {file.imageURL}</span>
                        </a>
                      );
                  }
                })}
            </div>
            
            {/* <h3 className="font-semibold mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {project.requiredSkills.split(',').map((skill, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {skill.trim()}
                </span>
              ))}
            </div> */}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold mb-4">Project Information</h2>
            <div className="space-y-4">
              {/* <p className="flex items-center gap-3">
                <FaBookOpen className="text-blue-500" />
                <span className="font-semibold"> Field:</span> {project.field}
              </p>
              <p className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-blue-500" />
                <span className="font-semibold">Location:</span> {project.location}
              </p> */}
              <p className="flex items-center gap-3">
                <FaCheckCircle className="text-blue-500" />
                <span className="font-semibold">  Status:</span> 
                <span className={`px-2 py-1 rounded-full text-sm ${
                  project.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {project.status}
                </span>
              </p>
              <p className="flex items-center gap-3">
                <FaCalendar className="text-blue-500" />
                <span className="font-semibold">  Duration:</span> 
                {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  halfWidth: {
    maxWidth: "50%",
    margin: "0 auto",
  },
  fileGallery: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  projectFile: {
    maxWidth: "100%",
    height: "auto",
    borderRadius: "4px",
  },
};
export default ProjectDetails;
