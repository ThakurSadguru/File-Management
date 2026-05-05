import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  let user = null;

  try {
    user = JSON.parse(sessionStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!user?.email) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
