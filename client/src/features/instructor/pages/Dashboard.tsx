
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Dummy chart data
const data = [
  { name: "10", students: 380 },
  { name: "20", students: 360 },
  { name: "30", students: 330 },
  { name: "40", students: 500 },
  { name: "50", students: 250 },
  { name: "60", students: 380 },
  { name: "70", students: 400 },
  { name: "80", students: 190 },
  { name: "90", students: 480 },
  { name: "100", students: 150 },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Header */}
      <div className="bg-indigo-600 px-8 py-6 rounded-b-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 className="text-white text-2xl font-bold">
              Welcome back, Emily Carter!
            </h1>
            <div className="flex gap-3 mt-4">
              <button className="bg-white text-indigo-600 px-5 py-2 rounded-lg shadow hover:bg-indigo-50 transition">
                Create New Course
              </button>
              <button className="bg-indigo-500 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-400 transition">
                View My Courses
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-5 md:mt-0">
            <div className="bg-indigo-500 text-white px-6 py-4 rounded-xl text-center shadow">
              <p className="text-lg font-semibold">13</p>
              <p className="text-sm opacity-80">Total Published Courses</p>
            </div>
            <div className="bg-indigo-500 text-white px-6 py-4 rounded-xl text-center shadow">
              <p className="text-lg font-semibold">450</p>
              <p className="text-sm opacity-80">Active Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students Summary */}
      <div className="px-8 mt-8">
        <h2 className="text-lg font-semibold mb-4">Students Summary</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg p-6 shadow hover:shadow-md transition">
            <p className="text-2xl font-bold text-indigo-600">1,200</p>
            <p className="text-gray-600">Total Enrolled Students</p>
          </div>
          <div className="bg-white border rounded-lg p-6 shadow hover:shadow-md transition">
            <p className="text-2xl font-bold text-pink-500">150</p>
            <p className="text-gray-600">New Enrollments This Month</p>
          </div>
          <div className="bg-white border rounded-lg p-6 shadow hover:shadow-md transition">
            <p className="text-2xl font-bold text-green-500">85%</p>
            <p className="text-gray-600">Retention Rate (Last 3 Months)</p>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="px-8 mt-10">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Performance Overview</h2>
          <a href="#" className="text-indigo-600 text-sm hover:underline">
            View Detail
          </a>
        </div>
        <div className="bg-white border rounded-lg shadow p-6 mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="#6366F1" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Published Courses */}
      <div className="px-8 mt-10 mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Top Published Course</h2>
          <a href="#" className="text-indigo-600 text-sm hover:underline">
            View More
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-5">
          {/* Course Card */}
          {[
            {
              title: "Advanced Digital Marketing",
              img: "https://via.placeholder.com/400x250",
            },
            {
              title: "Social Media Strategy",
              img: "https://via.placeholder.com/400x250",
            },
            {
              title: "Branding & Positioning",
              img: "https://via.placeholder.com/400x250",
            },
          ].map((course, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-4"
            >
              <img
                src={course.img}
                alt={course.title}
                className="rounded-lg w-full h-40 object-cover"
              />
              <h3 className="text-base font-semibold mt-3">{course.title}</h3>
              <div className="text-sm text-gray-500 mt-1">
                ⭐ 4.5 (123) • Students Enrolled: 350
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Last Updated: <span className="font-semibold">Sep 28, 2024</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
