import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import "./CategoryPage.css";

interface Project {
  projectID: number;
  projectName: string;
  projectDescription: string;
  startDate: string;
  endDate: string;
  fundGoal: number;
  fundAmount: number;
  imageURL: string;
}

const CategoryPage = () => {
  const { categoryName } = useParams<{ categoryName: string } >();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Assuming categoryName corresponds to a categoryID in the backend
    const fetchProjects = async () => {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/projects/category/${categoryName}`)
        .then((res) => res.json())
        .then((data) => {
          setProjects(data);
          setLoading(false);
        })
        .catch((err) => console.log(err));
    };

    fetchProjects();
  }, [categoryName]);

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Category: {categoryName}</h1>
      <div className="projects-grid">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard
              key={project.projectID}
              projectID={project.projectID}
              projectName={project.projectName}
              projectDescription={project.projectDescription}
              startDate={project.startDate}
              endDate={project.endDate}
              fundGoal={project.fundGoal}
              fundAmount={project.fundAmount}
              imageURL={project.imageURL} // Pass the image URL
            />
          ))
        ) : (
          <p>No projects found for this category.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
