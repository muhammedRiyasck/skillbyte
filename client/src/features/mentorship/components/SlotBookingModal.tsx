import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../../../shared/ui/Modal";
import type { IMentorshipSlot, BookSlotResponse } from "../types/mentorshipTypes";
import { bookSlot, cancelBooking } from "../services/BookingServices";
import { toast } from "sonner";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { MentorshipCheckoutForm } from "./MentorshipCheckoutForm";
import { CreditCard, Calendar, Clock, IndianRupee, AlertTriangle, Loader2, ChevronRight } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onBookingInitiated?: (bookingId: string) => void;
  onPendingBookingCancelled?: (slotId: string) => void;
  slot: IMentorshipSlot;
}

export type PendingBookingData = {
  slotTitle?: string;
  scheduledAt: string | number | Date;
  amount: number;
  expiresAt?: string | number | Date;
  bookingId: string;
};

export const SlotBookingModal = ({ isOpen, onClose, onSuccess, onBookingInitiated, onPendingBookingCancelled, slot }: SlotBookingModalProps) => {
  const [step, setStep] = useState<'details' | 'payment-select' | 'stripe-checkout' | 'pending-conflict'>('details');
  const [bookingResponse, setBookingResponse] = useState<BookSlotResponse | null>(null);
  const [pendingBooking, setPendingBooking] = useState<PendingBookingData | null>(null);
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
      const errData = (error as { response?: { data?: { statusCode?: number, data?: { pendingBooking?: PendingBookingData }, message?: string } } }).response?.data;
      if (errData?.statusCode === 409 && errData?.data?.pendingBooking) {
        setPendingBooking(errData.data.pendingBooking);
        setStep('pending-conflict');
      } else {
        toast.error(errData?.message || "Failed to book slot");
      }
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
      onBookingInitiated?.(response.bookingId);
      
      if (provider === 'stripe') {
        setStep('stripe-checkout');
      } else if (provider === 'paypal' && response.paymentInfo.client_secret) {
        window.location.href = response.paymentInfo.client_secret;
      }
    } catch (error) {
      console.error(error);
      const errData = (error as { response?: { data?: { statusCode?: number, data?: { pendingBooking?: PendingBookingData }, message?: string } } }).response?.data;
      if (errData?.statusCode === 409 && errData?.data?.pendingBooking) {
        setPendingBooking(errData.data.pendingBooking);
        setStep('pending-conflict');
      } else {
        toast.error(errData?.message || "Failed to initiate booking");
      }
    } finally {
      setIsInitiating(false);
    }
  };

  const resetAndClose = () => {
    setStep('details');
    setBookingResponse(null);
    setPendingBooking(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={
        step === 'details' ? (isFree ? "Free Mentorship Session" : "Confirm Booking") 
        : step === 'pending-conflict' ? "Pending Booking Found"
        : "Complete Payment"
      }
      confirmLabel={
        isInitiating ? "Processing..." 
        : step === 'details' ? (isFree ? "Book for Free" : "Proceed to Payment") 
        : undefined
      }
      onConfirm={step === 'details' ? (isFree ? handleFreeBooking : () => setStep('payment-select')) : undefined}
      cancelLabel={step === 'stripe-checkout' ? "Back" : step === 'pending-conflict' ? "Close" : "Cancel"}
    >
      <motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25, ease: "easeOut" }}
  className="space-y-4"
