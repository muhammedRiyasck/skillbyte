
// ProtectedRoute.tsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../store/Index";
import { toast } from "sonner";
import { ROUTES } from "./paths";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[]; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    toast.info('You Should Login To Access This Page')
    return <Navigate to={ROUTES.root} replace />;
  }


  if (roles && !roles.includes(user.role)) {
    toast.error('You Do Not Have Permission To Access This Page')
    return <Navigate to={ROUTES.root} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
