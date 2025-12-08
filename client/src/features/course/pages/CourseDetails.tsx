import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import default_profile from '@assets/default_profile.svg';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Clock,
  Users,
  Play,
  FileText,
  ChevronDown,
  ChevronRight,
  Award,
  CheckCircle,
  Globe,
  Loader2,
  Home,
  BookOpen
} from 'lucide-react';
import { ROUTES } from '@/core/router/paths';
import { getCourseDetails } from '../services/CourseDetails';
import { blockLesson } from '../services/CourseLesson';

import ErrorPage from '@shared/ui/ErrorPage';
import type {ModuleType} from '../types/IModule';
import { useSelector } from 'react-redux';
import type { RootState } from '@/core/store/Index';
import ToggleSwitch from '@/shared/ui/ToggleSwitch';

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [blockedLessons, setBlockedLessons] = useState<Set<string>>(new Set());

  const role = useSelector((state:RootState) => state.auth.user?.role);
  const navigate = useNavigate();

  const { data: courseData, isLoading, isError, error } = useQuery({
    queryKey: ['courseDetails', courseId, role],
    queryFn: () => getCourseDetails(courseId!),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });

  const course = courseData?.data;
  console.log('Course Data:', course);

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleEnroll = () => {
    if (!role) {
        navigate(ROUTES.auth.signIn); 
        return;
    }
    navigate(ROUTES.student.checkout.replace(':courseId', courseId!));
  };

  const handleBlockLesson = async (lessonId: string) => {
    console.log('Toggling block for lesson:', lessonId);
    const isCurrentlyBlocked = blockedLessons.has(lessonId);
    const newBlockedStatus = !isCurrentlyBlocked;

    try {
      await blockLesson(lessonId, newBlockedStatus);
      const newBlocked = new Set(blockedLessons);
      if (newBlockedStatus) {
        newBlocked.add(lessonId);
      } else {
        newBlocked.delete(lessonId);
      }
      setBlockedLessons(newBlocked);
    } catch (error) {
      console.error('Failed to block/unblock lesson:', error);
      // You might want to show a toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ErrorPage
          message={(error as Error)?.message || 'This course currently unavailable.'}
          statusCode={500}
        />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">Course not found</p>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((acc: number, mod:ModuleType) => acc + (mod.lessons?.length || 0), 0) || 0;
  const totalDuration = course.modules?.reduce((acc: number, mod:ModuleType) =>
    acc + (mod.lessons?.reduce((lessonAcc: number, les) => lessonAcc + (les.duration || 0), 0) || 0), 0
  ) || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumbs and Back Button */}
      <div className=" md:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl px-4 sm:px-6 xl:px-8 py-4">
          <div className=" flex items-start justify-start">
          
            <nav className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-lg shadow-sm">
              <Link to={ROUTES.root} className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-gray-200 transition-colors">
                <Home className="w-4 h-4" />
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400 " />
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-gray-200 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                Courses
              </button>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-semibold truncate max-w-xs">
                {course.title}
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r bg-gray-800  text-white">
    
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
        
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {course.category}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {course.courseLevel}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-indigo-100 mb-6">{course.subText}</p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-indigo-200">(1250 reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>15420 students</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={course.instructor?.avatar || default_profile }
                  alt={course.instructor?.name || 'Instructor'}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold">{course.instructor?.name || 'John Smith'}</p>
                  <p className="text-indigo-200">{course.instructor?.title || 'Senior Web Developer'}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Last updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{course.language}</span>
                </div>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <img
                  src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop'}
                  alt={course.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-bold text-gray-900">
                      ₹{course.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 line-through">
                      ₹{Math.round(course.price * 1.5)}
                    </div>
                  </div>

                  <button
                    onClick={handleEnroll}
                    className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Enroll Now
                  </button>

                  <div className="mt-4 text-center text-sm text-gray-600">
                    Lifetime Access
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                What you'll learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Course content
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {course.modules?.length || 0} modules • {totalLessons} lessons • {totalDuration} min
                </div>
              </div>

              <div className="space-y-4">
                {course.modules?.map((module) => (
                  <div key={module.moduleId} className="border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer">
                    <button
                      onClick={() => toggleModule(module.moduleId)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {module.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {module.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {module.lessons?.length || 0} lessons
                        </span>
                        {expandedModules.has(module.moduleId) ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </button>

                    {expandedModules.has(module.moduleId) && (

                      <div className="border-t border-gray-200 dark:border-gray-700 ">
                        {module.lessons?.map((lesson) => (
                        
                          ((lesson.isBlocked && role === 'admin') || !lesson.isBlocked)?<div
                            key={lesson.lessonId}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.contentType === 'video' ? (
                                <Play className="w-4 h-4 text-gray-500" />
                              ) : (
                                <FileText className="w-4 h-4 text-gray-500" />
                              )}
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {lesson.title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {lesson.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              {lesson.isFreePreview && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                  Preview
                                </span>
                              )}
                              <span>{lesson.duration} min</span>
                              {role === 'admin' && (
                                <ToggleSwitch
                                  checked={blockedLessons.has(lesson.lessonId)}
                                  onChange={() => handleBlockLesson(lesson.lessonId)}
                                  label='Block'
                                />
                              )}
                            </div>
                          </div>: <p className="text-red-500 font-semibold text-center p-4">This lesson is removed currently.</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Description
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {course.description}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  This course is designed for complete beginners who want to learn web development from scratch.
                  We'll start with the fundamentals and gradually build up to more advanced concepts.
                </p>
              </div>
            </div>

            {/* Instructor */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Your Instructor
              </h2>
              <div className="flex items-start gap-4">
                <img
                  src={course.instructor?.avatar}
                  alt={course.instructor?.name || 'Instructor'}
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {course.instructor?.name }
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {course.instructor?.title }
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {course.instructor?.bio }
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Course Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                This course includes
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {totalDuration} minutes of video content
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Downloadable resources
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Certificate of completion
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Access on mobile and desktop
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {course.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
