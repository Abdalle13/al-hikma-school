import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

// gate for any route that needs a logged in user.
// wired into the portal routes in frontend phase f2, once login exists.
export function ProtectedRoute() {
  const { token } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
