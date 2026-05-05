import { NavLink, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  BarChart3,
  FolderOpen,
  Share2,
  User2,
  Star,
  ChevronLeft,
  ChevronRight,
  Images,
  Trash2,
  Users,
} from "lucide-react";
import { useFileContext } from "../../context/useFileContext";
import logo from "../../assets/logo.png";

const linkClass = ({ isActive }) =>
  `sb-link ${isActive ? "active" : ""}`.trim();

export default function Sidebar({ collapsed, setCollapsed, theme, setTheme }) {
  const navigate = useNavigate();

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sb-top">
        <div className="sb-brand" onClick={() => navigate("/dashboard")}>
          <img className="sb-logo" src={logo} alt="FileOrbit" />
        </div>
        <button
          className="sb-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sb-nav">
        <NavLink to="/dashboard" className={linkClass} end>
          <BarChart3 size={18} />
          {!collapsed && "Dashboard"}
        </NavLink>
        <NavLink to="/dashboard/files" className={linkClass}>
          <FolderOpen size={18} />
          {!collapsed && "My Files / Folders"}
        </NavLink>
        <NavLink to="/dashboard/gallery" className={linkClass}>
          <Images size={18} />
          {!collapsed && "Gallery"}
        </NavLink>
        <NavLink to="/dashboard/favorites" className={linkClass}>
          <Star size={18} />
          {!collapsed && "Favorites"}
        </NavLink>
        <NavLink to="/dashboard/shareable" className={linkClass}>
          <Share2 size={18} />
          {!collapsed && "Shareable"}
        </NavLink>
        <NavLink to="/dashboard/account" className={linkClass}>
          <User2 size={18} />
          {!collapsed && "Account"}
        </NavLink>
        <NavLink to="/dashboard/trash" className={linkClass}>
          <Trash2 size={18} />
          {!collapsed && "Recycle Bin"}
        </NavLink>
        <NavLink to="/dashboard/friends" className={linkClass}>
          <Users size={18} />
          {!collapsed && "Friends"}
        </NavLink>
      </nav>

      {/* ✅ Theme toggle at bottom of sidebar */}
      <div className="sb-footer">
        <button
          className="sb-link"
          onClick={() =>
            setTheme((prev) => (prev === "light" ? "dark" : "light"))
          }
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          {!collapsed && (theme === "light" ? "Dark Mode" : "Light Mode")}
        </button>
      </div>
    </aside>
  );
}
