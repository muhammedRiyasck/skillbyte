import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '../services/EnrollmentService';
import { CheckoutForm } from '../components/CheckoutForm';
import { toast } from 'sonner';
import { getCourseDetails } from '@features/course/services/CourseDetails';
import { ArrowLeft, ShieldCheck, Star } from 'lucide-react';
import { ROUTES } from '@/core/router/paths';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

export const CheckoutPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [course, setCourse] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      if (!courseId) {
          toast.error("Invalid Course ID");
            navigate(-1);
          return;
      }
      
      try {
        const [paymentData, courseData] = await Promise.all([
            createPaymentIntent(courseId),
            getCourseDetails(courseId)
        ]);
        console.log(paymentData, courseData);
        setClientSecret(paymentData?.data?.clientSecret);
        setCourse(courseData.data);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to initialize checkout";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [courseId, navigate]);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  if (!clientSecret || !course) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            Unable to load checkout due to newtwork work issue or may be you enrolled already in this course.
            back to &nbsp;<Link to={ROUTES.course.details.replace(':courseId',courseId!)} className="text-indigo-600 hover:underline">course page</Link> .
        </div>
      );
  }

  const options = {
    clientSecret,
    appearance: {
        theme: 'night' as const,
        variables: {
            colorPrimary: '#4f46e5',
        },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 cursor-pointer dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Course
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column: Course Summary */}
            <div className="order-2 lg:order-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                    <img 
                        src={course.thumbnailUrl || 'https://via.placeholder.com/600x400'} 
                        alt={course.title} 
                        className="w-full h-48 object-cover rounded-xl mb-6 shadow-sm"
                    />
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                                {course.category}
                            </span>
                            <div className="flex items-center text-yellow-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="ml-1 text-gray-700 dark:text-gray-200 font-medium">4.8</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                            {course.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                            {course.subText}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                            {course.courseLevel}  &middot; {course.language}
                        </p>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <img src={course.instructor?.avatar || "https://ui-avatars.com/api/?name=Instructor"} alt="Instructor" className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm" />
                               <div>
                                   <p className="text-sm font-medium text-gray-900 dark:text-white">{course.instructor?.name || 'Instructor'}</p>
                                   <p className="text-xs text-gray-500 dark:text-gray-400">Course Instructor</p>
                               </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800 flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-semibold text-indigo-900 dark:text-indigo-200">Secure Payment</h4>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                            Your transaction is protected by 256-bit SSL encryption. We do not store your card details.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: Payment Form */}
            <div className="order-1 lg:order-2">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total due</h3>
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                ₹{course.price.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-8">
                        <Elements stripe={stripePromise} options={options}>
                            <CheckoutForm />
                        </Elements>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
