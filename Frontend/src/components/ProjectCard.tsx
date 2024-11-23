import React, { useState } from "react";

interface ProjectCardProps {
  projectID: number;
  projectName: string;
  projectDescription: string;
  startDate: string;
  endDate: string;
  fundGoal: number;
  fundAmount: number;
  imageURL: string | null;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  projectID,
  projectName,
  projectDescription,
  startDate,
  endDate,
  fundGoal,
  fundAmount,
  imageURL,
}) => {
  const [uploadedImageURL, setUploadedImageURL] = useState<string | null>(
    imageURL
  );
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
  const handleApply = () => {
    const userID = localStorage.getItem("userID");
    if (userID) {
      onApply(projectID);
    } else {
      alert("You must be logged in to apply.");
    }
  };

  return (
    <div className="project-card">
      <h2>{projectName}</h2>
      <p>{projectDescription}</p>
      <p>Start Date: {new Date(startDate).toLocaleDateString()}</p>
      <p>End Date: {new Date(endDate).toLocaleDateString()}</p>
      <p>Funding Goal: ${fundGoal}</p>
      <p>Funded: ${fundAmount}</p>

      {uploadedImageURL ? (
        <img
          src={`${import.meta.env.VITE_BACKEND_URL}/${uploadedImageURL}`}
          alt="Project"
          className="project-image"
        />
      ) : (
        <p>No image uploaded</p>
      )}

      <button className="btn" onClick={handleApply}>
        Apply
      </button>
    </div>
  );
};

export default ProjectCard;
