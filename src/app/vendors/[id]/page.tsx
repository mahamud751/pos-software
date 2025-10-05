"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "@/context/ToastContext";

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  contactPerson: string;
  commissionRate: number;
  isActive: boolean;
  isApproved: boolean;
  bankAccount: string | null;
  taxId: string | null;
  createdAt: string;
  updatedAt: string;
  vendorProducts: {
    id: number;
    productId: number;
    costPrice: number;
    sellingPrice: number;
    stock: number;
    isActive: boolean;
    product: {
      name: string;
      sku: string;
    };
  }[];
  commissions: {
    id: number;
    amount: number;
    status: string;
    paymentDate: string | null;
    transactionId: string | null;
    sale: {
      id: number;
      invoiceNumber: string;
      totalAmount: number;
      createdAt: string;
    } | null;
  }[];
}

export default function VendorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [productsPage, setProductsPage] = useState(1);
  const [commissionsPage, setCommissionsPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [productsLoading, setProductsLoading] = useState(true);
  const [commissionsLoading, setCommissionsLoading] = useState(true);

  // Fetch vendor details
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/vendors/${params.id}`);
        const data = await response.json();
        setVendor(data);
      } catch (error) {
        console.error("Error fetching vendor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [params.id]);

  // Fetch vendor products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await fetch(
          `/api/vendors/${params.id}/products?page=${productsPage}&limit=5`
        );
        const data = await response.json();
        setProducts(data.vendorProducts);
        setTotalProducts(data.pagination.total);
      } catch (error) {
        console.error("Error fetching vendor products:", error);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [params.id, productsPage]);

  // Fetch vendor commissions
  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        setCommissionsLoading(true);
        const response = await fetch(
          `/api/vendors/${params.id}/commissions?page=${commissionsPage}&limit=5`
        );
        const data = await response.json();
        setCommissions(data.commissions);
        setTotalCommissions(data.pagination.total);
      } catch (error) {
        console.error("Error fetching vendor commissions:", error);
      } finally {
        setCommissionsLoading(false);
      }
    };

    fetchCommissions();
  }, [params.id, commissionsPage]);

  // Toggle vendor approval status
  const toggleApproval = async () => {
    if (!vendor) return;

    try {
      // Get token from localStorage
      const token = localStorage.getItem("auth-token");

      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          ...vendor,
          isApproved: !vendor.isApproved,
        }),
      });

      if (response.ok) {
        const updatedVendor = await response.json();
        setVendor(updatedVendor);
        showToast(
          `Vendor ${
            updatedVendor.isApproved ? "approved" : "unapproved"
          } successfully!`,
          "success"
        );
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to update vendor", "error");
      }
    } catch (error) {
      console.error("Error updating vendor:", error);
      showToast("An error occurred while updating the vendor", "error");
    }
  };

  // Toggle vendor active status
  const toggleActive = async () => {
    if (!vendor) return;

    try {
      // Get token from localStorage
      const token = localStorage.getItem("auth-token");

      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          ...vendor,
          isActive: !vendor.isActive,
        }),
      });

      if (response.ok) {
        const updatedVendor = await response.json();
        setVendor(updatedVendor);
        showToast(
          `Vendor ${
            updatedVendor.isActive ? "activated" : "deactivated"
          } successfully!`,
          "success"
        );
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to update vendor", "error");
      }
    } catch (error) {
      console.error("Error updating vendor:", error);
      showToast("An error occurred while updating the vendor", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Vendor not found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The vendor you are looking for does not exist.
        </p>
        <div className="mt-6">
          <button
            onClick={() => router.push("/vendors")}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
            Back to Vendors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push("/vendors")}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
      </div>

      {/* Vendor Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Vendor Information
                </h2>
                <div className="mt-4 space-y-3">
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-500 w-32">
                      Name
                    </span>
                    <span className="text-sm text-gray-900">{vendor.name}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-500 w-32">
                      Email
                    </span>
                    <span className="text-sm text-gray-900">
                      {vendor.email}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-500 w-32">
                      Phone
                    </span>
                    <span className="text-sm text-gray-900">
                      {vendor.phone}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-500 w-32">
                      Contact Person
                    </span>
                    <span className="text-sm text-gray-900">
                      {vendor.contactPerson}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-500 w-32">
                      Address
                    </span>
                    <span className="text-sm text-gray-900">
                      {vendor.address || "Not provided"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-500 w-32">
                      Commission Rate
                    </span>
                    <span className="text-sm text-gray-900">
                      {vendor.commissionRate}%
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-500 w-32">
                      Bank Account
                    </span>
                    <span className="text-sm text-gray-900">
                      {vendor.bankAccount || "Not provided"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-500 w-32">
                      Tax ID
                    </span>
                    <span className="text-sm text-gray-900">
                      {vendor.taxId || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={toggleActive}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    vendor.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {vendor.isActive ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={toggleApproval}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    vendor.isApproved
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {vendor.isApproved ? "Approved" : "Pending"}
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Products</h2>
              <button className="text-sm text-green-600 hover:text-green-800">
                View All
              </button>
            </div>
            {productsLoading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No products
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  This vendor has not been assigned any products yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Selling Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.product.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${product.costPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${product.sellingPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.stock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Commissions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Commissions
              </h2>
              <button className="text-sm text-green-600 hover:text-green-800">
                View All
              </button>
            </div>
            {commissionsLoading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : commissions.length === 0 ? (
              <div className="text-center py-8">
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No commissions
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  This vendor has not earned any commissions yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sale
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {commissions.map((commission) => (
                      <tr key={commission.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {commission.sale?.invoiceNumber || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${commission.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              commission.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : commission.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {commission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {commission.sale?.createdAt
                            ? new Date(
                                commission.sale.createdAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                  <ShoppingBagIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Products</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {vendor.vendorProducts.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Pending Commissions
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {
                      vendor.commissions.filter((c) => c.status === "pending")
                        .length
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Commissions
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    $
                    {vendor.commissions
                      .reduce((sum, commission) => sum + commission.amount, 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/vendors/${vendor.id}/products`)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Manage Products
              </button>
              <button
                onClick={() => router.push(`/vendors/${vendor.id}/commissions`)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Manage Commissions
              </button>
              <button
                onClick={toggleApproval}
                className={`w-full flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-white ${
                  vendor.isApproved
                    ? "border-yellow-600 bg-yellow-600 hover:bg-yellow-700"
                    : "border-green-600 bg-green-600 hover:bg-green-700"
                }`}
              >
                {vendor.isApproved ? (
                  <>
                    <XMarkIcon className="h-5 w-5 mr-2" />
                    Revoke Approval
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Approve Vendor
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
