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
          src={`http://localhost:8081${uploadedImageURL}`}
          alt="Project"
          className="project-image"
        />
      ) : (
        <p>No image uploaded</p>
      )}
    </div>
  );
};

export default ProjectCard;
