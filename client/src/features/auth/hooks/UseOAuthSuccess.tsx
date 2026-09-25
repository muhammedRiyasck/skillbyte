
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUser } from "..";
import { ROUTES } from "@core/router/paths";
import { Home } from '@shared/shimmer'
/**
 * Component to handle the OAuth success redirect.
 * Fetches the user data and sets it in the Redux store upon successful OAuth login.
 */
const OAuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, { withCredentials: true })
      .then(res => {
        toast.success("Login successful!");
        dispatch(setUser(res.data.userData))
        navigate(ROUTES.root);
      })
      .catch(() => {
        toast.success("Learner Registration Successfull Via Google")
        navigate(ROUTES.auth.signIn);
      });
  }, [navigate, dispatch]);

  return <Home />


}

export default OAuthSuccess

