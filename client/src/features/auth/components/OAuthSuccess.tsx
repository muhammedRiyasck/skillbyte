
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUser } from "../";
import { ROUTES } from "@core/router/paths";
import { Home } from '@shared/shimmer'
const OAuthSuccess = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
 useEffect(() => {
    axios.get("http://localhost:4000/api/auth/me",{withCredentials:true})
      .then(res => {
        console.log("User:", res.data);
        toast.success("Login successful!");
        dispatch(setUser(res.data.userData))
        navigate(ROUTES.root);
      })
      .catch(() => {
        toast.success("Learner Registration Successfull Via Google")
        navigate(ROUTES.auth.signIn);
      });
  }, [navigate]);

  return <Home/>

  // (
  //   <div className="flex items-center justify-center h-screen dark:bg-gray-900 bg-white text-gray-800">
  //     <div className="text-center">
  //       <h1 className="text-2xl font-bold mb-4">OAuth Success</h1>
  //       <p className="text-lg">You have successfully logged in!</p>
  //       <p className="text-gray-500">Redirecting...</p>
  //       </div>
  //     <Spiner />
  //   </div>)
        
}

export default OAuthSuccess

