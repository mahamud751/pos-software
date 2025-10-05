"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

interface FraudDetection {
  id: number;
  saleId: number;
  riskScore: number;
  flags: string;
  status: string;
  reviewedBy: number | null;
  reviewedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  sale: {
    id: number;
    invoiceNumber: string;
    totalAmount: number;
    customer: {
      id: number;
      name: string;
      email: string;
      phone: string;
    } | null;
    saleItems: {
      id: number;
      productId: number;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      product: {
        id: number;
        name: string;
      };
    }[];
  };
  reviewer: {
    id: number;
    name: string;
  } | null;
}

export default function FraudDetectionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [fraudDetection, setFraudDetection] = useState<FraudDetection | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  // Fetch fraud detection details
  useEffect(() => {
    const fetchFraudDetection = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/fraud-detection/${params.id}`);
        const data = await response.json();
        setFraudDetection(data);
        setReviewStatus(data.status);
      } catch (error) {
        console.error("Error fetching fraud detection:", error);
        setError("Failed to load fraud detection details");
      } finally {
        setLoading(false);
      }
    };

    fetchFraudDetection();
  }, [params.id]);

  // Handle review submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/fraud-detection/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: reviewStatus,
          notes: reviewNotes,
          reviewedBy: 1, // In a real app, this would be the current user ID
          reviewedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const updatedFraud = await response.json();
        setFraudDetection(updatedFraud);
        alert("Review submitted successfully");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("An error occurred while submitting the review");
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Format datetime for display
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get risk score color
  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 50) return "text-yellow-600";
    return "text-green-600";
  };

  // Get status badge class
  const getStatusClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!fraudDetection) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Fraud detection record not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Fraud Detection
        </button>
      </div>

      {/* Fraud Detection Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Fraud Detection Details
            </h1>
            <p className="text-gray-500 mt-1">
              Order: {fraudDetection.sale.invoiceNumber}
            </p>
          </div>
          <div className="flex items-center">
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusClass(
                fraudDetection.status
              )}`}
            >
              {fraudDetection.status}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Risk Score</p>
            <p
              className={`text-2xl font-bold ${getRiskScoreColor(
                fraudDetection.riskScore
              )}`}
            >
              {fraudDetection.riskScore}%
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Flags</p>
            <p className="text-2xl font-bold text-gray-900">
              {JSON.parse(fraudDetection.flags).length}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Order Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(fraudDetection.sale.totalAmount)}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDateTime(fraudDetection.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Customer</h2>
          {fraudDetection.sale.customer ? (
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-gray-700 font-medium">
                    {fraudDetection.sale.customer.name.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {fraudDetection.sale.customer.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {fraudDetection.sale.customer.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {fraudDetection.sale.customer.phone}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No customer information</p>
          )}

          {/* Review Information */}
          <h3 className="text-md font-medium text-gray-900 mt-6 mb-3">
            Review Status
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <span className="text-sm font-medium text-gray-900">
                {fraudDetection.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Reviewed By</span>
              <span className="text-sm font-medium text-gray-900">
                {fraudDetection.reviewer?.name || "Not reviewed"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Reviewed At</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(fraudDetection.reviewedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Unit Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fraudDetection.sale.saleItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-medium">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Order Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(fraudDetection.sale.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fraud Flags */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Fraud Flags</h2>
        </div>
        <div className="p-6">
          {JSON.parse(fraudDetection.flags).length === 0 ? (
            <p className="text-gray-500">No fraud flags detected</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {JSON.parse(fraudDetection.flags).map(
                (flag: string, index: number) => (
                  <div
                    key={index}
                    className="border border-red-200 bg-red-50 rounded-lg p-4"
                  >
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                      <span className="ml-2 text-sm font-medium text-red-800">
                        {flag}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Review Order</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleReviewSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="reviewStatus"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="reviewStatus"
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="reviewNotes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes
                </label>
                <textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Add any notes about this review..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
