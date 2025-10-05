"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface DiscountRule {
  id: number;
  name: string;
  description: string | null;
  type: string;
  value: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  priority: number;
  conditions: string;
  usageLimit: number | null;
  usedCount: number;
  couponCode: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    productDiscountRules: number;
    categoryDiscountRules: number;
    customerDiscountRules: number;
    couponUsages: number;
  };
}

export default function DiscountRulesPage() {
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<DiscountRule | null>(null);
  const [ruleName, setRuleName] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [ruleType, setRuleType] = useState("percentage");
  const [ruleValue, setRuleValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState("0");
  const [usageLimit, setUsageLimit] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState("");

  // Fetch discount rules
  useEffect(() => {
    const fetchDiscountRules = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/discount-rules?page=${currentPage}&search=${searchTerm}&isActive=${
            statusFilter === "all" ? "" : statusFilter
          }`
        );
        const data = await response.json();
        setDiscountRules(data.discountRules);
        setTotalPages(data.pagination.pages);
      } catch (error) {
        console.error("Error fetching discount rules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountRules();
  }, [currentPage, searchTerm, statusFilter]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const ruleData = {
        name: ruleName,
        description: ruleDescription,
        type: ruleType,
        value: parseFloat(ruleValue),
        startDate,
        endDate: endDate || null,
        isActive,
        priority: parseInt(priority),
        conditions: "{}", // In a real app, you would collect conditions
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        couponCode: couponCode || null,
      };

      if (editingRule) {
        // Update existing rule
        const response = await fetch(`/api/discount-rules/${editingRule.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ruleData),
        });

        if (response.ok) {
          const updatedRule = await response.json();
          setDiscountRules(
            discountRules.map((r) =>
              r.id === updatedRule.id ? { ...updatedRule, _count: r._count } : r
            )
          );
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to update discount rule");
          return;
        }
      } else {
        // Create new rule
        const response = await fetch("/api/discount-rules", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ruleData),
        });

        if (response.ok) {
          const newRule = await response.json();
          setDiscountRules([
            ...discountRules,
            {
              ...newRule,
              _count: {
                productDiscountRules: 0,
                categoryDiscountRules: 0,
                customerDiscountRules: 0,
                couponUsages: 0,
              },
            },
          ]);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to create discount rule");
          return;
        }
      }

      // Reset form and close modal
      setShowModal(false);
      setEditingRule(null);
      setRuleName("");
      setRuleDescription("");
      setRuleType("percentage");
      setRuleValue("");
      setStartDate("");
      setEndDate("");
      setIsActive(true);
      setPriority("0");
      setUsageLimit("");
      setCouponCode("");
    } catch (error) {
      console.error("Error saving discount rule:", error);
      setError("An error occurred while saving the discount rule");
    }
  };

  // Handle edit rule
  const handleEdit = (rule: DiscountRule) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRuleDescription(rule.description || "");
    setRuleType(rule.type);
    setRuleValue(rule.value.toString());
    setStartDate(new Date(rule.startDate).toISOString().split("T")[0]);
    setEndDate(
      rule.endDate ? new Date(rule.endDate).toISOString().split("T")[0] : ""
    );
    setIsActive(rule.isActive);
    setPriority(rule.priority.toString());
    setUsageLimit(rule.usageLimit?.toString() || "");
    setCouponCode(rule.couponCode || "");
    setShowModal(true);
  };

  // Handle delete rule
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this discount rule?")) return;

    try {
      const response = await fetch(`/api/discount-rules/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDiscountRules(discountRules.filter((rule) => rule.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete discount rule");
      }
    } catch (error) {
      console.error("Error deleting discount rule:", error);
      alert("An error occurred while deleting the discount rule");
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingRule(null);
    setRuleName("");
    setRuleDescription("");
    setRuleType("percentage");
    setRuleValue("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setIsActive(true);
    setPriority("0");
    setUsageLimit("");
    setCouponCode("");
    setError("");
    setShowModal(true);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No end date";
    return new Date(dateString).toLocaleDateString();
  };

  // Get type badge class
  const getTypeClass = (type: string) => {
    switch (type) {
      case "percentage":
        return "bg-blue-100 text-blue-800";
      case "fixed_amount":
        return "bg-green-100 text-green-800";
      case "buy_x_get_y":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Rules</h1>
          <p className="text-gray-500 mt-1">
            Manage discount rules and coupon codes
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Discount Rule
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Search discount rules..."
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Discount Rules Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-500">Loading discount rules...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Value
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
                      Usage
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Coupon Code
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
                  {discountRules.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No discount rules found
                      </td>
                    </tr>
                  ) : (
                    discountRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {rule.name}
                          </div>
                          {rule.description && (
                            <div className="text-sm text-gray-500">
                              {rule.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeClass(
                              rule.type
                            )}`}
                          >
                            {rule.type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rule.type === "percentage"
                            ? `${rule.value}%`
                            : `$${rule.value.toFixed(2)}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(rule.startDate)} -{" "}
                          {formatDate(rule.endDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rule.usedCount}
                          {rule.usageLimit && ` / ${rule.usageLimit}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rule.couponCode || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              rule.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {rule.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(rule)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page{" "}
                      <span className="font-medium">{currentPage}</span> of{" "}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1
                              ? "z-10 bg-green-50 border-green-500 text-green-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingRule ? "Edit Discount Rule" : "Add New Discount Rule"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="ruleName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Rule Name
                </label>
                <input
                  type="text"
                  id="ruleName"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter rule name"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="ruleDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="ruleDescription"
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  rows={2}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter rule description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="ruleType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Type
                  </label>
                  <select
                    id="ruleType"
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                    <option value="buy_x_get_y">Buy X Get Y</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="ruleValue"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Value
                  </label>
                  <input
                    type="number"
                    id="ruleValue"
                    value={ruleValue}
                    onChange={(e) => setRuleValue(e.target.value)}
                    step="0.01"
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter value"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Priority
                  </label>
                  <input
                    type="number"
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter priority"
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
                />
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
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingRule ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
