import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import FolderView from "./pages/FolderView";
import Shareable from "./pages/Shareable";
import Account from "./pages/Account";
import Favorites from "./pages/Favorites";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Trash from "./pages/Trash";
import Friends from "./pages/Friends";

const getUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user"));
  } catch {
    return null;
  }
};

export default function App() {
  const user = getUser();

  return (
    <Routes>
      <Route
        path="/"
        element={
          user?.email ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="files" element={<FolderView />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="shareable" element={<Shareable />} />
        <Route path="account" element={<Account />} />
        <Route path="trash" element={<Trash />} />{" "}
        {/* ✅ no /dashboard/ prefix */}
        <Route path="friends" element={<Friends />} />{" "}
        {/* ✅ no /dashboard/ prefix */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
