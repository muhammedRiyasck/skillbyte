import { useEffect, useState, useRef } from "react";
import logo from "../../../assets/orginal_logo.png";
import { useNavigate } from "react-router-dom";

import { verifyOtp, resendOtp } from "../services/AuthService";
import { toast } from "sonner";
import ErrorMessage from "../../../shared/ui/ErrorMessage";

function Otp() {
  const [otpArr, setOtp] = useState(Array(4).fill(""));
  const [email, setEmail] = useState("");
  const [time, setTime] = useState(0);
  const [error, setError] = useState("");

  const inputField = useRef<Array<HTMLInputElement | null>>([]);

  const navigate = useNavigate();
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("emailForOtp");
    if (!storedEmail) {
      navigate("/auth/register");
    } else {
      inputField.current[0]?.focus();
      setEmail(storedEmail);
      const storedExpiry = localStorage.getItem("otpExpiry");
      console.log(storedExpiry,'expire time')
      if (storedExpiry) {
        const remaining = parseInt(storedExpiry, 10) - Date.now();
        setTime(remaining > 0 ? remaining : 0);
      }
    }
    return () => sessionStorage.removeItem('emailForOtp')
  }, [navigate]);

  useEffect(() => {
    if (time <= 0) return;

    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [time]);

  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);

  const handleClick = (index: number) => {
    inputField.current[index]?.setSelectionRange(1, 1);
    if (index > 0 && !otpArr[index - 1]) {
      inputField.current[otpArr.indexOf("")]?.focus();
    }
  };

  const handleChange = (value: string, index: number) => {
    if (/[^0-9]/.test(value)) return; // Only digits
    const newOtp = [...otpArr];
    newOtp[index] = value.trim().slice(-1);
    otpArr[index + 1]
      ? inputField.current[newOtp.indexOf("")]?.focus()
      : value.trim() && inputField.current[index + 1]?.focus();
    setOtp(newOtp);
  };

  const handleBackSpace = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const target = e.target as HTMLInputElement;
    if (!target.value && e.key === "Backspace") {
      inputField.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
   
      const Otp = otpArr.join("");
      if (Otp.length === 4) {
        setError("");
        const response = await verifyOtp({ Otp, email });
        sessionStorage.removeItem("emailForOtp");
        localStorage.removeItem("otpExpiry");
        navigate("/auth/login");
        toast.success(response.message);
      } else {
        setError("OTP Should be 4 digit");
      }
  };

  const ResendOtp = async () => {
    console.log(email, "frontend resend otp");
    if (email) {
      console.log(email, "resend otp called");
      const Otp = await resendOtp(email);
      let minutes = 1 * 60 * 1000;
      const expiryTime = Date.now() + minutes
      localStorage.setItem("otpExpiry", expiryTime.toString());
      setTime(minutes);
      toast.success(Otp.message);
    } else {
      toast.success("Do Registration Once more");
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 px-4 md:px-8">
      <img className="w-30 h-20 " src={logo} alt="" />

      <div className="mt-28 md:min-h-screen md:mt-0 dark:bg-gray-900 flex items-center justify-center ">
        <div className="w-full max-w-md  dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-center text-4xl font-bold dark:text-white ">
              {time != 0 ? `${minutes}:${seconds > 9 ? seconds : `0${seconds}`}` : ""}
            </h1>
            {!time && <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Skillbyte</h1>}
            <p className="mt-2 text-gray-600 dark:text-gray-300">Enter the 4-digit code sent to your email</p>
          </div>

          {/* OTP Boxes */}
          <div className="flex justify-center gap-3 mt-6">
            {otpArr.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                value={digit}
                ref={(input) => {
                  inputField.current[i] = input;
                }}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleBackSpace(e, i)}
                onClick={() => handleClick(i)}
                className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            ))}
          </div>
          <ErrorMessage error={error} />
          {/* Verify Button */}
          <button
            onClick={handleVerify}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Verify
          </button>

          {/* Resend Link */}
          <div className="text-center mt-4">
            {time > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in{" "}
                <span className="font-medium">
                  {minutes}:{seconds > 9 ? seconds : `0${seconds}`}
                </span>
              </p>
            ) : (
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:cursor-pointer" onClick={ResendOtp}>
                Resend Code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Otp;
