import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import './CreateAccount.css';
import './Login.css';

const CreateAccount = () => {
  const location = useLocation();
  const [Username, setUsername] = useState("");
  const [FullName, setFullName] = useState("");
  const [userType, setUserType] = useState("Project Seeker");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [Resume, setResume] = useState<File | null>(null);
  const [Bio, setBio] = useState("");
  const [TheError, setError] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/users`)
      .then((res) => res.json())
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || location.state?.email;
    if (email) {
      setEmail(email);
    }
  }, [location]);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    console.log(formData);
    formData.append('username', Username);
    formData.append('FullName', FullName);
    formData.append('email', Email);
    formData.append('password', Password);
    formData.append('userType', userType);
    formData.append('bio', Bio);
    if (Resume) {
      formData.append('resume', Resume);
    }

    console.log(formData);  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      console.log("User added successfully:", data);

      // Attempt to log in the user
      const loginResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: Username,
          password: Password,
        }),
      });

      const loginData = await loginResponse.json();
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("userID", loginData.userID);
      
      // Redirect to add_investor if userType is Mentor/Advisor, otherwise go to home
      if (userType === "Mentor/Advisor") {
        window.location.href = "/add_investors";
      } else if (userType === "Project Owner") {
        window.location.href = "/projects_map";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to create account, username taken");
    }
  };

  return (
    <div className="container">
      <div className="login-form-div" style={{ marginTop: 0, alignItems: 'flex-start' }}>
        <div className="column-l">
          <img
            src={`/src/assets/home.png`}
            alt="Project"
            className="project-image"
          />
          <h2>Create An Account</h2>
        </div>
          <div className="column-r">
          {TheError && <p>{TheError}</p>}
          <form onSubmit={handleSubmit}>
            <input
              id="userName"
              type="text"
              placeholder="Enter Username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              id="fullName"
              type="text"
              placeholder="Enter full name"
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              id="email"
              type="text"
              placeholder="Enter Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="form-group-calorie-form">
              <label htmlFor="userType">User Type:</label>
              <select
                id="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="form-control"
                required
              >
                <option value="Project Seeker">Project Seeker</option>
                <option value="Project Owner">Project Owner</option>
                <option value="Mentor/Advisor">Mentor/Advisor</option>
              </select>
            </div>

            <label htmlFor="resume">Resume:</label>
            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeChange}
            />
            <label htmlFor="bio">Short Bio:</label>
            <textarea
              id="bio"
              placeholder="Enter Bio"
              onChange={(e) => setBio(e.target.value)}
            ></textarea>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              name="Password"
              id="Password"
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Create account
            </button>
          </form>
          <div className="already-have-account">
            <p>Already Have An Account? <a href="/login">Log In</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
