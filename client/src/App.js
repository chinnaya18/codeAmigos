// client/src/App.js
import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

import Welcome from "./pages/Welcome";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import RepoViewer from "./pages/RepoViewer";
import FileViewer from "./pages/FileViewer";
import Codespace from "./pages/Codespace";
import NewRepo from "./pages/NewRepo";
import NewFile from "./pages/NewFile";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import ForgotPassword from "./pages/ForgotPassword";
import Explore from "./pages/Explore";

import { AuthContext } from "./context/AuthContext";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />

        <Route path="/repo/:repoId" element={<RepoViewer />} />
        <Route path="/repo/:repoId/file/:fileId" element={<FileViewer />} />
        <Route path="/repo/:repoId/file/new" element={<NewFile />} />
        <Route path="/newrepo" element={<NewRepo />} />
        <Route path="/codespace/:repoId" element={<Codespace />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/admin"
          element={
            user?.role === "admin" ? <AdminPanel /> : <Navigate to="/home" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
