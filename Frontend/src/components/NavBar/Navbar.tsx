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
            <NavLink to="/about">About</NavLink>
          </li>
          {!isAuthenticated ? (
            <>
              <li className="navbar-li">
                <NavLink to="/login">Log in</NavLink>
              </li>
              <li className="navbar-li">
                <NavLink to="/create_account">Create Account</NavLink>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-li">
                <NavLink to="/projects">Projects</NavLink> {/* New Tab */}
              </li>
              <li className="navbar-li">
                <NavLink to="/investors">Investors</NavLink>
              </li>
              <li className="navbar-li">
                <NavLink to="/dashboard">Dashboard</NavLink>
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
