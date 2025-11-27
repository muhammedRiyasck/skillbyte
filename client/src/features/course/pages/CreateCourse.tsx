import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import TextInput from "@shared/ui/TextInput";
import AboutCourseField from "../components/DynamicField";
import TagsInput from "../components/TagsInput";
import ErrorMessage from "@shared/ui/ErrorMessage";
import { validateCreateCourse } from "../validation/BaseCourseValidation";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@core/router/paths";
import Spiner from "@shared/ui/Spiner";
import CropImageModal from "@shared/ui/CropImageModal";
import getCroppedImg from "@shared/utils/GetCroppedImg";
import useCreateCourse from "../hooks/useCreateCourse";

type FormData = {
  title: string;
  subText: string;
  category: string;
  customCategory: string;
  courseLevel: string;
  language: string;
  access: string;
  price: string;
  description: string;
  tags: string[];
  features: string[];
  thumbnailFile: File | null;
};

const CreateCourse = () => {
  const navigate = useNavigate();
  const [spining, setSpining] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [thumbnail, setThumbnail] = useState("");

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      subText: "",
      category: "",
      customCategory: "",
      courseLevel: "",
      language: "",
      access: "",
      price: "",
      description: "",
      tags: [],
      features: [""] as string[],
      thumbnailFile: null,
    },
       resolver: async (data) => {
      const validationErrors = validateCreateCourse({ ...data });
      const fieldErrors: Record<string, { type: string; message: string }> = {};

      Object.keys(validationErrors).forEach((key) => {
        if (!validationErrors[key].success) {
          fieldErrors[key] = { type: "manual", message: validationErrors[key].message };
        }
      });

      return {
        values: fieldErrors.length ? {} : data,
        errors: fieldErrors,
      };
    },
  });

  const watchedCategory = watch("category");
  
  const Category = ["Marketing", "Programming", "Designing", "Business", "Other"];
  
  const Levels = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Beginner - Intermediate",
    "Intermediate - Advanced",
    "All Level",
  ];
  
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValue("thumbnailFile", file, { shouldValidate: true });
      setIsCropOpen(true);
    }
  };
  
  const thumbnailFile = watch("thumbnailFile");
  const handleCropComplete = async (croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    if (!thumbnailFile || !croppedAreaPixels) return;

  if (thumbnailFile?.size > 2 * 1024 * 1024) {
      toast.error("Thumbnail must be less than 2 MB");
      return;
  }
    const croppedBlob = await getCroppedImg(URL.createObjectURL(thumbnailFile), croppedAreaPixels);
    setThumbnail(URL.createObjectURL(croppedBlob));
    setCroppedBlob(croppedBlob);
  };

  const createCourse = useCreateCourse();

  const onSubmit = async (data: FormData) => {
    if (croppedBlob && thumbnailFile) {
    try {
      setSpining(true);
      const  courseId  = await createCourse({ formData: data, croppedBlob, thumbnailFile });
      navigate(ROUTES.instructor.uploadCourseContent, { state: { courseId } });
      toast.success("Course created successfully!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Something went wrong");
      } else {
        toast.error("Something went wrong");
      }
  } finally {
    setSpining(false);
  }
  } else {
    toast.error("Please select a thumbnail");
  }
};
  return (
    
    <div className="min-h-screen flex flex-col ">
      
      {spining && <Spiner />}

      {/* Top Navigation */}
      <div className="bg-gray-200 dark:bg-gray-700  px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Create Course</h1>
        <button className="border border-gray-300 text-center w-48 rounded-lg px-5 py-2 dark:text-gray-300 shadow-lg cursor-pointer bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500">
          Save as Draft
        </button>
      </div>

      <div className="flex-col bg-white dark:bg-gray-800 min-h-screen">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={` lg:w-4/6 rounded-lg shadow-2xl p-6 m-6 mx-auto  dark:bg-gray-700 dark:text-gray-100 dark:border ${
            Object.keys(errors).length > 0 ? "border border-red-600" : ""
          } `}
        >
          <h2 className="text-lg font-semibold mb-6">Basics</h2>

          {/* Thumbnail */}
          <div className="mb-6">
            {thumbnailFile && (
              <CropImageModal
                isOpen={isCropOpen}
                onClose={() => setIsCropOpen(false)}
                file={thumbnailFile}
                onCropComplete={handleCropComplete}
              />
            )}

            <label className="block text-gray-700 mb-2 dark:text-white">Thumbnail</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center">
              {thumbnail ? (
                <img src={thumbnail} alt="thumbnail" className="rounded-lg w-64 h-40 object-cover mb-3" />
              ) : (
                <p className="text-gray-400">No image selected</p>
              )}
              <div className="flex gap-3 mt-2">
                <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  Change
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                </label>
                {thumbnail && (
                  <button
                    onClick={() => {
                      setThumbnail("");
                      setValue("thumbnailFile", null, { shouldValidate: true }); // ✅ also clears validation

                      setCroppedBlob(null);
                    }}
                    className="cursor-pointer border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
           {errors.thumbnailFile?.message && <ErrorMessage error={errors.thumbnailFile.message} />}
          </div>

          {/* Two Column Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Title */}
            <div>
              <label className="block text-gray-700 dark:text-white mb-2">Course Title</label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="title"
                    type="text"
                    placeholder="Enter course title"
                    className="dark:border-white"
                  />
                )}
              />
              {errors.title?.message && <ErrorMessage error={errors.title.message} />}
            </div>

            {/* Short Sentence */}
            <div>
              <label className="block text-gray-700 dark:text-white mb-2">Short Sentence (below Title)</label>
              <Controller
                name="subText"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    id="subtext"
                    rows={2}
                    placeholder="Enter short sentence"
                    className="w-full border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                )}
              />
              {errors.subText?.message && <ErrorMessage error={errors.subText.message} />}
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-700 mb-2 dark:text-white">Course Category</label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value || ""}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  >
                    <option disabled value="">
                      Select Category
                    </option>
                    {Category.map((cat, index) => (
                      <option key={index} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              />
              {watchedCategory === "Other" && (
                <Controller
                  name="customCategory"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      id="custom_input"
                      type="text"
                      placeholder="Enter custom category"
                      className="mt-4 dark:border-white"
                    />
                  )}
                />
              )}
              {errors.category?.message && <ErrorMessage error={errors.category.message} />}
              {errors.customCategory?.message&& <ErrorMessage error={errors.customCategory.message} />}
            </div>

            {/* Course Level */}
            <div>
              <label className="block text-gray-700 mb-2 dark:text-white">Course Level</label>
              <Controller
                name="courseLevel"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value || ""}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  >
                    <option disabled value="">
                      Select Level
                    </option>
                    {Levels.map((level, index) => (
                      <option key={index} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.courseLevel?.message && <ErrorMessage error={errors.courseLevel.message} />}
            </div>

            {/* Language */}
            <div>
              <label className="block text-gray-700 mb-2 dark:text-white">Language</label>
              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value || ""}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  >
                    <option disabled value="">
                      Select Language
                    </option>
                    <option value="English">English</option>
                  </select>
                )}
              />
              {errors.language?.message && <ErrorMessage error={errors.language.message} />}
            </div>

            {/* Access */}
            <div>
              <label className="block text-gray-700 mb-2 dark:text-white">Course Access Duration</label>
              <Controller
                name="access"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value || ""}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  >
                    <option disabled value="">
                      Select Duration
                    </option>
                    <option value="Life Time Access">Life Time Access</option>
                    <option value="1-Year Access">1-Year Access</option>
                    <option value="6-Month Access">6-Month Access</option>
                  </select>
                )}
              />
              {errors.access?.message && <ErrorMessage error={errors.access.message} />}
            </div>

            {/* Price */}
            <div>
              <label className="block text-gray-700 mb-2 dark:text-white">Course Price</label>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="price"
                    type="text"
                    placeholder="Enter Price"
                    className="dark:border-white"
                  />
                )}
              />
              {errors.price?.message && <ErrorMessage error={errors.price.message} />}
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2 dark:text-white">Tags</label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagsInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Add tags (e.g., #javascript, #react, #webdev)"
                    className="dark:bg-gray-700"
                  />
                )}
              />
              {errors.tags?.message && <ErrorMessage error={errors.tags.message} />}
            </div>
          </div>

          {/* About Course */}
          <div className="mt-6">
            <label className="block text-gray-700 dark:text-white mb-2">About This Course (features)</label>
            <AboutCourseField
              control={control}
              name="features"
              placeholder="point"
            />
            {errors.features?.message && <ErrorMessage error={errors.features.message} />}
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
            <div>
              <label className="block text-gray-700 mb-2 dark:text-white">Description</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={5}
                    placeholder="Write course description..."
                    className="w-full border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                )}
              />
            </div>
            {errors.description?.message && <ErrorMessage error={errors.description.message} />}
          </div>

          {/* Next Button */}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              className={`bg-indigo-600 text-white rounded-lg px-6 py-2 hover:bg-indigo-700 transition cursor-pointer ${
                Object.keys(errors).length > 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Next →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
