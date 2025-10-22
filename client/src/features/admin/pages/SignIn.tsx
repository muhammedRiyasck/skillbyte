import React, { useState,   } from "react";
import {  useNavigate } from "react-router-dom";
import { ROUTES } from "@core/router/paths";
import Spiner from "@shared/ui/Spiner";
import { toast } from "sonner";

import TextInput from "@shared/ui/TextInput";
import ErrorMessage from "@shared/ui/ErrorMessage";

import login from "../services/LoginService";
import isEmailValid from "@shared/validation/Email";
import { isPasswordEntered } from "@shared/validation/Password";
import ShowPassword from "../../auth/components/ShowPassword";

import { useDispatch } from "react-redux";
import { setUser } from "../../auth/AuthSlice";
import type { AppDispatch } from "@core/store/Index";
import MotionDiv from "@shared/ui/MotionDiv";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ emailError: "", passwordError: ""});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const emailValidation = isEmailValid(email);
      const passwordValidation = isPasswordEntered(password);
      setError({
        emailError: emailValidation.success ? "" : emailValidation.message,
        passwordError: passwordValidation.success ? "" : passwordValidation.message,        
      });

      if (emailValidation.success && passwordValidation.success ){
        setLoading(true);
          const response = await login({email,password})
          console.log(response)
          dispatch(setUser(response?.data))
          navigate(ROUTES.admin.studentManagement)
          toast.success(response.message)
      }

    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // const handleGoogleLogin = async () => {
  //   window.location.href = "http://localhost:4000/api/auth/google";
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50  px-4  dark:dark:bg-gray-800 ">
      {loading && <Spiner/>}
      <MotionDiv
        className="w-full max-w-lg bg-white p-8 rounded-lg shadow-2xl dark:bg-gray-800 text-black dark:text-white"
      >
        <h2 className="text-2xl font-semibold text-center  text-indigo-600 dark:text-white mb-1">Welcome Back Admin</h2>
        <p className="text-gray-500 text-center  text-sm">Sign in to access control</p>
{/* 
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center border border-gray-300 rounded-md py-2 text-sm font-medium  hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
          Continue with Google
        </button> */}

        <div className="flex items-center my-4">
          <div className="flex-grow border-gray-200"></div>
          {/* <span className="mx-2 text-gray-400 text-sm">OR</span> */}
     
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-6 ">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>

            <TextInput
              id="email"
              type={"email"}
              placeholder="your.email@example.com"
              value={email}
              onChange={setEmail}
            />
            {error.emailError && <ErrorMessage error={error.emailError} />}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>

            <TextInput
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={setPassword}
              showPassword={showPassword}
              icon={ (
                <ShowPassword
                  showPassword={showPassword}
                  setShowPassword={(value: boolean) => setShowPassword(value)}
                />
              )}
            />
            {error.passwordError && <ErrorMessage error={error.passwordError} />}
          </div>

        
        <div className="text-center">      
          <button
            type="submit"
            disabled={loading}
            className={`w-2/3  bg-indigo-600 cursor-pointer text-white rounded-md py-2 mt-3 font-medium hover:bg-indigo-700 transition disabled:opacity-50`}
          >
            {loading ? "Signing In..." : "Sign In With Email"}
          </button>
          </div>
        </form>

      
      </MotionDiv>
    </div>
  );
};

export default Login;
