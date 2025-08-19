import { Navigate } from "react-router-dom";
import type { RootState } from "../store/Index";
import { useSelector } from "react-redux";
import React from "react";

const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (user) return <Navigate to="/" replace />;

  return children;
};

export default PublicRoute
