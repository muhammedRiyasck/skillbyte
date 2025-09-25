import { Navigate } from "react-router-dom";
import type { RootState } from "../store/Index";
import { useSelector } from "react-redux";
import React from "react";

const PublicRoute = ({ children , endPoint }: { children: React.ReactElement ,endPoint:string }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  if(user?.role==='instructor'){
    console.log('instructor route')
    return <Navigate to={'/instructor/myCourses'} replace={true} />;
    } 
  if(user?.role==='admin'){
    console.log('instructor route')
    return <Navigate to={'/admin/instructor-request'} replace={true} />;
    } 
  if(endPoint) if (user) return <Navigate to={endPoint} replace />;

  
  return children;
};

export default PublicRoute
