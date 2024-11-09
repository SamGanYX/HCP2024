import React, { useState } from "react";
import ProjectsTable from "../components/ProjectsTable";
import "./Projects.css";

interface ProjectFormData {
  projectName: string;
  projectDescription: string;
  fundGoal: string;
  endDate: string;
  images: FileList | null;
}

const Projects = () => {
  const userID = localStorage.getItem("userID");
  const [formData, setFormData] = useState<ProjectFormData>({
    projectName: "",
    projectDescription: "",
    fundGoal: "",
    endDate: "",
    images: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, images: e.target.files }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitData = new FormData();
    
    submitData.append("userID", userID as string);
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "images") {
        submitData.append(key, value);
      }
    });

    if (formData.images) {
      Array.from(formData.images).forEach((image) => {
        submitData.append("images", image);
      });
    }

    try {
      const response = await fetch("http://localhost:8081/projects_with_image", {
        method: "POST",
        body: submitData,
      });
      const data = await response.json();
      location.reload();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="projects-container">
      <div className="projects-form-div form-container">
        <h2>Create New Project</h2>
        <form onSubmit={handleSubmit}>
          {[
            { id: "projectName", label: "Project Name", type: "text" },
            { id: "projectDescription", label: "Project Description", type: "textarea" },
            { id: "fundGoal", label: "Funding Goal", type: "number" },
            { id: "endDate", label: "End Date", type: "date" },
          ].map(({ id, label, type }) => (
            <div className="form-group" key={id}>
              <label htmlFor={id}>{label}</label>
              {type === "textarea" ? (
                <textarea
                  id={id}
                  value={formData[id as keyof ProjectFormData] as string}
                  onChange={handleInputChange}
                  placeholder={`Enter ${label}`}
                />
              ) : (
                <input
                  id={id}
                  type={type}
                  value={formData[id as keyof ProjectFormData] as string}
                  onChange={handleInputChange}
                  placeholder={type !== "date" ? `Enter ${label}` : ""}
                />
              )}
            </div>
          ))}

          <div className="form-group">
            <label htmlFor="images">Upload Images</label>
            <input
              id="images"
              type="file"
              multiple
              onChange={handleImageChange}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Create Project
          </button>
        </form>
      </div>
      <ProjectsTable />
    </div>
  );
};

export default Projects;
