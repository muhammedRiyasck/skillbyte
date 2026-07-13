import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Users, Play, BookOpen } from 'lucide-react';
import { ROUTES } from '@core/router/paths';
import type{ DashboardCourse } from '../../hooks/useInstructorDashboard';

interface EnrolledCoursesProps {
    itemVariants: Variants;
    courses: DashboardCourse[];
}

const EnrolledCourses: React.FC<EnrolledCoursesProps> = ({ itemVariants, courses }) => {
    return (
        <div className="mb-10">
            <motion.div 
                variants={itemVariants}
                className="flex justify-between items-center mb-8"
            >
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-center">Your Courses</h2>
                    <p className="text-slate-500 font-medium mt-1">Manage and track your educational content</p>
                </div>
                <Link to={ROUTES.instructor.myCourses} className="group flex items-center gap-2 text-sm font-black text-indigo-600 hover:gap-3 transition-all">
                    View All Assets <ArrowUpRight className="w-4 h-4" />
                </Link>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.length > 0 ? (
                    courses.slice(0, 3).map((course) => (
                        <motion.div
                            key={course.id}
                            variants={itemVariants}
                            whileHover={{ y: -10 }}
                            className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700/50 group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all"
                        >
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={course.courseThumbnail}
                                    alt={course.courseTitle}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black text-slate-900 dark:text-white border border-white/20 shadow-xl flex items-center gap-2">
                                    <Users className="w-3 h-3 text-indigo-600" />
                                    {course.enrollments.length} Students
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-6">
                                    <span className="text-white font-black text-xl tracking-tight">₹ {course.coursePrice}</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="font-black text-xl text-slate-900 dark:text-white mb-6 line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tighter">{course.courseTitle}</h3>
                                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-700/50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Status</span>
                                    </div>
                                    <Link
                                        to={ROUTES.instructor.myCourses}
                                        className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-slate-900 transition-all"
                                    >
                                        <Play className="w-4 h-4 ml-0.5" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <motion.div 
                        variants={itemVariants}
                        className="col-span-full py-24 bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center"
                    >
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-full mb-6">
                            <BookOpen className="w-16 h-16 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Build Your First Curriculum</h3>
                        <p className="text-slate-500 font-medium max-w-xs mb-8">Ready to share your knowledge? Create your first course and reach thousands of students.</p>
                        <Link 
                            to={ROUTES.instructor.createCourseBase} 
                            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
                        >
                            Get Started
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default EnrolledCourses;
