import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NoPage from "./pages/NoPage";
import Users from "./pages/Users";
import Projects from "./pages/Projects";
import Login from "./pages/Login";
import User from "./pages/User";
import InvestorDetails from "./pages/InvestorDetails";
import CreateAccount from "./pages/CreateAccount";
import ViewProjects from "./pages/ViewProjects";
import Navbar from "./components/NavBar/Navbar";
import AddInvestors from "./pages/AddInvestors";
import Investors from "./pages/Investors";
import ProjectDetails from "./pages/ProjectDetails";
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Navbar></Navbar>
        <Routes>
          <Route path="/" element={<Landing />} />
          {/* Comment out all other routes temporarily
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/users" element={<Users />} />
          <Route path="/user/:id" element={<User />} />
          <Route path="/investor/:id" element={<InvestorDetails />} />
          <Route path="/projects_map" element={<Projects />} />
          <Route path="/login" element={<Login />} />
          <Route path="/projects" element={<ViewProjects />} />
          <Route path="/create_account" element={<CreateAccount />} />
          <Route path="/add_investors" element={<AddInvestors />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NoPage />} />
          */}
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
