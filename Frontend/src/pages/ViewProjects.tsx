import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Project {
  userID: string;
  category: string;
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
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  const onApply = async (projectID: number) => {
    const userID = localStorage.getItem("userID");
    if (userID) {
      // Create application in the database
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID, projectID }),
      });

      if (response.ok) {
        alert("Application submitted successfully!");
      } else {
        alert("Failed to submit application.");
      }
    } else {
      alert("You must be logged in to apply.");
    }
  };
  const handleApply = (projectID: number) => {
    const userID = localStorage.getItem("userID");
    if (userID) {
      onApply(projectID);
    } else {
      alert("You must be logged in to apply.");
    }
  };

  // Fetch projects and project images on component mount
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/projects`)
      .then((response) => response.json())
      .then((data) => setProjects(data))
      .catch((error) => console.error("Error fetching projects:", error));
    fetch(`${import.meta.env.VITE_BACKEND_URL}/project_images`)
      .then((response) => response.json())
      .then((data) => setProjectImages(data))
      .catch((error) => console.error("Error fetching project images:", error));
  }, []);

  useEffect(() => {
    const uniqueCategories = Array.from(
      new Set(projects.map(project => project.category))
    ).filter(Boolean);
    setCategories(uniqueCategories);
  }, [projects]);

  const filteredProjects = selectedCategory.length === 0
    ? projects
    : projects.filter(project => selectedCategory.includes(project.category));

  // Add this helper function
  const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return imageExtensions.includes(extension);
  };
console.log(projects);
// console.log(import.meta.env.VITE_BACKEND_URL);
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Projects</h1>
      <div style={styles.contentWrapper}>
        <div style={styles.sidebar}>
          <h3 style={styles.filterTitle}>Categories</h3>
          <div style={styles.categoryList}>
            <button
              style={{
                ...styles.categoryButton,
                backgroundColor: selectedCategory.length === 0 ? '#2980b9' : '#3498db'
              }}
              onClick={() => setSelectedCategory([])}
            >
              All Projects
            </button>
            {categories.map((category) => (
              <label key={category} style={styles.categoryLabel}>
                <input
                  type="checkbox" 
                  checked={selectedCategory.includes(category)}
                  onChange={() => {
                    if (selectedCategory.includes(category)) {
                      setSelectedCategory(selectedCategory.filter(item => item !== category));
                    } else {
                      setSelectedCategory([...selectedCategory, category])
                    }
                  }}
                />
                {category}
              </label>
            ))}
          </div>
        </div>
        <div style={styles.projectGrid}>
          {projects.filter((project: Project)=>(selectedCategory.length === 0 || selectedCategory.includes(project.category))).map((project: Project) => (
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
                        src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${image.imageURL}`}
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
                <button 
                  style={styles.btn}
                  onClick={() => navigate(`/user/${project.userID}`)}
                >
                  Contact
                </button>

                <button className="btn" style={styles.btn} onClick={() => handleApply(project.projectID)}>
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  contentWrapper: {
    display: 'flex',
    gap: '20px',
    marginTop: '20px',
  },
  
  sidebar: {
    width: '250px',
    minWidth: '250px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    height: 'fit-content',
  },
  
  filterTitle: {
    color: '#2c3e50',
    marginBottom: '15px',
    fontSize: '1.2rem',
    textAlign: 'left' as const,
  },
  
  categoryList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },

  categoryButton: {
    padding: '8px 16px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#3498db',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    textAlign: 'left' as const,
    ':hover': {
      backgroundColor: '#2980b9',
    },
  },

  categoryLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '4px',
    backgroundColor: '#f0f0f0',
    '&:hover': {
      backgroundColor: '#e0e0e0'
    }
  },

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
    width:"100%",
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
    width: "auto",
    height: "auto",
    maxWidth:'100%',
    maxHeight: "200px",
    objectFit: "contain" as const,
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
