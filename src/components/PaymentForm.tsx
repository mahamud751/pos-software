"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string, paymentMethodId?: string) => void;
  onError: (error: string) => void;
}

export default function PaymentForm({
  clientSecret,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || "An error occurred");
      setIsLoading(false);
      onError(submitError.message || "An error occurred");
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "An error occurred");
      setIsLoading(false);
      onError(error.message || "An error occurred");
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      // Extract the payment method ID from the payment intent
      // If it's not available, default to "card"
      const paymentMethodId = paymentIntent.payment_method
        ? typeof paymentIntent.payment_method === "string"
          ? paymentIntent.payment_method
          : paymentIntent.payment_method.id
        : "card";
      onSuccess(paymentIntent.id, paymentMethodId);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100"
        >
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            {errorMessage}
          </div>
        </motion.div>
      )}
      <PaymentElement
        options={{
          layout: {
            type: "tabs",
            defaultCollapsed: false,
          },
        }}
      />
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full px-4 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing Payment...
          </div>
        ) : (
          `Pay $${(parseFloat(clientSecret.split("_")[0]) / 100).toFixed(
            2
          )} Now`
        )}
      </motion.button>
    </form>
  );
}
