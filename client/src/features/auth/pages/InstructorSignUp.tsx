import  { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@core/router/paths";

import { ErrorMessage, MotionDiv, TextInput } from "@shared/ui";
import { ShowPassword } from "../";
import { isNameValid, isEmailValid, isPasswordValid, isConfirmPasswordValid } from "@shared/validation";
import { isValidSubject,isValidJobTitle,isValidExperience,isValidPortfolio, isValidSocailMedia } from "../InstructorValidation";

import { instructorRegister } from "../";
import { toast } from "sonner";
import { Spiner } from "@shared/ui";

export default function InstructorSignup () {
  const navigate = useNavigate()
  const [loading,setLoading] = useState(false)

  const [formData,setFormData] = useState({
      fullName : '',
      email : '',
      password: '',
      confirmPassword :'',
      subject: '',
      jobTitle: '',
      experience: '',
      socialMediaLink : '',
      portfolioLink : ''
  })

  const [formError,setFormError] = useState({
      fullNameError: '',
      emailError: '',
      passwordError: '',
      confirmPasswordError :'',
      subjectError: '',
      jobTitleError: '',
      experienceError: '',
      socialMediaLinError: '',
      portfolioLinkError: ''
  })

    const [showPassword,setShowPassword] = useState(false)


    const [customSubject , setCustomSubject] = useState('')
    const [isOtherSubjectSelected, setOtherSubjectSelected] = useState(false)

  const [customJobTitle, setCustomJobTitle] = useState("");
  const [isOtherTitleSelected, setIsOtherTitleSelected] = useState(false);


  const [agree, setAgree] = useState(false);

    const jobTitleOptions = ["Software Engineer", "Designer", "Instructor", "Student", "Other"];
    const subjectOptions = ["Marketing", "Programming", "Designing" , "Business", "Other"]
    
    const handleSubjectChange = (e:React.ChangeEvent<HTMLSelectElement>) =>{
      const selected = e.target.value;
      setFormData({...formData,subject:selected});
      if (selected === "Other") {
        setOtherSubjectSelected(true);
      } else {
        setOtherSubjectSelected(false);
        setCustomJobTitle("");
      }
    }
    
    const handleJobTitleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setFormData({...formData,jobTitle: selected});
    if (selected === "Other") {
      setIsOtherTitleSelected(true);
    } else {
      setIsOtherTitleSelected(false);
      setCustomJobTitle("");
    }
  };

    const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();

    const nameValid = isNameValid(formData.fullName)
    const emailValid = isEmailValid(formData.email)
    const passwordValid = isPasswordValid(formData.password)
    const confirmPasswordValid = isConfirmPasswordValid(formData.password,formData.confirmPassword)
    const subjectValid = isValidSubject(formData.subject,customSubject)
    const jobTitleValid = isValidJobTitle(formData.jobTitle,customJobTitle)
    const experienceValid = isValidExperience(formData.experience)
    const socialMediaLinkValid = isValidSocailMedia(formData.socialMediaLink)
    const portfolioValid = isValidPortfolio(formData.portfolioLink)

    setFormError({
    fullNameError: !nameValid.success ? nameValid.message : '',
    emailError: !emailValid.success ? emailValid.message : '',
    passwordError: !passwordValid.success ? passwordValid.message : '',
    confirmPasswordError: !confirmPasswordValid.success ? confirmPasswordValid.message : '',
    subjectError: !subjectValid.success ? subjectValid.message : '',
    jobTitleError: !jobTitleValid.success ? jobTitleValid.message : '',
    experienceError: !experienceValid.success ? experienceValid.message : '',
    socialMediaLinError: !socialMediaLinkValid.success ? socialMediaLinkValid.message : '',
    portfolioLinkError: !portfolioValid.success ? portfolioValid.message : ''
  });

  //  Stop form submission if any validation fails
  if (
    !nameValid.success ||
    !emailValid.success ||
    !passwordValid.success ||
    !confirmPasswordValid.success ||
    !subjectValid.success ||
    !jobTitleValid.success ||
    !experienceValid.success ||
    !socialMediaLinkValid.success ||
    !portfolioValid.success
  ) {
    return; 
  }

   try {
        setLoading(true)
        const response = await instructorRegister({...formData,customJobTitle,customSubject})
        console.log(response,'response')
        sessionStorage.setItem("emailForOtp", formData.email);
        const expiryTime = Date.now() + 2 * 60 * 1000; // 2 minutes from now
        localStorage.setItem("otpExpiry", expiryTime.toString());
        sessionStorage.setItem("role",'instructor')
        navigate(ROUTES.auth.otp)
        setLoading(false)
        toast.success(response.message)
        
      } catch (error:any) {
      } finally{
        setLoading(false)
      }


  };


  return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 ">
      {loading&&<Spiner/>}
      <MotionDiv className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 my-12">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-indigo-600 dark:text-white">
          Create Your Instructor Account
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
          Fill out the form below to start building and sharing your courses with students across the globe!
        </p>

        <form className="mt-6 space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Full Name
            </label>
            <TextInput
              id="fullName"
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(value)=>setFormData({...formData,fullName:value})}
            />
            <ErrorMessage error={formError.fullNameError}/>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email Address
            </label>
            <TextInput
              id="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(value)=>setFormData({...formData,email:value})}
              
            />
            <ErrorMessage error={formError.emailError}/>

          </div>

          {/* Password + Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <TextInput
              id="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(value)=>setFormData({...formData,password:value})}
              showPassword={showPassword}
              icon={<ShowPassword  showPassword={showPassword} setShowPassword={(value:boolean)=>setShowPassword(value)} />}
              
            />
              <ErrorMessage error={formError.passwordError}/>

            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm Password
              </label>
              <TextInput
                id="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(value)=>setFormData({...formData,confirmPassword:value})}
                showPassword={showPassword}
              
              />
                 <ErrorMessage error={formError.confirmPasswordError}/>

            </div>
          </div>

      
          {/* Professional Details Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Professional Details
            </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">

          <div>
            <label
              htmlFor="subjects"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Subject You Want to Teach
            </label>
            <select
              id="subjects"
              value={formData.subject}
              onChange={handleSubjectChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none  dark:bg-gray-700 dark:text-white"
            >
            <option  disabled value="">Select a subject</option>

              {subjectOptions.map((job,index)=>{
                return <option key={index} value={job}>{job}</option>
              })}
            </select>

              {isOtherSubjectSelected && (
              <input
                type="text"
                placeholder="Enter your Subject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="border w-full border-gray-300 rounded-lg shadow-lg p-2 my-3 bg-blue-400/5 dark:text-gray-300 focus:outline-none"
                maxLength={50}
              />
            )}


             <ErrorMessage error={formError.subjectError}/>

          </div>

          {/* Job Title */}
          <div>
            <label
              htmlFor="jobTitle"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Job Title
            </label>
            <select
              id="jobTitle"
              value={formData.jobTitle}
              onChange={handleJobTitleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
            >
              <option disabled value="">Select a job title</option>

              {jobTitleOptions.map((job,index)=>{
                return <option key={index} value={job}>{job}</option>
              })}
            </select>

                {isOtherTitleSelected && (
                    <input
                      type="text"
                      placeholder="Enter your job title"
                      value={customJobTitle}
                      onChange={(e) => setCustomJobTitle(e.target.value)}
                      className=" w-full border border-gray-300 rounded-lg p-2 my-3 dark:text-gray-300 shadow-lg bg-blue-400/5 focus:ring-blue-400/40 focus:outline-none"
                      maxLength={50}
                    />
                  )}

              <ErrorMessage error={formError.jobTitleError}/>

          </div>
        </div>
            {/* Experience */}
            <div className="mt-3">
              <label
                htmlFor="experience"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Years of Experience
              </label>
              <TextInput
                id="experience"
                type="number"
                placeholder="e.g. 5"
                value={formData.experience}
                onChange={(value)=>setFormData({...formData,experience:value})}
              />
              <ErrorMessage error={formError.experienceError}/>
            </div>

            {/* LinkedIn */}
            <div className="mt-3">
              <label
                htmlFor="linkedin"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
               professional SocialMedia Profile (LinkedIn,X,Twitter)
              </label>
              <TextInput
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={formData.socialMediaLink}
                onChange={(value)=>setFormData({...formData,socialMediaLink:value})}  
                />
              <ErrorMessage error={formError.socialMediaLinError}/>
            </div>

            {/* Portfolio */}
            <div className="mt-3">
              <label
                htmlFor="portfolio"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Portfolio / Website (Optional)
              </label>
              <TextInput
                id="portfolio"
                type="url"
                placeholder="https://yourportfolio.com"
                value={formData.portfolioLink}
                onChange={(value)=>setFormData({...formData,portfolioLink:value})}
              />
              <ErrorMessage error={formError.portfolioLinkError}/>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-center mt-4">
            <input
              id="terms"
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400  border-gray-300 rounded focus:ring-indigo-500"
              required
            />
            <label
              htmlFor="terms"
              className="ml-2 text-sm text-gray-600 dark:text-gray-400"
            >
              By signing up, I agree with the &nbsp;
              <a
                href="/terms"
                className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500"
              >
                Terms of Use 
              </a>
             &nbsp; and &nbsp;
              <a
                href="/privacy"
                className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Sign up button */}
          <button
            type="submit"
            disabled={!agree||loading}
            onClick={handleSubmit}
            className={`w-full py-2 px-4 rounded-md font-semibold transition  disabled:opacity-50  ${
              agree
                ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:cursor-pointer "
                : "bg-gray-400 cursor-not-allowed text-gray-200"
            }`}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account? &nbsp;
          <Link
            to="/auth"
            className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500 "
          >
            Sign in
          </Link>
        </p>
         <p className="text-center text-sm text-gray-400 mt-2">
            Want to become an Learner? &nbsp;
            <Link to="/auth/learner-register" className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-500">
              Create an account
            </Link>
           </p>
    </MotionDiv>
      </div>
  );
}
