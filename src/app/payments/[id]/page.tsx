"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CreditCardIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface Payment {
  id: number;
  saleId: number;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId: string;
  createdAt: string;
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
}

export default function PaymentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch payment details
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from an API
        // For now, we'll use mock data
        const mockPayment: Payment = {
          id: 1,
          saleId: 1001,
          amount: 125.99,
          paymentMethod: "card",
          status: "completed",
          transactionId: "pi_123456789",
          createdAt: "2023-05-15T10:30:00Z",
          sale: {
            id: 1001,
            invoiceNumber: "INV-2023-001",
            totalAmount: 125.99,
            customer: {
              id: 1,
              name: "John Doe",
              email: "john@example.com",
              phone: "+1 (555) 123-4567",
            },
            saleItems: [
              {
                id: 1,
                productId: 1,
                quantity: 2,
                unitPrice: 25.99,
                totalPrice: 51.98,
                product: {
                  id: 1,
                  name: "Product A",
                },
              },
              {
                id: 2,
                productId: 2,
                quantity: 1,
                unitPrice: 74.01,
                totalPrice: 74.01,
                product: {
                  id: 2,
                  name: "Product B",
                },
              },
            ],
          },
        };
        setPayment(mockPayment);
      } catch (error) {
        console.error("Error fetching payment:", error);
        setError("Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [params.id]);

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

  // Get status badge class
  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  if (!payment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Payment not found</p>
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
          Back to Payments
        </button>
      </div>

      {/* Payment Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Payment Details
            </h1>
            <p className="text-gray-500 mt-1">
              Transaction ID: {payment.transactionId}
            </p>
          </div>
          <div className="flex items-center">
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusClass(
                payment.status
              )}`}
            >
              {payment.status}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(payment.amount)}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Payment Method</p>
            <div className="flex items-center mt-1">
              <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
              <p className="font-medium text-gray-900">
                {payment.paymentMethod}
              </p>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Order</p>
            <p className="font-medium text-gray-900">
              {payment.sale.invoiceNumber}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium text-gray-900">
              {formatDateTime(payment.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Customer</h2>
          {payment.sale.customer ? (
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-gray-700 font-medium">
                    {payment.sale.customer.name.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {payment.sale.customer.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {payment.sale.customer.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {payment.sale.customer.phone}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No customer information</p>
          )}
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
                {payment.sale.saleItems.map((item) => (
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
                    {formatCurrency(payment.sale.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Actions</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {payment.status === "completed" && (
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Refund Payment
              </button>
            )}
            {payment.status === "pending" && (
              <>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Confirm Payment
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Cancel Payment
                </button>
              </>
            )}
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              View Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
