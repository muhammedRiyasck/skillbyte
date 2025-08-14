import { useEffect, useState  } from "react";
import logo from "../../../assets/orginal_logo.png";
import { useNavigate } from "react-router-dom";

import {verifyOtp} from '../services/AuthService'
import { toast } from "sonner";
import ErrorMessage from "../../../shared/ui/ErrorMessage";
function Otp() {
 const [otpArr, setOtp] = useState(Array(4).fill(''));
 const [email, setEmail] = useState("");
 const [timer, setTimer] = useState(60);
 const [error,setError] = useState('')
 const navigate = useNavigate()
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("emailForOtp");
    if (!storedEmail) {
      navigate("/auth/register");
    } else {
       setEmail(storedEmail)
         if (timer > 0) {
      const countdown = setInterval(() => {  
        setTimer((prev) => prev - 1);
      }, 1000);
      
      return () =>{
        clearInterval(countdown);
        // sessionStorage.removeItem('emailForOtp')
      }
    }
    }
},[navigate,timer])
    
    const handleChange = (value: string, index: number) => {
      if (!/^[0-9]?$/.test(value)) return; // Only digits
      const newOtp = [...otpArr];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto focus next box
      if (value && index < otpArr.length - 1) {
        
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    };
    
    const handleVerify = async () => {
      try {
        const otp = otpArr.join('')
        if(otp.length==4){
        setError('')
        const response = await verifyOtp({otp,email})
        sessionStorage.removeItem('emailForOtp')
        navigate('/')
        toast.success(response.message)
        }else{
          setError('OTP Should be 4 digit')
        }
      } catch (error) {
        console.log(error)
      }
        
  };

   

  return (
    <div className="bg-gray-50 dark:bg-gray-900 px-4 md:px-8">
     <img className="w-30 h-20 " src={logo} alt="" />

    <div className="min-h-screen dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md  dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {/* Logo */}
        <div className="text-center">
       <h1 className="text-center text-4xl font-bold dark:text-white ">{timer!=0?timer:''}</h1>
          {!timer&&<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Skillbyte</h1>}
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Enter the 4-digit code sent to your email
          </p>
        </div>

        {/* OTP Boxes */}
        <div className="flex justify-center gap-3 mt-6">
          {otpArr.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          ))}
          
        </div>
          <ErrorMessage error={error}/>
        {/* Verify Button */}
        <button
          onClick={handleVerify}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Verify
        </button>

          {/* Resend Link */}
         <div className="text-center mt-4">
          {timer > 0 ? (
            <p className="text-sm text-gray-500">
              Resend code in <span className="font-medium">{timer}s</span>
            </p>
          ) : (
            
            <button
            className="text-sm text-blue-600 dark:text-blue-400 hover:cursor-pointer"
            onClick={() => alert("Resend OTP")}
          >
            Resend Code
          </button>
          )}
        </div>
        
       
      </div>
    </div>
  </div>
  );
}

export default Otp

