import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { roleHome } from "../../utils/roles.js";

// restricts a route to one or more roles. use inside ProtectedRoute.
// wired into the portal routes in frontend phase f2.
export function RoleRoute({ allow = [] }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // signed in, just not allowed here (e.g. an admin opening a student url):
  // send them to their own area rather than the public marketing home page
  if (allow.length && !allow.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
