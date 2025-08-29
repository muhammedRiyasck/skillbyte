import { Navigate } from "react-router-dom";
import type { RootState } from "../store/Index";
import { useSelector } from "react-redux";
import React from "react";

const PublicRoute = ({ children , endPoint }: { children: React.ReactElement ,endPoint:string }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (user) return <Navigate to={endPoint} replace />;

  return children;
};

export default PublicRoute
