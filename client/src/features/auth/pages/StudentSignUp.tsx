import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ROUTES } from "@core/router/paths";

import { studentRegister } from "../services/AuthService";

import { TextInput, Spiner, MotionDiv, ErrorMessage } from "@shared/ui";

import { toast } from "sonner";

import { ShowPassword } from "../";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
}

export default function StudentSignUp () {

  const [loading,setLoading] = useState(false)
  const [showPassword,setShowPassword] = useState(false)

  const navigate = useNavigate()

  const methods = useForm<FormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agree: false,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = methods;

  const watchedValues = watch();

  const onSubmit = async (data: FormData) => {
    if (!data.agree) {
      toast.error('Please agree to the terms and conditions.');
      return;
    }

    try {
      setLoading(true);
      const response = await studentRegister(data);
      sessionStorage.setItem("emailForOtp", data.email);
      const expiryTime = Date.now() + 2 * 60 * 1000; // 2 minutes from now
      localStorage.setItem("otpExpiry", expiryTime.toString());
      sessionStorage.setItem("role", 'student');
      navigate(ROUTES.auth.otp);
      toast.success(response.message);
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <MotionDiv className="bg-white p-10 my-8 rounded-lg shadow-2xl w-full max-w-xl dark:bg-gray-800 text-black dark:text-white">
        <h2 className="text-center text-2xl font-bold mb-2 text-indigo-600 dark:text-white">Create Your Skillbyte Account</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Fill out the form below to start as a member on skillbyte
        </p>
        {loading&&<Spiner/>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>

            <TextInput
              id="fullName"
              type="text"
              placeholder="Full Name"
              {...register("fullName", {
                required: "Full name is required",
                minLength: { value: 2, message: "Full name must be at least 2 characters" },
              })}
            />
            <ErrorMessage error={errors.fullName?.message as string} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>

            <TextInput
              id="email"
              type="email"
              placeholder="Email Address"
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
          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-4 sm:space-y-0">
            <div className="w-full ">
              <div className="flex  text-center">
              <label className="block text-sm font-medium mb-1">Password</label>
              </div>
              <TextInput
                id="password"
                type="password"
                placeholder="Password"
                showPassword={showPassword}
                icon={<ShowPassword  showPassword={showPassword} setShowPassword={(value:boolean)=>setShowPassword(value)} />}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                  },
                })}
              />
              <ErrorMessage error={errors.password?.message as string} />
            </div>
            <div className="w-full">
              <div className="flex justify-between text-center">
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              </div>
              <TextInput
                id="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                showPassword={showPassword}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watchedValues.password || "Passwords do not match",
                })}
              />
              <ErrorMessage error={errors.confirmPassword?.message as string} />
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              {...register("agree", { required: "You must agree to the terms" })}
              className="mt-1"
            />

            <label className="text-sm text-gray-400">
              By signing up, I agree with the&nbsp;
              <Link to="#" className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500">
                Terms of Use
              </Link>
              &nbsp;and&nbsp;
              <a href="#" className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500">
                Privacy Policy
              </a>
            </label>
          </div>


            <button
            type="submit"
            disabled={loading || !watchedValues.agree}
            className={`w-full  text-white rounded-md py-2 font-medium transition disabled:opacity-50 ${
              watchedValues.agree
                ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                : "bg-gray-400 cursor-not-allowed text-gray-200"
            } `}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?&nbsp;
          <Link to={ROUTES.auth.signIn} className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500">
            Sign in
          </Link>
        </p>
          <p className="text-center text-sm text-gray-400 mt-2">
            Want to become an Instructor? &nbsp;
            <Link to={ROUTES.auth.instructorRegister} className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500">
              Create an account
            </Link>
           </p>
      </MotionDiv>
    </div>
  );
}
