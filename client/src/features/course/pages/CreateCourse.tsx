import React, { useState } from "react";
import TextInput from "../../../shared/ui/TextInput";
import AboutCourseField from "../components/DynamicField";
import ErrorMessage from "../../../shared/ui/ErrorMessage";
import { validateCreateCourse } from "../validation/BaseCourseValidation"
import { createBase } from "../services/CreateBase";
import api from "../../../shared/utils/AxiosInstance";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Spiner from "../../../shared/ui/Spiner";

const CreateCourse = () => {
  const navigate = useNavigate()
  const [spining,setSpining] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    thumbnail: '',
    title: "",
    subText: "",
    category: "",
    otherCategory: false,
    customCategory: "",
    courseLevel: "",
    language: "",
    access: "",
    price: "",
    description: "",
    tags: "",
    features: [''] as string[],
  });

  const [errors, setErrors] = useState<Record<string, { success: boolean; message: string }>>({});

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
      setThumbnailFile(file);
      setFormData((prev) => ({
        ...prev,
        thumbnail: URL.createObjectURL(file),
      }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      category: value,
      otherCategory: value === "Other",
      customCategory: value === "Other" ? prev.customCategory : ""
    }));
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateCreateCourse(formData);
    setErrors(validationErrors);

     if (Object.keys(validationErrors).length === 0) {
    
    const response = await createBase({...formData,thumbnail:null});
     
    if (thumbnailFile) {
      const photo = new FormData();
      photo.append('thumbnail', thumbnailFile);
      try {
        setSpining(true)
        const success = await api.post(`/course/upload-thumbnail/${response.course.id}`, photo);
        toast.success(success.data.message)
        navigate('/')
      } catch (error) {
        toast.error('Something Went Wrong! Try Again Later')
        throw error
      }finally{
        setSpining(false)
      }
    }
  }
     
  };

  return (
    <div className="min-h-screen flex flex-col">
      {spining && Spiner()}
      {/* Top Navigation */}
      <div className="dark:bg-gray-700 shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Create Course</h1>
        <button className="border dark:text-white border-gray-300 rounded-lg px-5 py-2 text-gray-600 hover:bg-gray-100 transition">
          Save as Draft
        </button>
      </div>

      <div className="flex-col bg-white dark:bg-gray-800">
        <form
          onSubmit={handleSubmit}
          className={`w-5/6 rounded-lg shadow p-6 m-6 mx-auto dark:bg-gray-700 dark:text-gray-100 dark:border ${Object.keys(errors).length>0 ?"border border-red-600":''} `}
        >
          <h2 className="text-lg font-semibold mb-6">Basics</h2>

          {/* Thumbnail */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 dark:text-white">Thumbnail</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center">
              {formData.thumbnail ? (
                <img
                  src={formData.thumbnail}
                  alt="thumbnail"
                  className="rounded-lg w-64 h-40 object-cover mb-3"
                />
              ) : (
                <p className="text-gray-400">No image selected</p>
              )}
              <div className="flex gap-3 mt-2">
                <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  Change
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                </label>
                {formData.thumbnail && (
                  <button
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, thumbnail: '' }));
                      setThumbnailFile(null);
                    }}
                    className="cursor-pointer border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            {errors.thumbnail && <ErrorMessage error={errors.thumbnail.message} />}
          </div>

          {/* Two Column Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Title */}
            <div>
              <label className="block text-gray-700 dark:text-white mb-2">Course Title</label>
              <TextInput
                id="title"
                type="text"
                placeholder="Enter course title"
                value={formData.title}
                setValue={(val) => setFormData((prev) => ({ ...prev, title: val }))}
                className="dark:border-white"
              />
              {errors.course && <ErrorMessage error={errors.course.message} />}
            </div>

            {/* Short Sentence */}
            <div>
              <label className="block text-gray-700 dark:text-white mb-2">Short Sentence (below Title)</label>
              <TextInput
                id="subtext"
                type="text"
                placeholder="Enter short sentence"
                value={formData.subText}
                setValue={(val) => setFormData((prev) => ({ ...prev, subText: val }))}
                className="dark:border-white"
              />
              {errors.shortSEntence && <ErrorMessage error={errors.shortSEntence.message} />}
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-700 mb-2 dark:text-white">Category</label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
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
              {formData.otherCategory && (
                <TextInput
                  id="custom_input"
                  type="text"
                  placeholder="Enter custom category"
                  value={formData.customCategory}
                  setValue={(val) => setFormData((prev) => ({ ...prev, customCategory: val }))}
                  className="mt-4 dark:border-white"
                />
              )}
              {errors.category && <ErrorMessage error={errors.category.message} />}
              {errors.customCategory && <ErrorMessage error={errors.customCategory.message} />}
            </div>

            {/* Course Level */}
            <div>
              <label className="block text-gray-700 mb-2 dark:text-white">Course Level</label>
              <select
                value={formData.courseLevel}
                onChange={(e) => setFormData((prev) => ({ ...prev, courseLevel: e.target.value }))}
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
              {errors.courseLevel && <ErrorMessage error={errors.courseLevel.message} />}
            </div>

            {/* Language */}
            <div>
              <label className="block text-gray-700 mb-2 dark:text-white">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
              >
                <option disabled value="">
                  Select Language
                </option>
                <option value="english">English</option>
              </select>
              {errors.language && <ErrorMessage error={errors.language.message} />}
            </div>

            {/* Access */}
            <div>
              <label className="block text-gray-700 mb-2 dark:text-white">Course Access Duration</label>
              <select
                value={formData.access}
                onChange={(e) => setFormData((prev) => ({ ...prev, access: e.target.value }))}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
              >
                <option disabled value="">
                  Select Duration
                </option>
                <option value="Life Time Access">Life Time Access</option>
                <option value="1-Year Access">1-Year Access</option>
                <option value="6-Month Access">6-Month Access</option>
              </select>
              {errors.access && <ErrorMessage error={errors.access.message} />}
            </div>

            {/* Price */}
            <div>
              <label className="block text-gray-700 mb-2 dark:text-white">Course Price</label>
              <TextInput
                id="price"
                type="text"
                placeholder="Enter Price"
                value={formData.price}
                setValue={(val) => setFormData((prev) => ({ ...prev, price: val }))}
                className="dark:border-white"
              />
              {errors.price && <ErrorMessage error={errors.price.message} />}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-gray-700 mb-2 dark:text-white">Tags</label>
              <TextInput
                id="tags"
                type="text"
                placeholder="#marketing #digitalstrategy"
                value={formData.tags}
                setValue={(val) => setFormData((prev) => ({ ...prev, tags: val }))}
                className="dark:border-white"
              />
              {errors.tags && <ErrorMessage error={errors.tags.message} />}
            </div>
          </div>

          {/* About Course */}
          <div className="mt-6">
            <label className="block text-gray-700 dark:text-white mb-2">
              About This Course (features)
            </label>
            <AboutCourseField
              points={formData.features}
              setPoints={(val: string[]) => setFormData((prev) => ({ ...prev, features: val }))}
            />
            {errors.features && <ErrorMessage error={errors.features.message} />}
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
            <div>
              <label className="block text-gray-700 mb-2 dark:text-white">Description</label>
              <textarea
                rows={5}
                placeholder="Write course description..."
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            {errors.description && <ErrorMessage error={errors.description.message} />}
          </div>

          {/* Next Button */}
          <div className="flex justify-end mt-8">
            <button
              
              type="submit"
              className={`bg-indigo-600 text-white rounded-lg px-6 py-2 hover:bg-indigo-700 transition cursor-pointer ${Object.keys(errors).length>0 ?"opacity-50 cursor-not-allowed":''}`}
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
