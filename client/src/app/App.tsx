
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import router from "../core/router/Routes.tsx";
import { Toaster } from "sonner";
import { fetchCurrentUser } from "../features/auth/AuthSlice.ts";
import type{ RootState, AppDispatch } from '../core/store/Index.ts';
import Home from "../shared/shimmer/Home.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (loading) {
    return (
      <Home/>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" richColors />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
