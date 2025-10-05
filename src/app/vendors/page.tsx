"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
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
  }[];
}

export default function VendorsPage() {
  const { showToast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
    commissionRate: 10, // Explicitly a number, not 10 as number
    bankAccount: "",
    taxId: "",
    isActive: true,
    isApproved: false,
  });

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/vendors?page=${currentPage}&limit=10&search=${searchTerm}&status=${statusFilter}`
        );
        const data = await response.json();
        setVendors(data.vendors);
        setTotalPages(data.pagination.pages);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [currentPage, searchTerm, statusFilter]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    console.log("Form input change detected:");
    console.log("- Name:", name);
    console.log("- Value:", value);
    console.log("- Type:", type);
    console.log("- Current formData before update:", formData);

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      console.log("Checkbox change:", name, checked);
      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: checked,
        };
        console.log("Updated formData for checkbox:", newData);
        return newData;
      });
    } else if (name === "commissionRate") {
      // Convert commissionRate to number - ensure it's always a number
      const numericValue = value === "" ? 0 : parseFloat(value) || 0;
      console.log(
        "Commission rate input:",
        value,
        "Converted to:",
        numericValue,
        "Type:",
        typeof numericValue
      );
      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: numericValue,
        };
        console.log("Updated formData for commissionRate:", newData);
        return newData;
      });
    } else {
      console.log("Text input change:", name, value);
      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: value,
        };
        console.log("Updated formData for text input:", newData);
        return newData;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug log to see what data is being sent
    console.log("=== Form Submission Debug ===");
    console.log("Form data being sent:", formData);
    console.log("Commission rate type:", typeof formData.commissionRate);
    console.log("Commission rate value:", formData.commissionRate);

    // Ensure commissionRate is a number before sending
    const finalFormData = {
      ...formData,
      commissionRate:
        typeof formData.commissionRate === "number"
          ? formData.commissionRate
          : parseFloat(formData.commissionRate as unknown as string) || 0,
    };

    console.log("Final form data being sent:", finalFormData);
    console.log(
      "Final commission rate type:",
      typeof finalFormData.commissionRate
    );

    // Check if commissionRate is actually a number
    if (
      typeof finalFormData.commissionRate !== "number" ||
      isNaN(finalFormData.commissionRate)
    ) {
      console.error("ERROR: Commission rate is not a valid number!");
      showToast("Commission rate must be a valid number", "error");
      return;
    }

    try {
      const url = editingVendor
        ? `/api/vendors/${editingVendor.id}`
        : "/api/vendors";

      // Get token from localStorage
      const token = localStorage.getItem("auth-token");
      console.log("Auth token:", token ? "Present" : "Missing");

      const response = await fetch(url, {
        method: editingVendor ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(finalFormData), // Use the validated data
      });

      console.log("API Response status:", response.status);
      console.log("API Response headers:", [...response.headers.entries()]);

      if (response.ok) {
        const vendor = await response.json();
        console.log("Vendor created successfully:", vendor);

        if (editingVendor) {
          setVendors(vendors.map((v) => (v.id === vendor.id ? vendor : v)));
          setEditingVendor(null);
          showToast("Vendor updated successfully!", "success");
        } else {
          setVendors([vendor, ...vendors]);
          showToast("Vendor created successfully!", "success");
        }

        setShowModal(false);
        resetForm();
      } else {
        const error = await response.json();
        console.error("API Error:", error);
        showToast(error.error || "Failed to save vendor", "error");
      }
    } catch (error) {
      console.error("Error saving vendor:", error);
      showToast("An error occurred while saving the vendor", "error");
    }
  };

  // Reset form
  const resetForm = () => {
    console.log("Resetting form to initial state");
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
      commissionRate: 10, // Ensure this is explicitly a number
      bankAccount: "",
      taxId: "",
      isActive: true,
      isApproved: false,
    });
    console.log("Form reset completed. New formData:", {
      name: "",
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
      commissionRate: 10, // Number
      bankAccount: "",
      taxId: "",
      isActive: true,
      isApproved: false,
    });
  };

  // Open modal for adding new vendor
  const openAddModal = () => {
    setEditingVendor(null);
    resetForm();
    setShowModal(true);
  };

  // Open modal for editing vendor
  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address || "",
      contactPerson: vendor.contactPerson,
      commissionRate: vendor.commissionRate, // This should already be a number from the API
      bankAccount: vendor.bankAccount || "",
      taxId: vendor.taxId || "",
      isActive: vendor.isActive,
      isApproved: vendor.isApproved,
    });
    console.log("Edit modal opened with vendor data:", {
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address || "",
      contactPerson: vendor.contactPerson,
      commissionRate: vendor.commissionRate, // Number from API
      bankAccount: vendor.bankAccount || "",
      taxId: vendor.taxId || "",
      isActive: vendor.isActive,
      isApproved: vendor.isApproved,
    });
    setShowModal(true);
  };

  // Delete vendor
  const deleteVendor = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;

    try {
      // Get token from localStorage
      const token = localStorage.getItem("auth-token");

      const response = await fetch(`/api/vendors/${id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        setVendors(vendors.filter((vendor) => vendor.id !== id));
        showToast("Vendor deleted successfully!", "success");
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to delete vendor", "error");
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
      showToast("An error occurred while deleting the vendor", "error");
    }
  };

  // Toggle vendor approval status
  const toggleApproval = async (vendor: Vendor) => {
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
        setVendors(
          vendors.map((v) => (v.id === vendor.id ? updatedVendor : v))
        );
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Vendor
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Search vendors..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>
          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-500">
              Showing {vendors.length} of {vendors.length} vendors
            </span>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-500">Loading vendors...</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No vendors
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new vendor.
            </p>
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openAddModal}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Vendor
              </motion.button>
            </div>
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
                    Vendor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Commission
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Products
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-800 font-medium">
                            {vendor.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {vendor.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vendor.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vendor.contactPerson}
                      </div>
                      <div className="text-sm text-gray-500">
                        {vendor.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vendor.commissionRate}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {
                          vendor.commissions.filter(
                            (c) => c.status === "pending"
                          ).length
                        }{" "}
                        pending
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.vendorProducts.length} products
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          vendor.isActive
                            ? vendor.isApproved
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {vendor.isActive
                          ? vendor.isApproved
                            ? "Active"
                            : "Pending Approval"
                          : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(vendor)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => toggleApproval(vendor)}
                          className={
                            vendor.isApproved
                              ? "text-yellow-600 hover:text-yellow-900"
                              : "text-green-600 hover:text-green-900"
                          }
                        >
                          {vendor.isApproved ? (
                            <XMarkIcon className="h-5 w-5" />
                          ) : (
                            <CheckIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteVendor(vendor.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {vendors.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vendor Modal */}
      {showModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
          <div className="modal-container slide-in p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingVendor ? "Edit Vendor" : "Add Vendor"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingVendor(null);
                }}
                className="text-gray-400 hover:text-gray-500"
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
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Vendor Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="contactPerson"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="commissionRate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  name="commissionRate"
                  id="commissionRate"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.commissionRate}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="bankAccount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bank Account
                </label>
                <input
                  type="text"
                  name="bankAccount"
                  id="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="taxId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tax ID
                </label>
                <input
                  type="text"
                  name="taxId"
                  id="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Active
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="isApproved"
                  name="isApproved"
                  type="checkbox"
                  checked={formData.isApproved}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isApproved"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Approved
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingVendor(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {editingVendor ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
