import React from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { initiateEnrollmentPayment, capturePayPalPayment } from "../services/EnrollmentService";
import { toast } from "sonner";

interface PayPalButtonProps {
  courseId: string;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({ courseId }) => {
  const [{ isPending }] = usePayPalScriptReducer();

  const handleCreateOrder = async () => {
    try {
      const result = await initiateEnrollmentPayment(courseId, "paypal");
      return result.data.providerResponse.id;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(message);
      throw new Error(message);
    }
  };
  const handleApprove = async (data: { orderID: string }) => {
    try {
      const result = await capturePayPalPayment(data.orderID);
      if (result.success) {
        window.location.href = `/enrollment/success?enrollmentId=${result.data.enrollmentId}`;
        localStorage.setItem("paymentClicked", "true");
        toast.success("Payment successful!");
      } else {
        toast.error("Payment capture failed. Please contact support.");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(message);
      throw new Error(message);
    }
  };

  return (
    <div className="w-full min-h-[150px]">
      {isPending ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <PayPalButtons
          style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
          onError={(err) => {
            console.error("PayPal Error:", err);
            toast.error("An error occurred with PayPal");
          }}
        />
      )}
    </div>
  );
};
