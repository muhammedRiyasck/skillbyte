import React, { useState } from "react";

const CreateCourse = () => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(true);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-800">Create Course</h1>
        </div>
        <div className="flex gap-3">
          <button className="text-indigo-600 font-medium hover:underline">
            View as Students
          </button>
          <button className="border border-gray-300 rounded-lg px-5 py-2 text-gray-600 hover:bg-gray-100 transition">
            Save as Draft
          </button>
          <button className="bg-indigo-600 text-white rounded-lg px-5 py-2 hover:bg-indigo-700 transition">
            Publish Course
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-60 bg-white border-r">
          <ul className="p-6 space-y-4 text-gray-700">
            {["Basics", "Modules", "Announcements", "Schedule Session (1on1)"].map(
              (step, index) => (
                <li
                  key={index}
                  className={`cursor-pointer font-medium ${
                    index === 0
                      ? "text-indigo-600 border-l-4 border-indigo-600 pl-2"
                      : "hover:text-indigo-500"
                  }`}
                >
                  {step}
                </li>
              )
            )}
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg shadow p-6 m-6">
          <h2 className="text-lg font-semibold mb-6">Basics</h2>

          {/* Thumbnail Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Thumbnail</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt="thumbnail"
                  className="rounded-lg w-64 h-40 object-cover mb-3"
                />
              ) : (
                <p className="text-gray-400">No image selected</p>
              )}
              <div className="flex gap-3 mt-2">
                <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                  />
                </label>
                {thumbnail && (
                  <button
                    onClick={() => setThumbnail(null)}
                    className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Two Column Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <label className="block text-gray-700 mb-2">Course Title</label>
              <input
                type="text"
                placeholder="Enter course title"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Category</label>
              <select className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Marketing</option>
                <option>Design</option>
                <option>Development</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Course Level</label>
              <select className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Language</label>
              <select className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Benefits for User</label>
              <select className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Life Time Access</option>
                <option>1-Year Access</option>
                <option>6-Month Access</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Course Price</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={isPaid}
                    onChange={() => setIsPaid(true)}
                  />
                  <span>Paid</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!isPaid}
                    onChange={() => setIsPaid(false)}
                  />
                  <span>Free</span>
                </div>
                {isPaid && (
                  <input
                    type="number"
                    placeholder="3000"
                    className="w-32 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Description & Instructor Bio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                rows={5}
                placeholder="Write course description..."
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Instructor Bio</label>
              <textarea
                rows={5}
                placeholder="Instructor's short bio..."
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mt-6">
            <label className="block text-gray-700 mb-2">Tags</label>
            <input
              type="text"
              placeholder="#marketing #digitalstrategy"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Next Button */}
          <div className="flex justify-end mt-8">
            <button className="bg-indigo-600 text-white rounded-lg px-6 py-2 hover:bg-indigo-700 transition">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;

