
// ProtectedRoute.tsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../store/Index";
import Spiner from "../../shared/ui/Spiner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[]; // optional roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user,loading } = useSelector((state: RootState) => state.auth);

  if(loading){
    return <Spiner/>
  }

  if ( !user) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
