"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Communication {
  id: number;
  type: string;
  subject: string | null;
  content: string;
  direction: string;
  createdAt: string;
  customer: {
    name: string;
  };
}

export default function CustomerCommunicationsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [communicationType, setCommunicationType] = useState("email");
  const [communicationSubject, setCommunicationSubject] = useState("");
  const [communicationContent, setCommunicationContent] = useState("");
  const [communicationDirection, setCommunicationDirection] =
    useState("outbound");
  const [error, setError] = useState("");

  // Fetch customer details
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customers/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setCustomer(data);
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      }
    };

    const fetchCommunications = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/customers/${params.id}/communications?page=${currentPage}`
        );
        const data = await response.json();
        setCommunications(data.communications);
        setTotalPages(data.pagination.pages);
      } catch (error) {
        console.error("Error fetching communications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
    fetchCommunications();
  }, [params.id, currentPage]);

  // Handle create communication
  const handleCreateCommunication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        `/api/customers/${params.id}/communications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: communicationType,
            subject: communicationSubject,
            content: communicationContent,
            direction: communicationDirection,
          }),
        }
      );

      if (response.ok) {
        // Refresh communications list
        const response = await fetch(
          `/api/customers/${params.id}/communications?page=${currentPage}`
        );
        const data = await response.json();
        setCommunications(data.communications);
        setTotalPages(data.pagination.pages);

        // Reset form and close modal
        setShowModal(false);
        setCommunicationType("email");
        setCommunicationSubject("");
        setCommunicationContent("");
        setCommunicationDirection("outbound");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create communication");
      }
    } catch (error) {
      console.error("Error creating communication:", error);
      setError("An error occurred while creating communication");
    }
  };

  // Get communication icon
  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case "email":
        return (
          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        );
      case "sms":
        return (
          <div className="bg-green-100 text-green-600 p-2 rounded-full">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 18h8a2 2 0 002-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 2H8a2 2 0 00-2 2v16l4-4h8a2 2 0 002-2V4a2 2 0 00-2-2z"
              />
            </svg>
          </div>
        );
      case "phone":
        return (
          <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 text-gray-600 p-2 rounded-full">
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
          </div>
        );
    }
  };

  // Get direction badge
  const getDirectionBadge = (direction: string) => {
    if (direction === "inbound") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Inbound
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Outbound
        </span>
      );
    }
  };

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => router.push(`/customers/${params.id}`)}
          className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Communications with {customer.name}
          </h1>
          <p className="text-gray-500">
            {customer.email} • {customer.phone}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Communication History
          </h2>
          <p className="text-gray-500">All interactions with this customer</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <PaperAirplaneIcon className="h-5 w-5 mr-2" />
          New Communication
        </motion.button>
      </div>

      {/* Communications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-500">Loading communications...</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {communications.length === 0 ? (
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No communications
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new communication.
                  </p>
                </div>
              ) : (
                communications.map((communication) => (
                  <div key={communication.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start">
                      {getCommunicationIcon(communication.type)}
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {communication.subject || "No subject"}
                          </h3>
                          {getDirectionBadge(communication.direction)}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {communication.content}
                        </div>
                        <div className="mt-2 flex items-center text-xs text-gray-400">
                          <span>
                            {new Date(communication.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
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

      {/* New Communication Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              New Communication
            </h2>
            <form onSubmit={handleCreateCommunication}>
              <div className="mb-4">
                <label
                  htmlFor="communicationType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Type
                </label>
                <select
                  id="communicationType"
                  value={communicationType}
                  onChange={(e) => setCommunicationType(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="phone">Phone Call</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="communicationDirection"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Direction
                </label>
                <select
                  id="communicationDirection"
                  value={communicationDirection}
                  onChange={(e) => setCommunicationDirection(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="communicationSubject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="communicationSubject"
                  value={communicationSubject}
                  onChange={(e) => setCommunicationSubject(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter subject"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="communicationContent"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Content
                </label>
                <textarea
                  id="communicationContent"
                  value={communicationContent}
                  onChange={(e) => setCommunicationContent(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter communication content"
                  required
                />
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
                  Send
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