>
  {/* Slot Brief */}
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#0b1220]"
  >
    <h4 className="mb-2 font-bold text-gray-950 dark:text-white">
      {slot.title || "Mentorship Session"}
    </h4>

    <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 p-3 dark:border-gray-700 dark:bg-[#101827]/60">
      <p className="mx-1 break-words text-sm font-medium leading-6 text-gray-700 dark:text-gray-300">
        {slot.description}
      </p>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
      <div className="flex items-center gap-2 font-medium text-gray-500 dark:text-gray-400">
        <Calendar
          size={14}
          className="shrink-0 text-blue-500"
        />
        {new Date(slot.scheduledAt).toLocaleDateString()}
      </div>

      <div className="flex items-center gap-2 font-medium text-gray-500 dark:text-gray-400">
        <Clock
          size={14}
          className="shrink-0 text-blue-500"
        />
        {slot.duration} mins
      </div>

      <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
        <IndianRupee size={14} />

        {slot.price > 0
          ? `${slot.price}.00`
          : "FREE"}
      </div>
    </div>
  </motion.div>

  {/* Payment Selection */}
  <AnimatePresence mode="wait">
    {step === "payment-select" && (
      <motion.div
        key="payment-select"
        initial={{ opacity: 0, height: 0, y: 8 }}
        animate={{ opacity: 1, height: "auto", y: 0 }}
        exit={{ opacity: 0, height: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="space-y-3 overflow-hidden"
      >
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          Choose your preferred payment method:
        </p>

        {/* Stripe */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          disabled={isInitiating}
          onClick={() => handleInitiateBooking("stripe")}
          className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-[#0b1220] dark:hover:border-blue-500/50"
        >
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-500 dark:group-hover:text-white"
            >
              <CreditCard size={19} />
            </motion.div>

            <div className="text-left">
              <span className="block font-semibold text-gray-800 dark:text-gray-200">
                Credit / Debit Card
              </span>

              <span className="text-xs text-gray-500 dark:text-gray-500">
                Secure payment with Stripe
              </span>
            </div>
          </div>

          <ChevronRight
            size={18}
            className="text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-500"
          />
        </motion.button>

        {/* PayPal */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          disabled={isInitiating}
          onClick={() => handleInitiateBooking("paypal")}
          className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-[#0b1220] dark:hover:border-blue-500/50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-[#101827]">
              <img
                src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
                alt="PayPal"
                className="h-auto w-auto"
              />
            </div>

            <div className="text-left">
              <span className="block font-semibold text-gray-800 dark:text-gray-200">
                PayPal
              </span>

              <span className="text-xs text-gray-500 dark:text-gray-500">
                Pay securely with PayPal
              </span>
            </div>
          </div>

          <ChevronRight
            size={18}
            className="text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-500"
          />
        </motion.button>
      </motion.div>
    )}

    {/* Stripe Checkout */}
    {step === "stripe-checkout" && bookingResponse && (
      <motion.div
        key="stripe-checkout"
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -15 }}
        transition={{ duration: 0.25 }}
      >
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret:
              bookingResponse.paymentInfo.client_secret!,
          }}
        >
          <MentorshipCheckoutForm
            onSuccess={() => {
              toast.success("Booking confirmed!");
              resetAndClose();

              if (onSuccess) {
                onSuccess();
              }
            }}
          />
        </Elements>
      </motion.div>
    )}

    {/* Pending Conflict */}
    {step === "pending-conflict" && pendingBooking && (
      <motion.div
        key="pending-conflict"
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -8 }}
        transition={{ duration: 0.25 }}
        className="space-y-4"
      >
        {/* Warning */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-300"
        >
          <AlertTriangle
            className="mt-0.5 shrink-0"
            size={20}
          />

          <div className="text-sm">
            <p className="mb-1 font-semibold">
              You already have a pending booking!
            </p>

            <p className="leading-5 text-amber-700/80 dark:text-amber-300/80">
              Please complete or cancel your existing
              pending booking before you can book another
              slot.
            </p>
          </div>
        </motion.div>

        {/* Existing Booking */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#0b1220]"
        >
          <h5 className="font-semibold text-gray-950 dark:text-white">
            {pendingBooking.slotTitle ||
              "Mentorship Session"}
          </h5>

          <div className="mt-3 flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar
                size={14}
                className="text-blue-500"
              />

              {new Date(
                pendingBooking.scheduledAt,
              ).toLocaleDateString()}
            </div>

            <div className="flex items-center gap-2">
              <IndianRupee
                size={14}
                className="text-blue-500"
              />

              {pendingBooking.amount > 0
                ? `${pendingBooking.amount}.00`
                : "FREE"}
            </div>

            {pendingBooking.expiresAt && (
              <div className="mt-1 flex items-center gap-2 text-red-500 dark:text-red-400">
                <Clock size={14} />

                <span>
                  Expires at{" "}
                  {new Date(
                    pendingBooking.expiresAt,
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Cancel Pending Booking */}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          disabled={isInitiating}
          onClick={async () => {
            try {
              setIsInitiating(true);

              await cancelBooking(
                pendingBooking.bookingId,
              );

              toast.success(
                "Pending booking cancelled successfully.",
              );

              setStep("details");

              onPendingBookingCancelled?.(slot.slotId);

              setPendingBooking(null);
            } catch (error) {
              const err = error as {
                response?: {
                  data?: {
                    message?: string;
                  };
                };
              };

              toast.error(
                err.response?.data?.message ||
                  "Failed to cancel booking",
              );
            } finally {
              setIsInitiating(false);
            }
          }}
          className="w-full cursor-pointer rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-100 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
        >
          {isInitiating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cancelling...
            </span>
          ) : (
            "Cancel Pending Booking"
          )}
        </motion.button>
      </motion.div>
    )}
  </AnimatePresence>
</motion.div>
    </Modal>
  );
};
