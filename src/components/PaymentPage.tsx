"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "@/components/PaymentForm";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface PaymentPageProps {
  amount: number;
  saleId: number;
  customerName: string;
  customerEmail: string;
  items: { name: string; price: number; quantity: number }[];
}

export default function PaymentPage({
  amount,
  saleId,
  customerName,
  customerEmail,
  items,
}: PaymentPageProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "succeeded" | "failed"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        saleId,
        currency: "usd",
        metadata: {
          customerName,
          customerEmail,
        },
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
        setError("Failed to initialize payment");
        setPaymentStatus("failed");
      });
  }, [amount, saleId, customerName, customerEmail]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setPaymentStatus("processing");

    try {
      // Confirm payment in our system
      const response = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethodId: "card", // In a real app, this would come from the payment form
          saleId,
          amount,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setPaymentStatus("failed");
      } else {
        setPaymentStatus("succeeded");
      }
    } catch (err) {
      setError("Failed to confirm payment");
      setPaymentStatus("failed");
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setPaymentStatus("failed");
  };

  if (paymentStatus === "succeeded") {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-6">Thank you for your payment.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Make Another Payment
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h2>
          <p className="text-gray-600 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Complete Your Payment
      </h2>

      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            clientSecret={clientSecret}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </Elements>
      )}

      {!clientSecret && paymentStatus === "idle" && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Order Summary
        </h3>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-gray-600">
                {item.name} × {item.quantity}
              </span>
              <span className="text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>${amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
