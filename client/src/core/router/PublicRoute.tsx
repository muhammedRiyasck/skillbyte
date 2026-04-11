import { Navigate } from "react-router-dom";
import type { RootState } from "../store/Index";
import { useSelector } from "react-redux";
import React from "react";
import { ROUTES } from "./paths";
import { UserRole } from "@/shared/enums/UserRole";

const PublicRoute = ({ children , endPoint }: { children: React.ReactElement ,endPoint:string }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  if(user?.role===UserRole.INSTRUCTOR){
    return <Navigate to={ROUTES.instructor.dashboard} replace={true} />;
    } 
  if(user?.role===UserRole.ADMIN){
    return <Navigate to={ROUTES.admin.dashboard} replace={true} />;
    } 
  if(endPoint) if (user) return <Navigate to={endPoint} replace />;

  
  return children;
};

export default PublicRoute
