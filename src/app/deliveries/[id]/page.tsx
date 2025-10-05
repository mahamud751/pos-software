"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  TruckIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface Delivery {
  id: number;
  saleId: number;
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  shippingAddress: string;
  shippingCost: number;
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
  deliveryUpdates: {
    id: number;
    status: string;
    location: string | null;
    notes: string | null;
    timestamp: string;
  }[];
}

export default function DeliveryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch delivery details
  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/deliveries/${params.id}`);
        const data = await response.json();
        setDelivery(data);
      } catch (error) {
        console.error("Error fetching delivery:", error);
        setError("Failed to load delivery details");
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();
  }, [params.id]);

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

  // Get status badge class
  const getStatusClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "shipped":
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

  if (!delivery) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Delivery not found</p>
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
          Back to Deliveries
        </button>
      </div>

      {/* Delivery Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Delivery Details
            </h1>
            <p className="text-gray-500 mt-1">
              Tracking number: {delivery.trackingNumber}
            </p>
          </div>
          <div className="flex items-center">
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusClass(
                delivery.status
              )}`}
            >
              {delivery.status.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Carrier</p>
            <p className="font-medium">{delivery.carrier}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Order</p>
            <p className="font-medium">{delivery.sale.invoiceNumber}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Shipping Cost</p>
            <p className="font-medium">
              {formatCurrency(delivery.shippingCost)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Customer</h2>
          {delivery.sale.customer ? (
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-gray-700 font-medium">
                    {delivery.sale.customer.name.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {delivery.sale.customer.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {delivery.sale.customer.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {delivery.sale.customer.phone}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No customer information</p>
          )}

          <h3 className="text-md font-medium text-gray-900 mt-6 mb-3">
            Shipping Address
          </h3>
          <div className="flex items-start">
            <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <p className="ml-2 text-sm text-gray-900">
              {delivery.shippingAddress}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Estimated Delivery</p>
              <p className="font-medium">
                {formatDate(delivery.estimatedDelivery)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Actual Delivery</p>
              <p className="font-medium">
                {formatDate(delivery.actualDelivery)}
              </p>
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
                {delivery.sale.saleItems.map((item) => (
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
                    {formatCurrency(delivery.sale.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delivery Updates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Delivery Updates
          </h2>
        </div>
        {delivery.deliveryUpdates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No delivery updates yet</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {delivery.deliveryUpdates.map((update, index) => (
                  <li key={update.id}>
                    <div className="relative pb-8">
                      {index !== delivery.deliveryUpdates.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                            <TruckIcon
                              className="h-5 w-5 text-white"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Status updated to{" "}
                              <span className="font-medium text-gray-900">
                                {update.status.replace("_", " ")}
                              </span>
                            </p>
                            {update.notes && (
                              <p className="mt-1 text-sm text-gray-700">
                                {update.notes}
                              </p>
                            )}
                            {update.location && (
                              <p className="mt-1 text-sm text-gray-500 flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {update.location}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={update.timestamp}>
                              {formatDateTime(update.timestamp)}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
