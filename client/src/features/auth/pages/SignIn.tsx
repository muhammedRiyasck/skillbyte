import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Spiner, TextInput, ErrorMessage } from "@shared/ui";
import { toast } from "sonner";

import { login } from "../services/AuthService";
import { ShowPassword } from "../";

import { useDispatch } from "react-redux";
import { setUser } from "../";
import type { AppDispatch } from "@core/store/Index";
import MotionDiv from "@shared/ui/MotionDiv";
import { ROUTES } from "@core/router/paths";

interface FormData {
  email: string;
  password: string;
  role: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const methods = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
      role: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  // take the error from url if any and show it as toast
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      toast.error(error);
    }
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const response = await login(data);

      dispatch(setUser(response.data.userData));
      if (data.role === 'instructor') {
        setTimeout(() => {
          navigate(ROUTES.instructor.myCourses, { replace: true });
        }, 0);
        toast.success('instructor login successful');
      } else {
        navigate(ROUTES.root);
        toast.success(response.message);
      }
    } catch {
      // toast is handled inside service; optional: toast.error('Login failed')
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50  px-4  dark:bg-gray-900 ">
      {loading && <Spiner/>}
      <MotionDiv
        className="w-full max-w-xl bg-white p-10 rounded-lg shadow-2xl dark:bg-gray-800 my-8 dark:text-white"
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>

            <TextInput
              id="email"
              type={"email"}
              placeholder="your.email@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
            />
            <ErrorMessage error={errors.email?.message as string} />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>

            <TextInput
              id="password"
              type="password"
              placeholder="********"
              showPassword={showPassword}
              icon={
                <ShowPassword
                  showPassword={showPassword}
                  setShowPassword={(value: boolean) => setShowPassword(value)}
                />
              }
              {...register("password", {
                required: "Password is required",
              })}
            />
            <ErrorMessage error={errors.password?.message as string} />
          </div>

          <label htmlFor="role" className="block text-sm font-medium mb-2">
            Role
          </label>
          <div className="flex justify-center">
            <div className="flex  dark:text-white text-sm font-medium mx-4">
              <input
                type="radio"
                value="student"
                id="student_role"
                className=" w-full px-4 py-2 hover:cursor-pointer dark:bg-gray-700 dark:text-white"
                {...register("role", { required: "Role is required" })}
              />
              <label className="mx-2 text-gray-700 dark:text-gray-400">Learner</label>
            </div>
            <div className="flex  dark:text-white text-sm font-medium mx-4">
              <input
                type="radio"
                id="instructor_role"
                value="instructor"
                className=" w-full px-4 py-2 hover:cursor-pointer  dark:text-white "
                {...register("role", { required: "Role is required" })}
              />
              <label className="mx-2 text-gray-700 dark:text-gray-400">Instructor</label>
            </div>
          </div>
          <ErrorMessage error={errors.role?.message as string} />

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
            <Link to={ROUTES.auth.forgotPassword} className="text-indigo-600  dark:text-indigo-400  hover:text-indigo-500">
              Forgot password?
            </Link>
          </p>
          <p className="text-center text-sm text-gray-400 mt-2">
            New to Skillbyte? &nbsp;
            <Link to={ROUTES.auth.learnerRegister} className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500">
              Create an account
            </Link>
          </p>
          <p className="text-center text-sm text-gray-400 mt-2">
            Want to become an Instructor? &nbsp;
            <Link to={ROUTES.auth.instructorRegister} className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500">
              Create an account
            </Link>
          
          </p>
        </div>
      </MotionDiv>
    </div>
  );
};

export default Login;
