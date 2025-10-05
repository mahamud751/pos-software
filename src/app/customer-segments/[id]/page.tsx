"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  UserIcon,
  UserPlusIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";

interface CustomerSegment {
  id: number;
  name: string;
  criteria: string;
  createdAt: string;
  updatedAt: string;
  customerSegmentMembers: {
    id: number;
    joinedAt: string;
    customer: {
      id: number;
      name: string;
      email: string;
      phone: string;
      loyaltyPoints: number;
    };
  }[];
}

export default function CustomerSegmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [segment, setSegment] = useState<CustomerSegment | null>(null);
  const [loading, setLoading] = useState(true);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [error, setError] = useState("");

  // Fetch segment details
  useEffect(() => {
    const fetchSegment = async () => {
      try {
        const response = await fetch(`/api/customer-segments/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setSegment(data);
        }
      } catch (error) {
        console.error("Error fetching segment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSegment();
  }, [params.id]);

  // Fetch all customers for the add customer modal
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customers");
        const data = await response.json();
        setAllCustomers(data.customers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    if (showAddCustomerModal) {
      fetchCustomers();
    }
  }, [showAddCustomerModal]);

  // Handle add customer to segment
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // In a real implementation, you would add the customer to the segment
      // For now, we'll just show a success message
      alert("Customer would be added to segment in a real implementation");

      // Close modal
      setShowAddCustomerModal(false);
      setSelectedCustomerId("");
    } catch (error) {
      console.error("Error adding customer to segment:", error);
      setError("An error occurred while adding customer to segment");
    }
  };

  // Handle remove customer from segment
  const handleRemoveCustomer = async (customerId: number) => {
    if (
      !confirm(
        "Are you sure you want to remove this customer from the segment?"
      )
    )
      return;

    try {
      // In a real implementation, you would remove the customer from the segment
      // For now, we'll just show a success message
      alert("Customer would be removed from segment in a real implementation");
    } catch (error) {
      console.error("Error removing customer from segment:", error);
      alert("An error occurred while removing customer from segment");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!segment) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Segment not found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The customer segment you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => router.push("/customer-segments")}
          className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{segment.name}</h1>
          <p className="text-gray-500">Customer Segment</p>
        </div>
      </div>

      {/* Segment Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Members</h3>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {segment.customerSegmentMembers.length}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created</h3>
            <p className="mt-1 text-sm font-medium">
              {new Date(segment.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
            <p className="mt-1 text-sm font-medium">
              {new Date(segment.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500">Criteria</h3>
          <pre className="mt-1 text-sm bg-gray-50 p-3 rounded-lg overflow-x-auto">
            {segment.criteria}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Segment Members</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddCustomerModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add Customer
        </motion.button>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {segment.customerSegmentMembers.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="h-12 w-12 text-gray-300 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No members
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This segment doesn't have any customers yet.
            </p>
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
                    Customer
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
                    Loyalty Points
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Joined
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
                {segment.customerSegmentMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {member.customer.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {member.customer.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {member.customer.loyaltyPoints}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveCustomer(member.customer.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <UserMinusIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Add Customer to Segment
            </h2>
            <form onSubmit={handleAddCustomer}>
              <div className="mb-4">
                <label
                  htmlFor="customerId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Customer
                </label>
                <select
                  id="customerId"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a customer</option>
                  {allCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add to Segment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
