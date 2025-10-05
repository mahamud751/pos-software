"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface CustomerSegment {
  id: number;
  name: string;
  criteria: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    customerSegmentMembers: number;
  };
}

export default function CustomerSegmentsPage() {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<CustomerSegment | null>(
    null
  );
  const [segmentName, setSegmentName] = useState("");
  const [segmentCriteria, setSegmentCriteria] = useState("");
  const [error, setError] = useState("");

  // Fetch customer segments
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/customer-segments?page=${currentPage}&search=${searchTerm}`
        );
        const data = await response.json();
        setSegments(data.segments);
        setTotalPages(data.pagination.pages);
      } catch (error) {
        console.error("Error fetching customer segments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, [currentPage, searchTerm]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const segmentData = {
        name: segmentName,
        criteria: segmentCriteria,
      };

      if (editingSegment) {
        // Update existing segment
        const response = await fetch(
          `/api/customer-segments/${editingSegment.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(segmentData),
          }
        );

        if (response.ok) {
          const updatedSegment = await response.json();
          setSegments(
            segments.map((s) =>
              s.id === updatedSegment.id
                ? { ...updatedSegment, _count: s._count }
                : s
            )
          );
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to update segment");
          return;
        }
      } else {
        // Create new segment
        const response = await fetch("/api/customer-segments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(segmentData),
        });

        if (response.ok) {
          const newSegment = await response.json();
          setSegments([
            ...segments,
            { ...newSegment, _count: { customerSegmentMembers: 0 } },
          ]);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to create segment");
          return;
        }
      }

      // Reset form and close modal
      setShowModal(false);
      setEditingSegment(null);
      setSegmentName("");
      setSegmentCriteria("");
    } catch (error) {
      console.error("Error saving segment:", error);
      setError("An error occurred while saving the segment");
    }
  };

  // Handle edit segment
  const handleEdit = (segment: CustomerSegment) => {
    setEditingSegment(segment);
    setSegmentName(segment.name);
    setSegmentCriteria(segment.criteria);
    setShowModal(true);
  };

  // Handle delete segment
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer segment?"))
      return;

    try {
      const response = await fetch(`/api/customer-segments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSegments(segments.filter((segment) => segment.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete segment");
      }
    } catch (error) {
      console.error("Error deleting segment:", error);
      alert("An error occurred while deleting the segment");
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingSegment(null);
    setSegmentName("");
    setSegmentCriteria("");
    setError("");
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Segments
          </h1>
          <p className="text-gray-500 mt-1">
            Manage customer segments and targeting criteria
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Segment
        </motion.button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Search customer segments..."
          />
        </div>
      </div>

      {/* Segments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-500">Loading customer segments...</p>
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
                      Criteria
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Members
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Created
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
                  {segments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No customer segments found
                      </td>
                    </tr>
                  ) : (
                    segments.map((segment) => (
                      <tr key={segment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {segment.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {segment.criteria}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {segment._count.customerSegmentMembers}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(segment.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              (window.location.href = `/customer-segments/${segment.id}`)
                            }
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            <UserGroupIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(segment)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(segment.id)}
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
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-container slide-in p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingSegment
                ? "Edit Customer Segment"
                : "Add New Customer Segment"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="segmentName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Segment Name
                </label>
                <input
                  type="text"
                  id="segmentName"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter segment name"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="segmentCriteria"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Criteria (JSON)
                </label>
                <textarea
                  id="segmentCriteria"
                  value={segmentCriteria}
                  onChange={(e) => setSegmentCriteria(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder='{"minLoyaltyPoints": 100, "minPurchaseAmount": 500}'
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter JSON criteria for segment membership
                </p>
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
                  {editingSegment ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
