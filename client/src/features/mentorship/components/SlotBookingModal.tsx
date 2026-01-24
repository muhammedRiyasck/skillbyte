import { useState } from "react";
import Modal from "../../../shared/ui/Modal";
import type { IMentorshipSlot, BookSlotResponse } from "../types/mentorshipTypes";
import { bookSlot } from "../services/BookingServices";
import { toast } from "sonner";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { MentorshipCheckoutForm } from "./MentorshipCheckoutForm";
import { CreditCard, Calendar, Clock, IndianRupee } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  slot: IMentorshipSlot;
}

export const SlotBookingModal = ({ isOpen, onClose, onSuccess, slot }: SlotBookingModalProps) => {
  const [step, setStep] = useState<'details' | 'payment-select' | 'stripe-checkout'>('details');
  const [bookingResponse, setBookingResponse] = useState<BookSlotResponse | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);

  const isFree = slot.price === 0;

  const handleFreeBooking = async () => {
    try {
      setIsInitiating(true);
      await bookSlot({ 
        slotId: slot.slotId, 
        providerName: 'free'
      });
      toast.success("Free mentorship session booked!");
      resetAndClose();
      onSuccess?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsInitiating(false);
    }
  };

  const handleInitiateBooking = async (provider: 'stripe' | 'paypal') => {
    try {
      setIsInitiating(true);
      const response = await bookSlot({ 
        slotId: slot.slotId, 
        providerName: provider 
      });
      
      toast.success("Your booking has been initiated. You can view it on the Bookings page.");
      setBookingResponse(response);
      if (provider === 'stripe') {
        setStep('stripe-checkout');
      } else if (provider === 'paypal' && response.paymentInfo.client_secret) {
        window.location.href = response.paymentInfo.client_secret;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsInitiating(false);
    }
  };

  const resetAndClose = () => {
    setStep('details');
    setBookingResponse(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={step === 'details' ? (isFree ? "Free Mentorship Session" : "Confirm Booking") : "Complete Payment"}
      confirmLabel={isInitiating ? "Processing..." : (step === 'details' ? (isFree ? "Book for Free" : "Proceed to Payment") : undefined)}
      onConfirm={step === 'details' ? (isFree ? handleFreeBooking : () => setStep('payment-select')) : undefined}
      cancelLabel={step === 'stripe-checkout' ? "Back" : "Cancel"}
    >
      <div className="space-y-4">
        {/* Slot Brief */}
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <h4 className="font-bold text-gray-900 dark:text-white  mb-2">{slot.title || "Mentorship Session"}</h4>
       <div className="my-2 border border-dashed p-2 rounded-lg dark:border-gray-600">
        <p className="text-sm text-black font-medium dark:text-gray-200 mx-2 break-words">{slot.description }</p>
        </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mt-4 dark:text-gray-400">
            <div className="flex items-center gap-2 font-medium">
              <Calendar size={14} /> {new Date(slot.scheduledAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Clock size={14} /> {slot.duration} mins
            </div>
           
            <div className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
              <IndianRupee size={14} /> {slot.price > 0 ? `${slot.price}.00` : 'FREE'}
            </div>
          </div>
        </div>

        {step === 'payment-select' && (
          <div className="space-y-3">
             <p className="text-sm text-gray-500 mb-2">Choose your preferred payment method:</p>
             <button 
                disabled={isInitiating}
                onClick={() => handleInitiateBooking('stripe')}
                className="w-full p-4 cursor-pointer border-2 border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-between hover:border-indigo-500 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <CreditCard size={20} />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Credit / Debit Card</span>
                </div>
             </button>

             <button 
                disabled={isInitiating}
                onClick={() => handleInitiateBooking('paypal')}
                className="w-full p-4 cursor-pointer border-2 border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-between hover:border-blue-500 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-10  flex items-center justify-center ">
                        <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">PayPal</span>
                </div>
             </button>
          </div>
        )}

        {step === 'stripe-checkout' && bookingResponse && (
          <Elements 
            stripe={stripePromise} 
            options={{ clientSecret: bookingResponse.paymentInfo.client_secret! }}
          >
            <MentorshipCheckoutForm
              onSuccess={() => {
                toast.success("Booking confirmed!");
                resetAndClose();
                if (onSuccess) onSuccess();
              }} 
            />
          </Elements>
        )}
      </div>
    </Modal>
  );
};
