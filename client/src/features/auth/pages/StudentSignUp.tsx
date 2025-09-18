import { useState  } from "react";
import { Link, useNavigate } from "react-router-dom";

import { studentRegister } from "../services/AuthService";

import TextInput from "../../../shared/ui/TextInput";
import ErrorMessage from "../../../shared/ui/ErrorMessage";
import Spiner from "../../../shared/ui/Spiner";

import isNameValid from "../../../shared/validation/Name";
import isEmailValid from "../../../shared/validation/Email";
import isPasswordValid from "../../../shared/validation/Password";
import isConfirmPasswordValid from "../../../shared/validation/ConfirmPassword";
import { toast } from "sonner";

import ShowPassword from "../components/ShowPassword";
import MotionDiv from "../../../shared/ui/MotionDiv";

export default function StudentSignUp () {

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

  const [agree,setAgree] = useState(false)
  console.log(agree)
  const navigate = useNavigate()

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
        const response = await studentRegister(formData)
        sessionStorage.setItem("emailForOtp", formData.email);
        const expiryTime = Date.now() + 2 * 60 * 1000; // 2 minutes from now
        localStorage.setItem("otpExpiry", expiryTime.toString());
        sessionStorage.setItem("role",'student')
        navigate('/auth/otp')
        setLoading(false)
        toast.success(response.message)
        
      } catch (error:any) {
      } finally{
        setLoading(false)
      }
    }


  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <MotionDiv className="bg-white p-10 my-8 rounded-lg shadow-2xl w-full max-w-lg dark:bg-gray-800 text-black dark:text-white">
        <h2 className="text-center text-2xl font-bold mb-2 text-indigo-600 dark:text-white">Create Your Skillbyte Account</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Fill out the form below to start as a member on skillbyte
        </p>
        {loading&&<Spiner/>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
          

            <TextInput
              id="fullName"
              type="text"
              value={formData.fullName}
              placeholder="Full Name"
              setValue={(value) => setFormData({ ...formData, fullName: value })} 
              
            />
            < ErrorMessage error={error.fullNameError} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
           
            <TextInput
              id="email"
              type="email"
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
                id="password"
                type="password"
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
                id="confirmPassword"
                type="password"
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
              checked={agree}
              onChange={() => setAgree(!agree)}
              className="mt-1"
              required
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
            disabled={loading||!agree}
            className={`w-full  text-white rounded-md py-2 font-medium transition disabled:opacity-50 ${
              agree
                ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                : "bg-gray-400 cursor-not-allowed text-gray-200"
            } `}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?&nbsp;
          <Link to="/auth" className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500">
            Sign in
          </Link>
        </p>
          <p className="text-center text-sm text-gray-400 mt-2">
            Want to become an Instructor? &nbsp;
            <Link to="/auth/instructor-register" className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500">
              Create an account
            </Link>
           </p>
      </MotionDiv>
    </div>
  );
}
