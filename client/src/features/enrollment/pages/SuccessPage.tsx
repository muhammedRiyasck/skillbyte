import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfettiExplosion from 'react-confetti-explosion';
import { CheckCircle } from 'lucide-react';
import gpayEffect from '@assets/gpay.mp3';
import { ROUTES } from '@/core/router/paths';
// import partyPopper from '@assets/partypopper.mp3';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  const playSuccessSound = () => {
    const audio = new Audio(gpayEffect);
    audio.play().catch((error) => {
      console.warn('Audio playback failed:', error);
    });
  };

  useEffect(() => {
    // Check for the recorded flag and play audio immediately
    const paymentClicked = localStorage.getItem('paymentClicked');
    if (paymentClicked === 'true') {
      playSuccessSound();
      // Clear the flag after playing
      localStorage.removeItem('paymentClicked');
    }
  }, []);

  return (
    <div className="min-h-screen dark:bg-gray-900 flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center dark:bg-gray-800 dark:text-gray-200">
        <div className="mb-4 flex justify-center relative">
            <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="w-16 h-16 text-green-600 animate-pulse" />
            </div>
            <ConfettiExplosion duration={2800} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200">Payment Successful!</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Congratulations! You have successfully enrolled in the course. 
          Get ready to start learning.
        </p>

        <div className="pt-4 space-y-3">
          <button
            onClick={() => {
              navigate(ROUTES.student.courses);
            }}
            className="w-full bg-indigo-600 cursor-pointer text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition duration-200 dark:bg-indigo-500 dark:hover:bg-indigo-600 flex items-center justify-center gap-2"
          >
            Go to My Courses
          </button>
          <button
            onClick={() => navigate(ROUTES.root)}
            className="w-full bg-gray-100 cursor-pointer text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition duration-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
