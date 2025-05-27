import React, { useEffect, useState } from "react";
import axios from 'axios';
import './CreateAccount.css';
import './Login.css';
import { useNavigate } from 'react-router-dom';


interface User {
  ID: number;
  FullName: string;
  Email: string;
  userType: 'Project Seeker' | 'Project Owner' | 'Mentor/Advisor';
  bio?: string;
  tags?: string[];
  resumePath?: string;
}

const UpdateProfile = () => {
  //const [user, setUser] = useState<User | null>(null);
  const [FullName, setFullName] = useState("");
  const [userType, setUserType] = useState("Project Seeker");
  const [Resume, setResume] = useState<File | null>(null);
  const [Bio, setBio] = useState("");
  const [TheError, setError] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('/src/assets/devsync_logo_nobg.png');
  const userID = localStorage.getItem("userID");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userID) {
        console.error('No userID found in localStorage');
        navigate('/auth');
        return;
      }

      try {
        // Fetch user data
        const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/${userID}`);
        
        // Parse tags inline before updating the state
        const parsedUser = {
          ...userResponse.data,
          tags: typeof userResponse.data.tags === 'string' 
            ? JSON.parse(userResponse.data.tags) : [],
        };

        setFullName(parsedUser?.FullName || "")
        setUserType(parsedUser.userType)
        setBio(parsedUser.bio || "")
        setSelectedTags(parsedUser.tags)
        setResume(parsedUser.resumePath)
        //setUser(parsedUser);

      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load dashboard data');
      }
    };
    fetchUserData();
  }, []
  )

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResume(e.target.files[0]);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result !== null) {
          setPhotoPreview(reader.result.toString());
        }
      }
      reader.readAsDataURL(file);
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      // Retrieve the email from localStorage (used as the unique identifier for the user)
      const userID = localStorage.getItem('userID');
      if (!userID) {
        throw new Error('userID not found in session');
      }

      const formData = new FormData();
      formData.append('userID', userID); // Ensure email is included to identify the user
      if (FullName) formData.append('FullName', FullName);
      if (userType) formData.append('userType', userType);
      if (Bio) formData.append('bio', Bio);
      if (Resume) formData.append('resume', Resume);
      if (photo) formData.append('photo', photo);
      if (selectedTags && selectedTags.length > 0) {
        formData.append('tags', JSON.stringify(selectedTags));
      }

      console.log('Updating data:', Object.fromEntries(formData)); // Debug log

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        method: 'PUT', // Use PUT or PATCH to indicate updating an existing resource
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Success:', data);
      navigate('/dashboard'); // Redirect to the dashboard or another appropriate page
    } catch (error: unknown) {
      console.error('Error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="container">
      <div className="login-form-div" style={{ marginTop: 0, alignItems: 'flex-start' }}>
        <div className="column-l">
          <label htmlFor="photo-upload" style={{ cursor: 'pointer' }}>
            <img
              src={photoPreview}
              alt="Profile"
              className="project-image"
              style={{
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #ccc'
              }}
            />
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
          <div className="text-wrapper-1">Edit Profile</div>
        </div>

        <div className="column-r">
          {TheError && <p>{TheError}</p>}
          <form onSubmit={handleSubmit}>
            <input
              id="fullName"
              type="text"
              value={FullName}
              placeholder="Enter full name"
              onChange={(e) => setFullName(e.target.value)}
            />
            <div className="form-group-calorie-form">
              <label htmlFor="userType">User Type:</label>
              <select
                id="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="form-control"
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
              value={Bio}
              onChange={(e) => setBio(e.target.value)}
            ></textarea>

            <label htmlFor="tags">Tags:</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {["Frontend", "Backend", "Full Stack"].map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-btn ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <button type="submit" className="btn btn-primary">
              Edit Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );

};

export default UpdateProfile;
