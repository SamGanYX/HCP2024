import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Project {
  projectID: number;
  projectName: string;
  projectDescription: string;
}

interface ProjectImage {
  projectID: number;
  imageURL: string; 
}

const ViewProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const navigate = useNavigate();

  // Fetch projects and project images on component mount
  useEffect(() => {
    fetch("http://localhost:8081/projects")
      .then((response) => response.json())
      .then((data) => setProjects(data))
      .catch((error) => console.error("Error fetching projects:", error));

    fetch("http://localhost:8081/project_images")
      .then((response) => response.json())
      .then((data) => setProjectImages(data))
      .catch((error) => console.error("Error fetching project images:", error));
  }, []);

  // Add this helper function
  const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return imageExtensions.includes(extension);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Projects</h1>
      <div style={styles.projectGrid}>
        {projects.map((project: Project) => (
          <div key={project.projectID} style={styles.projectCard}>
            <h2 style={styles.projectTitle}>{project.projectName}</h2>
            <p style={styles.description}>{project.projectDescription}</p>
            <div style={styles.imageGallery}>
              {projectImages
                .filter((image) => image.projectID === project.projectID)
                .map((image, index) => (
                  isImageFile(image.imageURL) ? (
                    <img
                      key={index}
                      src={`http://localhost:8081/uploads/${image.imageURL}`}
                      alt={`Project ${project.projectName} - Image ${index + 1}`}
                      style={styles.projectImage}
                    />
                  ) : null
                ))}
            </div>
            <div style={styles.buttonContainer}>
              <button 
                style={styles.btn}
                onClick={() => navigate(`/project/${project.projectID}`)}
              >
                Details
              </button>
              <button style={styles.btn}>
                Contact
              </button>
              <button style={styles.btn}>
                Invest
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    textAlign: "center" as const,
  },
  button: {
    margin: "1px",
    borderRadius: "5px",
  },
  projectGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  projectCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "left" as const,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease",
    backgroundColor: "white",
    ":hover": {
      transform: "translateY(-5px)",
    },
  },
  projectImage: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  imageGallery: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  heading: {
    color: "#333",
    marginBottom: "30px",
    fontSize: "2.5rem",
  },
  projectTitle: {
    color: "#2c3e50",
    marginBottom: "10px",
    fontSize: "1.5rem",
  },
  description: {
    color: "#666",
    marginBottom: "15px",
    lineHeight: "1.5",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
    justifyContent: "center",
  },
  btn: {
    padding: "8px 16px",
    margin: "1px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#3498db",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    ":hover": {
      backgroundColor: "#2980b9",
    },
  },
};

export default ViewProjects;