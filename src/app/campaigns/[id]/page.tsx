"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface Campaign {
  id: number;
  name: string;
  description: string | null;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  targetSegments: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  coupons: Coupon[];
}

interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minimumOrderValue: number | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponName, setCouponName] = useState("");
  const [couponDescription, setCouponDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumOrderValue, setMinimumOrderValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [couponStartDate, setCouponStartDate] = useState("");
  const [couponEndDate, setCouponEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  // Fetch campaign details
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/campaigns/${params.id}`);
        const data = await response.json();
        setCampaign(data);
      } catch (error) {
        console.error("Error fetching campaign:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [params.id]);

  // Handle campaign status change
  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/campaigns/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedCampaign = await response.json();
        setCampaign(updatedCampaign);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update campaign status");
      }
    } catch (error) {
      console.error("Error updating campaign status:", error);
      alert("An error occurred while updating the campaign status");
    }
  };

  // Handle coupon form submission
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const couponData = {
        code: couponCode,
        name: couponName,
        description: couponDescription,
        discountType,
        discountValue: parseFloat(discountValue),
        minimumOrderValue: minimumOrderValue
          ? parseFloat(minimumOrderValue)
          : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        startDate: couponStartDate,
        endDate: couponEndDate,
        isActive,
        campaignId: parseInt(params.id),
      };

      if (editingCoupon) {
        // Update existing coupon
        const response = await fetch(`/api/coupons/${editingCoupon.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(couponData),
        });

        if (response.ok) {
          const updatedCoupon = await response.json();
          setCampaign({
            ...campaign!,
            coupons: campaign!.coupons.map((c) =>
              c.id === updatedCoupon.id ? updatedCoupon : c
            ),
          });
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to update coupon");
          return;
        }
      } else {
        // Create new coupon
        const response = await fetch("/api/coupons", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(couponData),
        });

        if (response.ok) {
          const newCoupon = await response.json();
          setCampaign({
            ...campaign!,
            coupons: [...campaign!.coupons, newCoupon],
          });
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to create coupon");
          return;
        }
      }

      // Reset form and close modal
      setShowCouponModal(false);
      setEditingCoupon(null);
      setCouponCode("");
      setCouponName("");
      setCouponDescription("");
      setDiscountType("percentage");
      setDiscountValue("");
      setMinimumOrderValue("");
      setUsageLimit("");
      setCouponStartDate("");
      setCouponEndDate("");
      setIsActive(true);
    } catch (error) {
      console.error("Error saving coupon:", error);
      setError("An error occurred while saving the coupon");
    }
  };

  // Handle edit coupon
  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCouponCode(coupon.code);
    setCouponName(coupon.name);
    setCouponDescription(coupon.description || "");
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue.toString());
    setMinimumOrderValue(
      coupon.minimumOrderValue ? coupon.minimumOrderValue.toString() : ""
    );
    setUsageLimit(coupon.usageLimit ? coupon.usageLimit.toString() : "");
    setCouponStartDate(new Date(coupon.startDate).toISOString().split("T")[0]);
    setCouponEndDate(new Date(coupon.endDate).toISOString().split("T")[0]);
    setIsActive(coupon.isActive);
    setShowCouponModal(true);
  };

  // Handle delete coupon
  const handleDeleteCoupon = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCampaign({
          ...campaign!,
          coupons: campaign!.coupons.filter((coupon) => coupon.id !== id),
        });
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete coupon");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      alert("An error occurred while deleting the coupon");
    }
  };

  // Open create coupon modal
  const openCreateCouponModal = () => {
    setEditingCoupon(null);
    setCouponCode("");
    setCouponName("");
    setCouponDescription("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinimumOrderValue("");
    setUsageLimit("");
    setCouponStartDate(new Date().toISOString().split("T")[0]);
    setCouponEndDate(
      new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0]
    );
    setIsActive(true);
    setError("");
    setShowCouponModal(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Campaign not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Campaigns
          </button>
        </div>
        <div className="flex space-x-2">
          {campaign.status === "draft" && (
            <button
              onClick={() => handleStatusChange("active")}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <PlayIcon className="h-4 w-4 mr-1" />
              Activate
            </button>
          )}
          {campaign.status === "active" && (
            <button
              onClick={() => handleStatusChange("paused")}
              className="flex items-center px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              <PauseIcon className="h-4 w-4 mr-1" />
              Pause
            </button>
          )}
          <button
            onClick={() => handleEditCoupon({} as Coupon)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </button>
        </div>
      </div>

      {/* Campaign Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {campaign.name}
            </h1>
            {campaign.description && (
              <p className="text-gray-500 mt-1">{campaign.description}</p>
            )}
          </div>
          <div className="flex items-center">
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                campaign.status === "active"
                  ? "bg-green-100 text-green-800"
                  : campaign.status === "paused"
                  ? "bg-yellow-100 text-yellow-800"
                  : campaign.status === "completed"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {campaign.status.charAt(0).toUpperCase() +
                campaign.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-medium capitalize">{campaign.type}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Period</p>
            <p className="font-medium">
              {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Coupons</p>
            <p className="font-medium">{campaign.coupons.length}</p>
          </div>
        </div>
      </div>

      {/* Coupons Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Coupons</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreateCouponModal}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Coupon
          </motion.button>
        </div>

        {campaign.coupons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No coupons found for this campaign</p>
            <button
              onClick={openCreateCouponModal}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create First Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Code
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Discount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Usage
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Period
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaign.coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {coupon.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{coupon.name}</div>
                      {coupon.description && (
                        <div className="text-sm text-gray-500">
                          {coupon.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : formatCurrency(coupon.discountValue)}
                      </div>
                      {coupon.minimumOrderValue && (
                        <div className="text-xs text-gray-500">
                          Min: {formatCurrency(coupon.minimumOrderValue)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {coupon.usedCount}
                      {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(coupon.startDate)} -{" "}
                      {formatDate(coupon.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          coupon.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCoupon(coupon)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-container slide-in p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
            </h2>
            <form onSubmit={handleCouponSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="couponCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Coupon Code
                </label>
                <input
                  type="text"
                  id="couponCode"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter coupon code"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="couponName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Coupon Name
                </label>
                <input
                  type="text"
                  id="couponName"
                  value={couponName}
                  onChange={(e) => setCouponName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter coupon name"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="couponDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="couponDescription"
                  value={couponDescription}
                  onChange={(e) => setCouponDescription(e.target.value)}
                  rows={2}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter coupon description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="discountType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Discount Type
                  </label>
                  <select
                    id="discountType"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="discountValue"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Discount Value
                  </label>
                  <input
                    type="number"
                    id="discountValue"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    step="0.01"
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter discount value"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="minimumOrderValue"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Minimum Order Value
                  </label>
                  <input
                    type="number"
                    id="minimumOrderValue"
                    value={minimumOrderValue}
                    onChange={(e) => setMinimumOrderValue(e.target.value)}
                    step="0.01"
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter minimum order value"
                  />
                </div>
                <div>
                  <label
                    htmlFor="usageLimit"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    id="usageLimit"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter usage limit"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="couponStartDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="couponStartDate"
                    value={couponStartDate}
                    onChange={(e) => setCouponStartDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="couponEndDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    id="couponEndDate"
                    value={couponEndDate}
                    onChange={(e) => setCouponEndDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingCoupon ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
