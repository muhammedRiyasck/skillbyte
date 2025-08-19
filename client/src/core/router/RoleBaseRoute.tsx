
// ProtectedRoute.tsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../store/Index";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[]; // optional roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  if ( !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
