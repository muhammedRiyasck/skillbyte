import  { useState } from "react";
import { Link } from "react-router-dom";

import ErrorMessage from "../../../shared/ui/ErrorMessage";
import MotionDiv from "../../../shared/ui/MotionDiv";
import TextInput from "../../../shared/ui/TextInput";
import ShowPassword from "../components/ShowPassword";

export default function InstructorSignup () {
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



  const [customJobTitle, setCustomJobTitle] = useState("");
  const [isOtherTitleSelected, setIsOtherTitleSelected] = useState(false);

  const [customSubject , setCustomSubject] = useState('')
  const [isOtherSubjectSelected, setOtherSubjectSelected] = useState(false)

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

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();



    const finalJobTitle = formData.jobTitle === "Other" ? customJobTitle : formData.jobTitle;

    if (formData.jobTitle === "Other" && !customJobTitle.trim()) {
      alert("Please enter your custom job title.");
      return;
    }

    console.log("Selected Job Title:", finalJobTitle);
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 ">
      <MotionDiv className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 my-12">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
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
              setValue={(value)=>setFormData({...formData,fullName:value})}
            />
            <ErrorMessage error={'something went wrong'}/>
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
              setValue={(value)=>setFormData({...formData,email:value})}
              
            />
            <ErrorMessage error={'something went wrong'}/>

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
              setValue={(value)=>setFormData({...formData,password:value})}
              showPassword={showPassword}
              icon={()=><ShowPassword  showPassword={showPassword} setShowPassword={(value:boolean)=>setShowPassword(value)} />}
              
            />
              <ErrorMessage error={'something went wrong'}/>

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
                setValue={(value)=>setFormData({...formData,confirmPassword:value})}
                showPassword={showPassword}
              
              />
                 <ErrorMessage error={'something went wrong'}/>

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
              Subject(s) You Want to Teach
            </label>
            <select
              id="subjects"
              value={formData.subject}
              onChange={handleSubjectChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500  dark:bg-gray-700 dark:text-white"
            >
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
                className="border border-gray-300 rounded-lg p-2 my-3  dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                maxLength={50}
              />
            )}


             <ErrorMessage error={'something went wrong'}/>

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
              className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
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
                      className="border border-gray-300 rounded-lg p-2 my-3 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      maxLength={50}
                    />
                  )}

              <ErrorMessage error={'something went wrong'}/>

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
                setValue={(value)=>setFormData({...formData,experience:value})}
              />
              <ErrorMessage error={'something went wrong'}/>
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
                setValue={(value)=>setFormData({...formData,socialMediaLink:value})}  
                />
              <ErrorMessage error={'something went wrong'}/>
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
                setValue={(value)=>setFormData({...formData,portfolioLink:value})}
              />
              <ErrorMessage error={'something went wrong'}/>
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
              By signing up, I agree with the{" "}
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
            disabled={!agree}
            className={`w-full py-2 px-4 rounded-md font-semibold transition  ${
              agree
                ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:cursor-pointer"
                : "bg-gray-400 cursor-not-allowed text-gray-200"
            }`}
          >
            Sign up
          </button>
        </form>

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account? &nbsp;
          <Link
            to="/auth/login"
            className="text-indigo-600 dark:text-indigo-400  hover:text-indigo-200 "
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
