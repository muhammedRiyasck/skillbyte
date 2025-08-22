import { useState } from "react";
import { Link } from "react-router-dom";
import validateEmailfrom from "../../../shared/validation/Email";
import { forgotPassword } from "../services/AuthService";
import { toast } from "sonner";
import ErrorMessage from "../../../shared/ui/ErrorMessage";
import Spiner from "../../../shared/ui/Spiner";
import MotionDiv from "../../../shared/ui/MotionDiv";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ email: "", role: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmailValid = validateEmailfrom(email);
    setError({
      email: isEmailValid.message,
      role: role ? "" : "role is required",
    });
    if (isEmailValid.success && role) {
      try {
        setLoading(true);
        const response = await forgotPassword({ email, role });
        toast.success(response.message);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      {loading && <Spiner />}
      <MotionDiv className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Logo / Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">Forgot Password</h2>
        <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
          Enter your email and we’ll send you a link to reset your password.
        </p>

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm dark:text-white font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="mt-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
            />
          </div>
          <ErrorMessage error={error.email} />
          <label htmlFor="role" className="block dark:text-white text-sm font-medium mb-2">
            Role
          </label>
          <div className="flex justify-center">
            <div className="flex  dark:text-white text-sm font-medium mx-4">
              <input
                type="radio"
                name="role"
                value="student"
                id="role"
                className=" w-full px-4 py-2 hover:cursor-pointer dark:bg-gray-700 dark:text-white"
                onChange={(e) => setRole(e.target.value)}
              />
              <label className="mx-2 text-gray-700 dark:text-gray-400">Learner</label>
            </div>
            <div className="flex  dark:text-white text-sm font-medium mx-4">
              <input
                type="radio"
                name="role"
                id="role"
                value="instructor"
                className=" w-full px-4 py-2 hover:cursor-pointer  dark:text-white "
                onChange={(e) => setRole(e.target.value)}
              />
              <label className="mx-2 text-gray-700 dark:text-gray-400">Instructor</label>
            </div>
          </div>
          <ErrorMessage error={error.role} />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 hover:cursor-pointer text-white font-semibold py-2 px-4 mt-4 rounded-md transition"
          >
            Send Reset Link
          </button>
        </form>

        {/* Back to login */}
        <div className="flex mt-6 text-sm text-gray-600 dark:text-gray-400 text-center">
          <p className=" text-center ">Remember your password?&nbsp;</p>
          <Link to="/auth/login" className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-200  ">
            Sign in
          </Link>
        </div>
      </MotionDiv>
    </div>
  );
};

export default ForgotPassword;
