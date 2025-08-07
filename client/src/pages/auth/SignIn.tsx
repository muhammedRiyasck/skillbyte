import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

   const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API
      await new Promise((res) => setTimeout(res, 1200));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async() => {
    // TODO: Add Google OAuth logic
     setLoading(true);
     try {
      await new Promise((res) => setTimeout(res, 1200));

     } catch (error) {
      
     }finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 dark:bg-gray-900 ">

      <motion.div
        initial={{ opacity: -2, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-2xl dark:bg-gray-800 text-black dark:text-white">
        <h2 className="text-2xl font-semibold text-center mb-1">
          Welcome Back to Skillbyte
        </h2>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Sign in to continue your learning journey.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center border border-gray-300 rounded-md py-2 text-sm font-medium  hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="h-5 w-5 mr-2"
          />
          {loading ? "Signing In..." : "Continue with Google"}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-2 text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

           <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-500 text-white rounded-md py-2 font-medium hover:bg-indigo-600 transition disabled:opacity-50`}
          >
            {loading ? "Signing In..." : "Sign In With Email"}
          </button>
        </form>

        <div className="mt-4 text-sm text-center space-y-1">
          <p>
            {/* <Link to="/forgot-password" className="text-indigo-600 hover:underline">
              Forgot password?
            </Link> */}
             <Link to="#" className="text-indigo-600 hover:underline">
              Forgot password?
            </Link>
          </p>
          <p>
            New to Skillbyte?{" "}
            <Link to="/signup" className="text-indigo-600 hover:underline">
              Create an account
            </Link>
          </p>
          <p>
            Want to become an Instructor?
            {/* <Link to="/instructor-signup" className="text-indigo-600 hover:underline">
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

