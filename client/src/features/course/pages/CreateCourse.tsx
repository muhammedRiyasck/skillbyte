import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import TextInput from "@shared/ui/TextInput";
import AboutCourseField from "../components/DynamicField";
import TagsInput from "../components/TagsInput";
import ErrorMessage from "@shared/ui/ErrorMessage";
import { validateCreateCourse } from "../validation/BaseCourseValidation";
import { toast } from "sonner";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@core/router/paths";
import Spiner from "@shared/ui/Spiner";
import CropImageModal from "@shared/ui/CropImageModal";
import getCroppedImg from "@shared/utils/GetCroppedImg";
import useCreateCourse from "../hooks/useCreateCourse";
import { getCourseDetails } from "../services/CourseDetails";
import { updateBase, uploadThumbnail, deleteCourse } from "../services/CourseBase";

import { QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient();

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
  thumbnailUrl?: string;
};

const CreateCourse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [spining, setSpining] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [thumbnail, setThumbnail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
    getValues,
    reset,
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
        if (!validationErrors["thumbnailFile"]?.success && thumbnail) {
          delete validationErrors["thumbnailFile"];
        }
        if (validationErrors[key]?.success === false) {
          fieldErrors[key] = { type: "manual", message: validationErrors[key]?.message };
        }
      });

      return {
        values: fieldErrors.length ? {} : data,
        errors: fieldErrors,
      };
    },
  });

  const watchedCategory = watch("category");

  if (watchedCategory !== "Other") {
    setValue("customCategory", "");
  }

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
      e.target.value = "";
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

  // Pre-fill form if courseId is in location.state
  const courseId = location.state?.courseId;
  const isDisabled = courseId && !isEditing;
  useEffect(() => {
    if (courseId) {
      getCourseDetails(courseId)
        .then((courseData) => {
          const course = courseData.data;
          const category = Category.includes(course.category) ? course.category : "Other";
          setThumbnail(course.thumbnailUrl || "");
          setValue("title", course.title || "");
          setValue("subText", course.subText || "");
          setValue("category", category || "");
          if (category === "Other") setValue("customCategory", course.category || "");
          setValue("courseLevel", course.courseLevel || "");
          setValue("language", course.language || "");
          setValue("access", course.duration || "");
          setValue("price", course.price + "" || "");
          setValue("description", course.description || "");
          setValue("tags", course.tags || []);
          setValue("features", course.features || [""]);
          setValue("thumbnailUrl", course.thumbnailUrl || "");
          // Store original data for reset
          setOriginalData(getValues());
          setIsEditing(false);
        })
        .catch((error) => {
          console.error("Failed to fetch course details:", error);
          toast.error("Failed to load course data");
        });
    }
  }, [location.state, setValue, getValues]);

  const createCourse = useCreateCourse();

  const onSubmit = async (data: FormData) => {
    if (courseId) return;
    if (croppedBlob && thumbnailFile) {
      try {
        setSpining(true);
        const courseId = await createCourse({ formData: data, croppedBlob, thumbnailFile });
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

  const handleDiscard = () => {
    if (originalData) {
      reset(originalData);
      setThumbnail(originalData.thumbnailUrl || "");
    }
    setIsEditing(false);
  };

  const handleChange = async (data: FormData) => {
    if (!courseId) return;
    try {
      setSpining(true);
      await updateBase(courseId, data);
      if (croppedBlob && thumbnailFile) {
        await uploadThumbnail({
          courseId,
          blob: croppedBlob,
          fileName: thumbnailFile.name,
        });
      }
      toast.success("Course updated successfully!");
      setIsEditing(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Something went wrong");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setSpining(false);
    }
  };

  const handleDelete = async () => {
    if (!courseId) return;

    const confirmed = window.confirm("Are you sure you want to delete this course permanently? This action cannot be undone.");
    if (!confirmed) return;

    try {
      setSpining(true);
      await deleteCourse(courseId);
      toast.success("Course deleted successfully!");
      navigate(ROUTES.instructor.myCourses);
      queryClient.invalidateQueries({ queryKey: ['instructorCourses'] });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to delete course");
      } else {
        toast.error("Failed to delete course");
      }
    } finally {
      setSpining(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col ">
      {spining && <Spiner />}

      {/* Top Navigation */}
      <div className="bg-gray-200 z-10 fixed w-full dark:bg-gray-700 p-6 flex justify-between items-center">
        <div className="flex flex-wrap items-center space-x-2">
          <Link
            to={ROUTES.instructor.myCourses}
            className="text-blue-600 hover:text-blue-800 font-bold dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            My Courses
          </Link>
          <span className="text-gray-500 dark:text-gray-400">{">"}</span>
          <span className="text-xl font-bold text-gray-800 dark:text-white">Create Course</span>
        </div>
      </div>
      <div className="flex-col pt-28 bg-white dark:bg-gray-800 min-h-screen">
          {courseId &&<button
              type="button"
              title="Delete this course permanently!!"
              className="cursor-pointer border border-gray-400 p-2 rounded-lg my-4 ml-3 "
              onClick={handleDelete}
            >
             🗑️ Delete  
          </button>}
        <form
          onSubmit={(e) => e.preventDefault()}
          className={` lg:w-4/6 rounded-lg shadow-2xl p-6 m-6 mx-auto  dark:bg-gray-700 dark:text-gray-100 dark:border ${
            Object.keys(errors).length > 0 ? "border border-red-600" : ""
          } `}
        >
          <div className="flex justify-between mb-6 ">
            <h2 className=" font-semibold text-lg">Basics</h2>
            {courseId && (
              <button onClick={() => setIsEditing(true)} className=" text-2xl cursor-pointer">
                &#128393;
              </button>
            )}
          </div>

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
                <label
                  className={`cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition ${
                    isDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                    disabled={isDisabled}
                  />
                </label>
                {thumbnail && (
                  <button
                    onClick={() => {
                      setThumbnail("");
                      setValue("thumbnailFile", null);
                      setCroppedBlob(null);
                    }}
                    className={`cursor-pointer border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition ${
                      isDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isDisabled}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            {errors.thumbnailFile?.message && <ErrorMessage error={errors.thumbnailFile.message} />}
            {/* {isEditing&&!thumbnail?'Thumbnail is requiredd':isEditing&&!thumbnail?errors.thumbnailFile?.message && <ErrorMessage error={errors.thumbnailFile.message} />:''} */}
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
                    disabled={isDisabled}
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
                    disabled={isDisabled}
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
                    disabled={isDisabled}
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
                      disabled={isDisabled}
                    />
                  )}
                />
              )}
              {errors.category?.message && <ErrorMessage error={errors.category.message} />}
              {errors.customCategory?.message && <ErrorMessage error={errors.customCategory.message} />}
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
                    disabled={isDisabled}
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
                    disabled={isDisabled}
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
                    disabled={isDisabled}
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
                    disabled={isDisabled}
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
                    disabled={isDisabled}
                  />
                )}
              />
              {errors.tags?.message && <ErrorMessage error={errors.tags.message} />}
            </div>
          </div>

          {/* About Course */}
          <div className="mt-6">
            <label className="block text-gray-700 dark:text-white mb-2">About This Course (features)</label>
            <AboutCourseField control={control} name="features" placeholder="point" isDisabled={isDisabled} />
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
                    disabled={isDisabled}
                  />
                )}
              />
            </div>
            {errors.description?.message && <ErrorMessage error={errors.description.message} />}
          </div>

          {/* Next Button */}
          <div className="flex justify-end mt-8 gap-4">
            {!courseId ? (
              <button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                className={`bg-indigo-600 text-white rounded-lg px-6 py-2 hover:bg-indigo-700 transition cursor-pointer ${
                  Object.keys(errors).length > 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Next →
              </button>
            ) : isEditing ? (
              <>
                <button
                  onClick={handleDiscard}
                  className="border border-gray-300 text-gray-400 px-6 py-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  Discard
                </button>
                <button
                  onClick={handleSubmit(handleChange)}
                  className={`bg-indigo-600 text-white rounded-lg px-6 py-2 hover:bg-indigo-700 transition cursor-pointer ${
                    Object.keys(errors).length > 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Change
                </button>
              </>
            ) : (
              // navigate to content upload page if courseId exists and not editing
              <Link
                to={ROUTES.instructor.uploadCourseContent}
                state={{ courseId }}
                className="bg-indigo-600 text-white rounded-lg px-6 py-2 hover:bg-indigo-700 transition cursor-pointer"
              >
                Next →
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
