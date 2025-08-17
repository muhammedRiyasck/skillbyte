import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
// import Spiner from "../../../shared/ui/Spiner";
import { toast } from "sonner";

import TextInput from "../../../shared/ui/TextInput";
import ErrorMessage from "../../../shared/ui/ErrorMessage";

import isEmailValid from "../../../shared/validation/Email";
import { isPasswordEntered } from "../../../shared/validation/Password";
import ShowPassword from "../components/ShowPassword";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ emailError: "", passwordError: "" });
  const [showPassword,setShowPassword] = useState(false)


  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const emailValidation = isEmailValid(email);
      const passwordValidation = isPasswordEntered(password);
      setError({
        emailError: emailValidation.success ? "" : emailValidation.message,
        passwordError: passwordValidation.success ? "" : passwordValidation.message,
      });

      if (!emailValidation.success) return;

      setLoading(true);
      await new Promise((res) => setTimeout(res, 1200));
      toast.success("Comming Soon! Our team is working hard to bring this feature to you.");
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
      <motion.div
        initial={{ opacity: -2, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-2xl dark:bg-gray-800 text-black dark:text-white"
      >
        <h2 className="text-2xl font-semibold text-center mb-1">Welcome Back to Skillbyte</h2>
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
              type={"email"}
              id="email"
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

            <TextInput type="password" 
            id="password" placeholder="********" 
            value={password} 
            setValue={setPassword}
            showPassword={showPassword}
            icon={()=><ShowPassword  showPassword={showPassword} setShowPassword={(value:boolean)=>setShowPassword(value)} />}

             />
            {error.emailError && <ErrorMessage error={error.passwordError} />}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 cursor-pointer text-white rounded-md py-2 mt-2 font-medium hover:bg-indigo-700 transition disabled:opacity-50`}
          >
            {loading ? "Signing In..." : "Sign In With Email"}
          </button>
        </form>

        <div className="mt-4 text-sm text-center space-y-1">
          <p>
            <Link to="/auth/forgot-password" className="text-indigo-600 hover:underline">
              Forgot password?
            </Link>
          
          </p>
          <p>
            New to Skillbyte? &nbsp;
            <Link to="/auth/register" className="text-indigo-600 hover:underline">
              Create an account
            </Link>
          </p>
          <p>
            Want to become an Instructor? &nbsp;
            {/* <Link to="/auth/instructor-signup" className="text-indigo-600 hover:underline">
              Create an account
            </Link> */}
            <Link to="#" className="text-indigo-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
