
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../store/Index";
import { ROUTES } from "./paths";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

/**
 * Higher-order component to restrict route access based on user authentication and role.
 * Redirects unauthenticated users to the sign-in page and unauthorized users to the
 * dedicated 403 Forbidden page — no toasts, clean full-page error handling.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return <Navigate to={ROUTES.auth.signIn} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROUTES.forbidden} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
