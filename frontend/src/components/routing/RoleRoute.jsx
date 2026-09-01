import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

// restricts a route to one or more roles. use inside ProtectedRoute.
// wired into the portal routes in frontend phase f2.
export function RoleRoute({ allow = [] }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allow.length && !allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
