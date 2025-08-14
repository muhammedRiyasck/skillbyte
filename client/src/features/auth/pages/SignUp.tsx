import { useState  } from "react";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../services/AuthService";

import TextInput from "../../../shared/ui/TextInput";
import ErrorMessage from "../../../shared/ui/ErrorMessage";
import Spiner from "../../../shared/ui/Spiner";

import isNameValid from "../../../shared/validation/Name";
import isEmailValid from "../../../shared/validation/Email";
import isPasswordValid from "../../../shared/validation/Password";
import isConfirmPasswordValid from "../../../shared/validation/ConfirmPassword";
import { toast } from "sonner";

import ShowPassword from "../components/ShowPassword";

export default function SignupForm() {

  const [loading,setLoading] = useState(false)
  const [showPassword,setShowPassword] = useState(false)

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

  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  
  const  handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    if(nameValidation.success && emailValidation.success && passwordValidation.success && confirmPasswordValidation.success){
      try {
        setLoading(true)
        const response = await register(formData)
        console.log(response,'response')
        sessionStorage.setItem("emailForOtp", formData.email);
        navigate('/auth/otp')
        setLoading(false)
        toast.success(response.message)
        
      } catch (error:any) {
        console.log(error,'error')
      } finally{
        setLoading(false)
      }
    }


  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md dark:bg-gray-800 text-black dark:text-white">
        <h2 className="text-center text-2xl font-bold mb-2">Create Your Skillbyte Account</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Fill out the form below to start as a member on skillbyte
        </p>
        {loading&&<Spiner/>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
          

            <TextInput
              type="text"
              id="fullName"
              value={formData.fullName}
              placeholder="Full Name"
              setValue={(value) => setFormData({ ...formData, fullName: value })} 
              
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
            />
            <ErrorMessage error={error.emailError} />
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-4 sm:space-y-0">
            <div className="w-full ">
              <div className="flex  text-center">
              <label className="block text-sm font-medium mb-1">Password</label>
              </div>
              <TextInput
                type="password"
                id="password"
                value={formData.password}
                placeholder="Password"
                setValue={(value) => setFormData({ ...formData, password: value })}
                showPassword={showPassword}
                icon={()=><ShowPassword  showPassword={showPassword} setShowPassword={(value:boolean)=>setShowPassword(value)} />}
                />
                
              <ErrorMessage error={error.passwordError} />
            </div>
            <div className="w-full">
              <div className="flex justify-between text-center">
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              </div>
              <TextInput
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                placeholder="Confirm Password"
                setValue={(value) => setFormData({ ...formData, confirmPassword: value })}
                showPassword={showPassword}
                // icon={()=><ShowPassword  showPassword={showPassword} setShowPassword={(value:boolean)=>setShowPassword(value)} />}

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
              

          {/* <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition hover:cursor-pointer"
          >
            Sign up
          </button> */}
            <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 cursor-pointer text-white rounded-md py-2 font-medium hover:bg-indigo-700 transition disabled:opacity-50`}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?&nbsp;
          <Link to="/auth/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
