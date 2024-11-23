import React, { useEffect, useState } from "react";

interface DataItem {
  projectID: number;
  categoryID: number;
  projectName: string;
  projectDescription: string;
  startDate: string;
  endDate: string;
  fundGoal: number;
  fundAmount: number;
}

interface Category {
  categoryID: number;
  categoryName: string;
}

const ProjectsTable = () => {
  const [data, setData] = useState<DataItem[]>([]);
  // const [categories, setCategories] = useState<Category[]>([]);
  const [editID, setEditID] = useState<number | null>(null);
  const [editCategoryID, setEditCategoryID] = useState<number>(-1);
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editFundGoal, setEditFundGoal] = useState(0);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/projects`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleEdit = (item: DataItem) => {
    setEditID(item.projectID);
    setEditProjectName(item.projectName);
    setEditProjectDescription(item.projectDescription);
    setEditStartDate(item.startDate);
    setEditEndDate(item.endDate);
    setEditFundGoal(item.fundGoal);
  };

  const handleUpdate = () => {
    if (editID === null) return;

    const projectData = {
      projectID: editID,
      categoryID: editCategoryID,
      projectName: editProjectName,
      projectDescription: editProjectDescription,
      startDate: editStartDate,
      endDate: editEndDate,
      fundGoal: editFundGoal,
    };

    fetch(`${import.meta.env.VITE_BACKEND_URL}/update_project`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Project updated successfully:", data);
        location.reload();
        setEditID(null);
      })
      .catch((error) => {
        console.error("Error updating project:", error);
      });
  };

  const handleDelete = (projectID: number) => {
    // Confirm the deletion
    if (window.confirm("Are you sure you want to delete this project?")) {
      const projectData = {
        projectID: projectID,
      };

      fetch(`${import.meta.env.VITE_BACKEND_URL}/delete_projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Project deleted successfully:", data);
          // Refresh or update the data in your component
          // For example, you can refetch the project list or update the state
          setData((prevData) =>
            prevData.filter((project) => project.projectID !== projectID)
          );
        })
        .catch((error) => {
          console.error("Error deleting project:", error);
        });
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      {data.length > 0 ? (
        <table className="max-width">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Funding Goal</th>
              <th>Funding Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) =>
              editID !== item.projectID ? (
                <tr key={item.projectID}>
                  <td>{item.projectID}</td>
                  <td>{item.projectName}</td>
                  <td>{item.projectDescription}</td>
                  <td>{formatDate(item.startDate)}</td>
                  <td>{formatDate(item.endDate)}</td>
                  <td>{item.fundGoal}</td>
                  <td>{item.fundAmount}</td>
                  {/* <td>{getCategoryName(item.categoryID)}</td>{" "} */}
                  <td>
                    <button onClick={() => handleEdit(item)}>Edit</button>
                    <button onClick={() => handleDelete(item.projectID)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={item.projectID}>
                  <td>{item.projectID}</td>
                  <td>
                    <input
                      type="text"
                      value={editProjectName}
                      onChange={(e) => setEditProjectName(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editProjectDescription}
                      onChange={(e) =>
                        setEditProjectDescription(e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editFundGoal}
                      onChange={(e) => setEditFundGoal(Number(e.target.value))}
                    />
                  </td>
                  <td>{item.fundAmount}</td>
                  <td>
                    <button onClick={handleUpdate}>Update</button>
                    <button onClick={() => handleDelete(item.projectID)}>
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}
    </>
  );
};

export default ProjectsTable;
