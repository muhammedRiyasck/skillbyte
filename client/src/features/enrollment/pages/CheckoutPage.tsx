import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { initiateEnrollmentPayment } from '../services/EnrollmentService';
import { CheckoutForm } from '../components/CheckoutForm';
import { PayPalButton } from '../components/PayPalButton';
import { toast } from 'sonner';
import { getCourseDetails } from '@features/course/services/CourseDetails';
import { ArrowLeft, ShieldCheck, Star, CreditCard, Lock } from 'lucide-react';
import { ROUTES } from '@/core/router/paths';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");
const paypalOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", // Use env or placeholder
    currency: "USD",
    intent: "capture",
};

export const CheckoutPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [course, setCourse] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentInitializing, setIsPaymentInitializing] = useState(false);

  useEffect(() => {
    const initData = async () => {
      if (!courseId) {
          toast.error("Invalid Course ID");
            navigate(-1);
          return;
      }
      
      try {
        // Only fetch course details initially
        const courseData = await getCourseDetails(courseId);
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

  const initializeStripePayment = async () => {
    if (!courseId) return;
    
    setIsPaymentInitializing(true);
    try {
        const paymentData = await initiateEnrollmentPayment(courseId, 'stripe');
        setClientSecret(paymentData?.data?.providerResponse?.client_secret || paymentData?.data?.clientSecret);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to initialize payment";
        toast.error(message);
    } finally {
        setIsPaymentInitializing(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  if (!course) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            Unable to load course details.
            back to &nbsp;<Link to={ROUTES.course.details.replace(':courseId',courseId!)} className="text-indigo-600 hover:underline">course page</Link> .
        </div>
      );
  }

  const stripeOptions = {
    clientSecret: clientSecret || "",
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
                            Your transaction is protected by industry-standard encryption. 
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: Payment Selection & Form */}
            <div className="order-1 lg:order-2">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total due</h3>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white block">
                                    ₹{course.price.toLocaleString()}
                                </span>
                                {paymentMethod === 'paypal' && (
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        ≈ ${(course.price / 83).toFixed(2)} USD
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-8">
                        {/* Payment Method Selector */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={() => {
                                    setPaymentMethod('stripe');
                                    setClientSecret(null); // Reset client secret when switching methods
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                                    paymentMethod === 'stripe'
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                <CreditCard className="w-6 h-6" />
                                <img alt="stripe img" src='https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg' className="w-12 h-12 object-contain"/>
                            </button>
                            <button
                                onClick={() => {
                                    setPaymentMethod('paypal');
                                    setClientSecret(null);
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                                    paymentMethod === 'paypal'
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-6" />
                                <span className="font-semibold">PayPal</span>
                            </button>
                        </div>

                        {paymentMethod === 'stripe' ? (
                            clientSecret ? (
                                <Elements stripe={stripePromise} options={stripeOptions}>
                                    <CheckoutForm />
                                </Elements>
                            ) : (
                                <div className="text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                    <div className="mb-4 flex justify-center">
                                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                                            <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Secure Credit Card Payment
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                                        Click below to initialize the secure payment form. Your data is encrypted and safe.
                                    </p>
                                    <button 
                                        onClick={initializeStripePayment}
                                        disabled={isPaymentInitializing}
                                        className="w-full cursor-pointer sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mx-auto"
                                    >
                                        {isPaymentInitializing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Initializing...
                                            </>
                                        ) : (
                                            <>
                                                Proceed to Secure Checkout
                                            </>
                                        )}
                                    </button>
                                </div>
                            )
                        ) : (
                            <PayPalScriptProvider options={paypalOptions}>
                                <PayPalButton courseId={courseId!}  />
                            </PayPalScriptProvider>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
