import React, { useState, useEffect } from 'react';
import { getInstructorEnrollments } from '../../enrollment/services/EnrollmentService';
import { toast } from 'sonner';
import Spiner from '@shared/ui/Spiner';
import { RefreshCw } from 'lucide-react';

// Types for the enrollment data
interface StudentEnrollment {
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrollmentDate: string;
  status: string;
  progress: number;
}

interface CourseEnrollments {
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
  coursePrice: number;
  enrollments: StudentEnrollment[];
}

const Dashboard: React.FC = () => {
  const [enrollments, setEnrollments] = useState<CourseEnrollments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInstructorEnrollments();
      console.log(data,'enrollment data');
      setEnrollments(data.enrollments);
    } catch {
      setError('Failed to load enrollment data');
      toast.error('Failed to load enrollment data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spiner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 dark:text-gray-50 mb-4">{error}</p>
          <button
            onClick={fetchEnrollments}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200 mb-2">Student Enrollments</h1>
            <p className="text-gray-600 dark:text-gray-300 ">View all student enrollments for your courses</p>
          </div>
          <button
             onClick={() => { fetchEnrollments(); toast.success('Dashboard refreshed'); }}
             disabled={loading}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors shadow-sm"
          >
             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
             Refresh
          </button>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-50 dark:text-gray-400 mb-2">No Enrollments Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 ">Students haven't enrolled in your courses yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {enrollments.map((course) => (
              <div key={course.courseId} className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Course Header */}
                <div className="bg-gradient-to-r from-gray-600 to-gray-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {course.courseThumbnail ? (
                        <img
                          src={course.courseThumbnail}
                          alt={course.courseTitle}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-bold">{course.courseTitle}</h2>
                        <p className="text-blue-100">${course.coursePrice}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{course.enrollments.length}</div>
                      <div className="text-blue-100">Students Enrolled</div>
                    </div>
                  </div>
                </div>

                {/* Students List */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold dark:text-gray-50 mb-4">Enrolled Students</h3>
                  <div className="space-y-4">
                    {course.enrollments.map((enrollment) => (
                      <div key={enrollment.studentId} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="font-medium text-gray-50">{enrollment.studentName}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-50">{enrollment.studentEmail}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(enrollment.status)}`}>
                              {enrollment.status}
                            </span>
                            <div className="text-sm text-gray-600 dark:text-gray-50">
                              Enrolled: {formatDate(enrollment.enrollmentDate)}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-50 mb-1">
                            <span>Progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${enrollment.progress === 100 ? 'bg-green-500' : 'bg-blue-600'} h-2 rounded-full transition-all duration-300`}
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
