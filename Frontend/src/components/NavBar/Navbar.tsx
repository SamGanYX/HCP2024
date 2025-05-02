import React, { useState, useEffect } from "react";
import { Link, BrowserRouter, NavLink, Router, Route } from "react-router-dom";
import { useAuth } from "../../AuthContext";

import "./Navbar.css";

const Navbar = () => {
  interface DataItem {
    categoryName: string;
  }
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, login, logout, token } = useAuth();
  console.log(useAuth());
  // const [Data, setData] = useState<DataItem[]>([]);
  const userID = localStorage.getItem("userID");
  // console.log(userID);
  // useEffect(() => {
  //   fetch(`${import.meta.env.VITE_BACKEND_URL}/categories`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setData(data);
  //       console.log(data);
  //     })
  //     .catch((err) => console.log(err));
  // }, []);
  return (
    <>
      <nav className="navbar_nav">
        {/* <Link to="/" className="title">
          Eat<span className="green-text">volution</span>
        </Link> */}
        <div
          className="menu"
          onClick={() => {
            setMenuOpen(!menuOpen);
          }}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
        <ul className={menuOpen ? "open" : ""}>
          <li className="navbar-li">
            <NavLink
              to="/about"
              style={({ isActive }) => (isActive ? { color: "#4169E1", fontWeight: "bold" } : {})}
            >
              About
            </NavLink>
          </li>
          {!isAuthenticated ? (
            <>
              <li className="navbar-li">
                <NavLink
                  to="/sign-in"
                  style={({ isActive }) => (isActive ? { color: "#4169E1", fontWeight: "bold" } : {})}
                >
                  Sign in
                </NavLink>
              </li>
              <li className="navbar-li">
                <NavLink
                  to="/signup"
                  style={({ isActive }) => (isActive ? { color: "#4169E1", fontWeight: "bold" } : {})}
                >
                  Sign up
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-li">
                <NavLink
                  to="/swiping"
                  style={({ isActive }) => (isActive ? { color: "#4169E1", fontWeight: "bold" } : {})}
                >
                  People
                </NavLink>
              </li>
              <li className="navbar-li">
                <NavLink
                  to="/projects"
                  style={({ isActive }) => (isActive ? { color: "#4169E1", fontWeight: "bold" } : {})}
                >
                  Projects
                </NavLink>
              </li>
              <li className="navbar-li">
                <NavLink
                  to="/investors"
                  style={({ isActive }) => (isActive ? { color: "#4169E1", fontWeight: "bold" } : {})}
                >
                  Investors
                </NavLink>
              </li>
              <li className="navbar-li">
                <NavLink
                  to="/dashboard"
                  style={({ isActive }) => (isActive ? { color: "#4169E1", fontWeight: "bold" } : {})}
                >
                  Dashboard
                </NavLink>
              </li>
              <li className="navbar-li">
                <NavLink
                  to="/profile_details"
                  style={({ isActive }) => (isActive ? { color: "#4169E1", fontWeight: "bold" } : {})}
                >
                  Edit Profile
                </NavLink>
              </li>
              <li className="navbar-li">
                <a onClick={logout} className="log_out">
                  Log out
                </a>
              </li>
            </>
          )}
        </ul>
      </nav>
      {/* <div className="category-navbar">
        <ul className={`categories ${categoriesOpen ? "categories-open" : ""}`}>
          {Data.map((item, index) => (
            <li key={index}>
              <NavLink to={`/category/${item.categoryName}`}>
                {item.categoryName}
              </NavLink>
            </li>
          ))}
        </ul>
      </div> */}
    </>
  );
};

export default Navbar;
