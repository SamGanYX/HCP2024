import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import './CreateAccount.css';
import { useNavigate } from "react-router-dom";

const Login = () => {
  interface DataItem {
    Username: string;
    Email: string;
    Password: string;
  }
  const [LoggedIn, setLoggedIn] = useState(false);
  const [Username, setUsername] = useState("");
  const [Password, setPassword] = useState("");
  const [TheError, setError] = useState("");
  const navigate = useNavigate();
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userData = {
      username: Username,
      password: Password,
    };
    fetch("http://localhost:8081/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => {
        // console.log(response);
        if(response.status === 200) {
          return response.json();
        } else {
          setError('Failed to log in, username not found');
          throw new Error('Error logging in:' + response.statusText);
        }
      })
      .then((data) => {
        console.log(data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userID", data.userID);
        // location.reload();
        window.location.href = "/home";
        // navigate("/home/");
      })
      .catch((error) => {
        console.error("Error logging in:", error);
      });
  };

  const { isAuthenticated, login, logout, token } = useAuth();
  if (isAuthenticated) {
    window.location.href = "/home";
  }
  return (
    <div className="container">
      <div className="left-section">
        <h1>
          Spark<span>Hub</span>
        </h1>
      </div>
      <div className="form-div">
        <h2>Login</h2>
        {TheError && <p>{TheError}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="Username"
            id="Username"
            placeholder="Username"
            value={Username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password" // Change type to "password"
            name="Password"
            id="Password"
            placeholder="Password"
            value={Password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off" // Prevent autofill
          />
          <button type="submit">Login</button>
        </form>
        <div className="already-have-account">
          <p>Don't have an account yet? <a href="/create_account">Create one</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
