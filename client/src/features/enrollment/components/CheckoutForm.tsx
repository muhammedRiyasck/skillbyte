import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    localStorage.setItem('paymentClicked', 'true');
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/enrollment/success`,
      },
    });
    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      toast.error(error.message || "Payment failed");
      localStorage.removeItem('paymentClicked');
    }
    setIsProcessing(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Details</label>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors">
            <PaymentElement id="payment-element" options={{layout: "tabs"}} />
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 text-sm flex items-center animate-shake">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="group w-full bg-indigo-600 cursor-pointer dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing Securely...</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 group-hover:scale-110 transition-transform " />
            <span>Pay Securely</span>
          </>
        )}
      </button>
      
      <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        Payments are processed securely by Stripe.
      </p>
    </form>
  )};
