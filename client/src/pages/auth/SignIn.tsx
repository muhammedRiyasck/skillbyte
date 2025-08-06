import React, { useState } from "react";
import { Link } from "react-router-dom";
// import { useTheme } from "../../shared/lib/theme-context.tsx";

import ToggleButtom from "../../shared/ui/ThemeToggle";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add login logic
    console.log("Logging in with", email, password);
  };

  const handleGoogleLogin = () => {
    // TODO: Add Google OAuth logic
    console.log("Login with Google");
  };

//   const ThemeToggle = () => {
//   const { theme, toggleTheme } = useTheme();

//   return (
//     <button
//       onClick={toggleTheme}
//       className=" m-7 p-2 px-6 rounded cursor-pointer border bg-gray-100 dark:bg-gray-800 dark:text-white "
//     >
//       {theme === "light" ? "🌙 Dark" : "☀️ Light"}
//     </button>
//   );
// };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50  ">
        {/* <ThemeToggle  /> */}
       
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-2xl ">
        <h2 className="text-2xl font-semibold text-center mb-1">
          Welcome Back to Skillbyte
        </h2>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Sign in to continue your learning journey.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center border border-gray-300 rounded-md py-2 text-sm font-medium hover:bg-gray-100"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="h-5 w-5 mr-2"
          />
          Continue with Google
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
            className="w-full bg-indigo-500 text-white rounded-md py-2 font-medium hover:bg-indigo-600"
          >
            Sign In With Email
          </button>
        </form>

        <div className="mt-4 text-sm text-center space-y-1">
          <p>
            <Link to="/forgot-password" className="text-indigo-600 hover:underline">
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
            Want to become an Instructor?{" "}
            <Link to="/instructor-signup" className="text-indigo-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
