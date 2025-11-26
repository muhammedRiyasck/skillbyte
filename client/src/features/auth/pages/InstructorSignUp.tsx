import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { ROUTES } from "@core/router/paths";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MotionDiv } from "@shared/ui";
import { instructorRegister } from "../";
import { toast } from "sonner";
import { Spiner } from "@shared/ui";

import ProgressBar from "../components/ProgressBar";
import PersonalDetailsStep from "../components/PersonalDetailsStep";
import ProfessionalDetailsStep from "../components/ProfessionalDetailsStep";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  subject: string;
  jobTitle: string;
  experience: string;
  socialMediaLink: string;
  portfolioLink: string;
  bio: string;
  resume: File | null;
  customJobTitle: string;
  customSubject: string;
  agree: boolean;
}

export default function InstructorSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const methods = useForm<FormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      subject: "",
      jobTitle: "",
      experience: "",
      socialMediaLink: "",
      portfolioLink: "",
      bio: "",
      resume: null,
      customJobTitle: "",
      customSubject: "",
      agree: false,
    },
  });

  const { handleSubmit, watch, trigger } = methods;

  const watchedValues = watch();

  const nextStep = async () => {
    if (currentStep < 2) {
      const fieldsToValidate =
        currentStep === 1
          ? ["fullName", "email", "password", "confirmPassword", "phoneNumber"]
          : ["subject", "jobTitle", "experience", "socialMediaLink", "portfolioLink", "bio", "resume"];
      const isValid = await trigger(fieldsToValidate as (keyof FormData)[]);
      if (isValid) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: FormData) => {
    if (!data.agree) {
      toast.error("Please agree to the terms and conditions.");
      return;
    }

    try {
      setLoading(true);
      const response = await instructorRegister({
        ...data,
        customJobTitle: data.customJobTitle || data.jobTitle,
        customSubject: data.customSubject || data.subject,
      });
      sessionStorage.setItem("emailForOtp", data.email);
      const expiryTime = Date.now() + 2 * 60 * 1000; // 2 minutes from now
      localStorage.setItem("otpExpiry", expiryTime.toString());
      sessionStorage.setItem("role", "instructor");
      navigate(ROUTES.auth.otp);
      toast.success(response.message);
    } catch (error: any) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Constants for options
  const jobTitleOptions = ["Software Engineer", "Designer", "Instructor", "Student", "Other"];
  const subjectOptions = ["Marketing", "Programming", "Designing", "Business", "Other"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 ">
      {loading && <Spiner />}
      <MotionDiv className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 my-12">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-indigo-600 dark:text-white">
          Create Your Instructor Account
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
          Fill out the form below to start building and sharing your courses with students across the globe!
        </p>

        <ProgressBar currentStep={currentStep} />

        <FormProvider {...methods}>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 1 && <PersonalDetailsStep showPassword={showPassword} setShowPassword={setShowPassword} />}

            {currentStep === 2 && (
              <ProfessionalDetailsStep subjectOptions={subjectOptions} jobTitleOptions={jobTitleOptions} />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-md transition flex items-center gap-2 ${
                  currentStep === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                }`}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition cursor-pointer flex items-center gap-2 ml-auto"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !watchedValues.agree}
                  className={`  text-white rounded-md py-2 px-4 font-medium transition disabled:opacity-50 ${
                    watchedValues.agree
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                      : "bg-gray-400 cursor-not-allowed text-gray-200"
                  } `}
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
              )}
            </div>
          </form>
        </FormProvider>

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account? &nbsp;
          <Link to={ROUTES.auth.signIn} className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500 ">
            Sign in
          </Link>
        </p>
        <p className="text-center text-sm text-gray-400 mt-2">
          Want to become an Learner? &nbsp;
          <Link to={ROUTES.auth.learnerRegister} className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500">
            Create an account
          </Link>
        </p>
      </MotionDiv>
    </div>
  );
}
