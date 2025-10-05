"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "@/components/PaymentForm";
import { useToast } from "@/context/ToastContext";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripePaymentModalProps {
  amount: number;
  saleId: number;
  items: { name: string; price: number; quantity: number }[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function StripePaymentModal({
  amount,
  saleId,
  items,
  onClose,
  onSuccess,
}: StripePaymentModalProps) {
  const { showToast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "succeeded" | "failed"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate inputs before creating payment intent
    if (amount <= 0 || !saleId) {
      setError("Invalid payment amount or sale ID");
      setPaymentStatus("failed");
      return;
    }

    // Create PaymentIntent as soon as the modal opens
    fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        saleId,
        currency: "usd",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setPaymentStatus("failed");
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch((err) => {
        console.error("Error initializing payment:", err);
        setError("Failed to initialize payment: " + err.message);
        setPaymentStatus("failed");
      });
  }, [amount, saleId]);

  const handlePaymentSuccess = async (
    paymentIntentId: string,
    paymentMethodId: string = "card"
  ) => {
    setPaymentStatus("processing");

    try {
      // Validate inputs
      if (!paymentIntentId || !saleId || amount <= 0) {
        throw new Error("Invalid payment parameters");
      }

      // Confirm payment in our system
      const response = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethodId: paymentMethodId,
          saleId,
          amount: amount,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setPaymentStatus("failed");
        showToast(`Payment failed: ${result.error}`, "error");
      } else {
        setPaymentStatus("succeeded");
        // Update the completed sale with the payment information
        if (onSuccess) {
          onSuccess();
        }
        showToast(
          "Payment processed successfully! Sale has been updated.",
          "success"
        );
        // Wait a moment then close the modal
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (_error) {
      console.error("Error confirming payment:", _error);
      setError("Failed to confirm payment: " + (_error as Error).message);
      setPaymentStatus("failed");
      showToast(`Payment error: ${(_error as Error).message}`, "error");
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    console.error("Payment error:", errorMessage);
    setError(errorMessage);
    setPaymentStatus("failed");
    showToast(`Payment error: ${errorMessage}`, "error");
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (paymentStatus === "succeeded") {
    return (
      <div
        className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          className="modal-container slide-in p-8 max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-100"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-800 mb-3"
            >
              Payment Successful!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 text-lg mb-2"
            >
              Thank you for your payment.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 text-sm"
            >
              Your transaction has been completed successfully.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <button
                onClick={() => {
                  if (onSuccess) onSuccess();
                  onClose();
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-md transition-all duration-200"
              >
                Continue Shopping
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div
        className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          className="modal-container slide-in p-8 max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-100"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-800 mb-3"
            >
              Payment Failed
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 mb-6"
            >
              {error || "An unknown error occurred"}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex space-x-4 justify-center"
            >
              <button
                onClick={() => {
                  setPaymentStatus("idle");
                  setError(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 shadow-md transition-all duration-200"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-lg hover:from-gray-600 hover:to-gray-700 shadow-md transition-all duration-200"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="modal-container slide-in p-6 max-w-md w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-gray-800"
          >
            Pay with Card
          </motion.h2>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </motion.button>
        </div>

        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm
              clientSecret={clientSecret}
              onSuccess={(paymentIntentId, paymentMethodId) =>
                handlePaymentSuccess(paymentIntentId, paymentMethodId)
              }
              onError={handlePaymentError}
            />
          </Elements>
        ) : (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-6"
            ></motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 text-lg"
            >
              Initializing payment...
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 text-sm mt-2"
            >
              Please wait while we prepare your payment
            </motion.p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 pt-6 border-t border-gray-200"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Order Summary
          </h3>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2"
              >
                <div>
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    × {item.quantity}
                  </span>
                </div>
                <span className="font-medium text-gray-800">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200">
              <span className="text-gray-800">Total</span>
              <span className="text-green-600">${amount.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
