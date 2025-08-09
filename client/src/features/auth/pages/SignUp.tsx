import { useState } from "react";
import { Link } from "react-router-dom";

import TextInput from "../../../shared/ui/TextInput";
import ErrorMessage from "../../../shared/ui/ErrorMessage";

import isNameValid from "../../../shared/validation/Name";
import isEmailValid from "../../../shared/validation/Email";
import isPasswordValid from "../../../shared/validation/Password";
import isConfirmPasswordValid from "../../../shared/validation/ConfirmPassword";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [error, setError] = useState({
    fullNameError: "",
    emailError: "",
    passwordError: "",
    confirmPasswordError: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nameValidation = isNameValid(formData.fullName);
    const emailValidation = isEmailValid(formData.email);
    const passwordValidation = isPasswordValid(formData.password);
    const confirmPasswordValidation = isConfirmPasswordValid(
      formData.password,
      formData.confirmPassword
    );

    setError({
      fullNameError: nameValidation.success ? "" : nameValidation.message ,
      emailError: emailValidation.success ? "" : emailValidation.message ,
      passwordError: passwordValidation.success ? "" : passwordValidation.message ,
      confirmPasswordError: confirmPasswordValidation.success
        ? ""
        : confirmPasswordValidation.message ,
    });



  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md dark:bg-gray-800 text-black dark:text-white">
        <h2 className="text-center text-2xl font-bold mb-2">Create Your Skillbyte Account</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Fill out the form below to start as a member on skillbyte
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
          

            <TextInput
              type="text"
              id="fullName"
              value={formData.fullName}
              placeholder="Full Name"
              setValue={(value) => setFormData({ ...formData, fullName: value })} 
              error={error.fullNameError}
            />
            < ErrorMessage error={error.fullNameError} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
           
            <TextInput
              type="email"
              id="email"
              value={formData.email}
              placeholder="Email Address"
              setValue={(value) => setFormData({ ...formData, email: value })}
              error={error.emailError}
            />
            <ErrorMessage error={error.emailError} />
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-4 sm:space-y-0">
            <div className="w-full">
              <label className="block text-sm font-medium mb-1">Password</label>
         
              <TextInput
                type="password"
                id="password"
                value={formData.password}
                placeholder="Password"
                setValue={(value) => setFormData({ ...formData, password: value })}
              error={error.passwordError}
              />
              <ErrorMessage error={error.passwordError} />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
           
              <TextInput
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                placeholder="Confirm Password"
                setValue={(value) => setFormData({ ...formData, confirmPassword: value })}
                error={error.confirmPasswordError}
              />
              <ErrorMessage error={error.confirmPasswordError} />
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              className="mt-1"
              required
            />
         
            <label className="text-sm text-gray-400">
              By signing up, I agree with the&nbsp;
              <Link to="#" className="text-indigo-600 hover:underline">
                Terms of Use
              </Link>
              &nbsp;and&nbsp;
              <a href="#" className="text-indigo-600 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition hover:cursor-pointer"
          >
            Sign up
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?&nbsp;
          <Link to="/auth/signin" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
