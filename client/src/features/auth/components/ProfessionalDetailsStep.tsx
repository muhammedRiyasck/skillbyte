import { ErrorMessage, Modal, TextInput } from "@shared/ui";
import { useResumeUpload } from "../hooks/useResumeUpload";
import { useFormContext } from "react-hook-form";
import { isValidSubject, isValidJobTitle, isValidExperience, isValidSocialMedia, isValidPortfolio, isValidBio, isValidResume } from "../InstructorValidation";

interface ProfessionalDetailsStepProps {
  subjectOptions: string[];
  jobTitleOptions: string[];
}

export default function ProfessionalDetailsStep({
  subjectOptions,
  jobTitleOptions,
}: ProfessionalDetailsStepProps) {
  const { register, setValue, formState: { errors }, watch } = useFormContext();
  const watchedValues = watch();
  const { isModalOpen, openModal, closeModal } = useResumeUpload();
  const subject = watch("subject");
  const jobTitle = watch("jobTitle");
  const customSubject = watch("customSubject");
  const customJobTitle = watch("customJobTitle");

  return (
    <>
      {/* Professional Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Professional Details
        </h3>
        {/* Resume */}
        <div>
          <label
            htmlFor="resume"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Resume <span className="text-red-500">*</span>
          </label>
          {!watchedValues.resume && <div className="mt-1">
            <label
              htmlFor="resume"
              className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-gray-50 dark:bg-gray-700"
            >
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {watchedValues.resume ? 'Change file' : 'Click to upload'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">PDF, DOC, DOCX up to 10MB</p>
              </div>
            </label>
            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              {...register("resume", {
                required: "Resume is required",
                validate: (value) => {
                  const result = isValidResume(value);
                  return result.success || result.message;
                },
              })}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setValue("resume", file);
              }}
              className="hidden"
            />
          </div>}
          {watchedValues.resume && (
            <div className="flex items-center justify-between mt-2 p-6 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {watchedValues.resume.name} ({(watchedValues.resume.size / 1024).toFixed(2)} KB)
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={openModal}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium cursor-pointer"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => setValue("resume", null)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
          <ErrorMessage error={errors.resume?.message as string} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="subjects"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Subject You Want to Teach
            </label>
            <select
              id="subjects"
              {...register("subject", {
                required: "Subject is required",
                validate: (value) => {
                  const result = isValidSubject(value, customSubject);
                  return result.success || result.message;
                }
              })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
            >
              <option disabled value="">
                Select a subject
              </option>
              {subjectOptions.map((subject, index) => (
                <option key={index} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            {subject === "Other" && (
              <TextInput
                id="customSubject"
                type="text"
                placeholder="Enter your Subject"
                {...register("customSubject", { required: "Custom subject is required" })}
                className="my-3"
                maxLength={50}
              />
            )}
            <ErrorMessage error={(errors.subject?.message || errors.customSubject?.message || "") as string} />
          </div>

          <div>
            <label
              htmlFor="jobTitle"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Job Title
            </label>
            <select
              id="jobTitle"
              {...register("jobTitle", {
                required: "Job title is required",
                validate: (value) => {
                  const result = isValidJobTitle(value, customJobTitle);
                  return result.success || result.message;
                }
              })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
            >
              <option disabled value="">
                Select a job title
              </option>
              {jobTitleOptions.map((job, index) => (
                <option key={index} value={job}>
                  {job}
                </option>
              ))}
            </select>
            {jobTitle === "Other" && (
              <TextInput
                id="customJobTitle"
                type="text"
                placeholder="Enter your job title"
                {...register("customJobTitle", { required: "Custom job title is required" })}
                className="my-3"
                maxLength={50}
              />
            )}
            <ErrorMessage error={(errors.jobTitle?.message || errors.customJobTitle?.message || "") as string} />
          </div>
        </div>
        {/* Experience */}
        <div>
          <label
            htmlFor="experience"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Years of Experience
          </label>
          <input
            id="experience"
            type="number"
            placeholder="e.g. 5"
            {...register("experience", {
              required: "Experience is required",
              validate: (value) => {
                const result = isValidExperience(value);
                return result.success || result.message;
              }
            })}
            className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
          />
          <ErrorMessage error={(errors.experience?.message || "") as string} />
        </div>

        {/* Bio */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Bio <span className="text-red-500">*</span>
          </label>
          <textarea
            id="bio"
            placeholder="Tell us about yourself..."
            {...register("bio", {
              required: "Bio is required",
              validate: (value) => {
                const result = isValidBio(value);
                return result.success || result.message;
              }
            })}
            className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white resize-none"
            rows={4}
            maxLength={500}
          />
          <ErrorMessage error={(errors.bio?.message || "") as string} />
        </div>

        {/* LinkedIn */}
        <div>
          <label
            htmlFor="linkedin"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Professional Profile (LinkedIn, X, Twitter) <span className="text-red-500">*</span>
          </label>
          <input
            id="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            {...register("socialMediaLink", {
              required: "Social media link is required",
              validate: (value) => {
                const result = isValidSocialMedia(value);
                return result.success || result.message;
              }
            })}
            className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
          />
          <ErrorMessage error={(errors.socialMediaLink?.message || "") as string} />
        </div>

        {/* Portfolio */}
        <div>
          <label
            htmlFor="portfolio"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Portfolio / Website (Optional)
          </label>
          <input
            id="portfolio"
            type="url"
            placeholder="https://yourportfolio.com"
            {...register("portfolioLink", {
              validate: (value) => {
                if (!value) return true;
                const result = isValidPortfolio(value);
                return result.success || result.message;
              }
            })}
            className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
          />
          <ErrorMessage error={(errors.portfolioLink?.message || "") as string} />
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-2">
          <input
            id="agree"
            type="checkbox"
            {...register("agree", { required: "You must agree to the terms and conditions" })}
            className="mt-1  text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label
            htmlFor="agree"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            I agree to the &nbsp;
            <a
              href="#"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              Terms and Conditions
            </a>
            and
            <a
              href="#"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              Privacy Policy
            </a>
          </label>
        </div>
        <ErrorMessage error={(errors.agree?.message || "") as string} />

      </div>

      {/* Modal for Resume Preview */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Resume Preview</h3>
          {watchedValues.resume && (
            watchedValues.resume.name.endsWith('.pdf') ? (
              <object
                data={URL.createObjectURL(watchedValues.resume)}
                type="application/pdf"
                width="100%"
                height="600"
                className="border rounded"
              >
                <p>Your browser does not support previewing PDF files. <a href={URL.createObjectURL(watchedValues.resume)} download={watchedValues.resume.name}>Download to view</a></p>
              </object>
            ) : (
              <div className="text-center">
                <p className="mb-4">Preview not available for this file type ({watchedValues.resume.name.split('.').pop()?.toUpperCase()}).</p>

              </div>
            )
          )}
        </div>
      </Modal>
    </>
  );
}
