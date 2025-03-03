import React, { useState } from "react"; 
import './CreateAccount.css';
import './Login.css';

const CreateAccount = () => {
  const [Username, setUsername] = useState("");
  const [FullName, setFullName] = useState("");
  const [userType, setUserType] = useState("Project Seeker");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [Resume, setResume] = useState<File | null>(null);
  const [Bio, setBio] = useState("");
  const [TheError, setError] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // useEffect(() => {
  //   fetch(`${import.meta.env.VITE_BACKEND_URL}/users`)
  //     .then((res) => res.json())
  //     .catch((err) => console.log(err));
  // }, []);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResume(e.target.files[0]);
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
      const formData = new FormData();
      formData.append('username', Username);
      formData.append('FullName', FullName);
      formData.append('email', Email);
      formData.append('password', Password);
      formData.append('userType', userType);
      formData.append('bio', Bio);
      if (Resume) {
        formData.append('resume', Resume);
      }
      if (selectedTags && selectedTags.length > 0) {
        formData.append('skills', JSON.stringify(selectedTags));
      }

      console.log('Sending data:', Object.fromEntries(formData)); // Debug log

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success:', data);
      window.location.href = '/login';
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
          <img
            src={`/src/assets/devsync_logo_nobg.png`}
            alt="Project"
            className="project-image"
          />
          <div className="text-wrapper-1">Profile Details</div>
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
