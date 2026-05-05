import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Modal from "../modal/Modal";
import { useState, useEffect } from "react";

// ✅ Per-user theme key
function getThemeKey() {
  try {
    const user = JSON.parse(sessionStorage.getItem("user"));
    return user?.id ? `theme_${user.id}` : "theme_guest";
  } catch {
    return "theme_guest";
  }
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  // ✅ Read theme for THIS specific user
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(getThemeKey()) || "light";
  });

  useEffect(() => {
    const key = getThemeKey();
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem(key, theme); // ✅ saves as theme_1, theme_2, etc.
  }, [theme]);

  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        theme={theme}
        setTheme={setTheme}
      />
      <main className="app-main">
        <Outlet />
      </main>
      <Modal />
    </div>
  );
}
