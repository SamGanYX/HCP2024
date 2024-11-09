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
import CreateAccount from "./pages/CreateAccount";
import ViewProjects from "./pages/ViewProjects";
import Navbar from "./components/NavBar/Navbar";
import AddInvestors from "./pages/AddInvestors";
import Investors from "./pages/Investors";
import ProjectDetails from "./pages/ProjectDetails";
const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Navbar></Navbar>
        <Routes>
          <Route index element={<Home />}></Route>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/about" element={<About />}></Route>
          <Route path="/contact" element={<Contact />}></Route>
          <Route path="/users" element={<Users />}></Route>
          <Route path="/user/:id" element={<User />}></Route>
          <Route path="/projects_map" element={<Projects />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/projects" element={<ViewProjects />}></Route>
          <Route path="/create_account" element={<CreateAccount />}></Route>
          <Route path="/add_investors" element={<AddInvestors />}></Route>
          <Route path="/investors" element={<Investors />}></Route>
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="*" element={<NoPage />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
