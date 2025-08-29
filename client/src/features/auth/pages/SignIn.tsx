import React, { useState,   } from "react";
import { Link, useNavigate } from "react-router-dom";
import Spiner from "../../../shared/ui/Spiner";
import { toast } from "sonner";

import TextInput from "../../../shared/ui/TextInput";
import ErrorMessage from "../../../shared/ui/ErrorMessage";

import { login } from "../services/AuthService";
import isEmailValid from "../../../shared/validation/Email";
import { isPasswordEntered } from "../../../shared/validation/Password";
import ShowPassword from "../components/ShowPassword";

import { useDispatch } from "react-redux";
import { setUser } from "../AuthSlice";
import type { AppDispatch } from "../../../core/store/Index";
import MotionDiv from "../../../shared/ui/MotionDiv";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ emailError: "", passwordError: "", roleError: "" });
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
        roleError: role ? "" : "Role is Required",
      });

      if (emailValidation.success && passwordValidation.success && role){
        setLoading(true);
          const response = await login({email,password,role})
          dispatch(setUser(response.userData))
          navigate('/')
          toast.success(response.message)
      }

    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    window.location.href = "http://localhost:4000/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50  px-4  dark:bg-gray-900 ">
      {loading && <Spiner/>}
      <MotionDiv
        className="w-full max-w-lg bg-white p-8 rounded-lg shadow-2xl dark:bg-gray-800  dark:text-white"
      >
        <h2 className="text-2xl font-semibold text-center mb-1 text-indigo-600 dark:text-white">Welcome Back to Skillbyte</h2>
        <p className="text-gray-500 text-center mb-6 text-sm">Sign in to continue your learning journey.</p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center border border-gray-300 rounded-md py-2 text-sm font-medium  hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
          Continue with Google
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-2 text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>

            <TextInput
              id="email"
              type={"email"}
              placeholder="your.email@example.com"
              value={email}
              setValue={setEmail}
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
              setValue={setPassword}
              showPassword={showPassword}
              icon={() => (
                <ShowPassword
                  showPassword={showPassword}
                  setShowPassword={(value: boolean) => setShowPassword(value)}
                />
              )}
            />
            {error.passwordError && <ErrorMessage error={error.passwordError} />}
          </div>

          <label htmlFor="role" className="block text-sm font-medium mb-2">
            Role
          </label>
          <div className="flex justify-center">
            <div className="flex  dark:text-white text-sm font-medium mx-4">
              <input
                type="radio"
                name="role"
                value="student"
                id="student_role"
                className=" w-full px-4 py-2 hover:cursor-pointer dark:bg-gray-700 dark:text-white"
                onChange={(e) => setRole(e.target.value)}
              />
              <label className="mx-2 text-gray-700 dark:text-gray-400">Learner</label>
            </div>
            <div className="flex  dark:text-white text-sm font-medium mx-4">
              <input
                type="radio"
                name="role"
                id="instructor_role"
                value="instructor"
                className=" w-full px-4 py-2 hover:cursor-pointer  dark:text-white "
                onChange={(e) => setRole(e.target.value)}
              />
              <label className="mx-2 text-gray-700 dark:text-gray-400">Instructor</label>
            </div>
          </div>
          <ErrorMessage error={error.roleError} />

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 cursor-pointer text-white rounded-md py-2 mt-2 font-medium hover:bg-indigo-700 transition disabled:opacity-50`}
          >
            {loading ? "Signing In..." : "Sign In With Email"}
          </button>
        </form>

        <div className="mt-4 text-sm text-center space-y-1 ">
          <p>
            <Link to="/auth/forgot-password" className="text-indigo-600  dark:text-indigo-400  hover:text-indigo-500">
              Forgot password?
            </Link>
          </p>
          <p className="text-center text-sm text-gray-400 mt-2">
            New to Skillbyte? &nbsp;
            <Link to="/auth/learner-register" className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500">
              Create an account
            </Link>
          </p>
          <p className="text-center text-sm text-gray-400 mt-2">
            Want to become an Instructor? &nbsp;
            <Link to="/auth/instructor-register" className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500">
              Create an account
            </Link>
          
          </p>
        </div>
      </MotionDiv>
    </div>
  );
};

export default Login;
