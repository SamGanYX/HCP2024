import React, { useEffect, useState } from "react";

interface Props {
  TableName: string;
}
const Table = ({ TableName }: Props) => {
  interface DataItem {
    Username: string;
    Email: string;
    Password: string;
  }
  const [Data, setData] = useState<DataItem[]>([]);
  const [EditID, setEditID] = useState(-1);
  const [EditUsername, setEditUsername] = useState("");
  const [EditEmail, setEditEmail] = useState("");
  const [EditPassword, setEditPassword] = useState("");
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/` + TableName)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      })
      .catch((err) => console.log(err));
  }, []);
  const handleEdit = (index: number, item: DataItem) => {
    console.log(index);
    setEditID(index);
    setEditUsername(item.Username);
    setEditEmail(item.Email);
    setEditPassword(item.Password);
  };
  const handleUpdate = () => {
    const userData = {
      username: EditUsername,
      email: EditEmail,
      password: EditPassword,
      id: EditID,
    };
    fetch(`${import.meta.env.VITE_BACKEND_URL}/update_users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => {
        response.json();
        console.log("Full response:", response);
      })
      .then((data) => {
        console.log("User updated successfully:", data);
        location.reload();
      })
      .catch((error) => {
        console.error("Error updating user:", error);
      });
  };
  const handleDelete = (TableName: string, index: number) => {
    const userData = {
      id: index,
    };
    fetch(`${import.meta.env.VITE_BACKEND_URL}/delete_users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => {
        response.json();
        console.log("Full response:", response);
      })
      .then((data) => {
        console.log("User Deleted successfully:", data);
        location.reload();
      })
      .catch((error) => {
        console.error("Error Deleting user:", error);
      });
  };
  return (
    <>
      {Data && Data.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Password</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Data.map((item, index) =>
              EditID != index ? (
                <tr key={index}>
                  <td>{index}</td>
                  <td>{item.Username}</td>
                  <td>{item.Email}</td>
                  <td>{item.Password}</td>
                  <td>
                    <button onClick={() => handleEdit(index, item)}>
                      edit
                    </button>
                    <button onClick={() => handleDelete(TableName, index)}>
                      delete
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={index}>
                  <td>{index}</td>
                  <td>
                    <input
                      type="text"
                      value={EditUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={EditEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={EditPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={handleUpdate}>Update</button>
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

export default Table;
