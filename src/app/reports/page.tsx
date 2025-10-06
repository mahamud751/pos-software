"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

interface AnalyticsData {
  salesAnalytics: SalesAnalytic[];
  customerAnalytics: CustomerAnalytic[];
  topProducts: ProductAnalytic[];
  overview: {
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
  };
  chartData: ChartDataPoint[];
}

interface SalesAnalytic {
  id: number;
  date: string;
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  topProducts: string;
  topCategories: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerAnalytic {
  id: number;
  date: string;
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerSegments: string;
  topCustomerSegments: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductAnalytic {
  id: number;
  date: string;
  productId: number;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  stockTurnover: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    name: string;
  };
}

interface ChartDataPoint {
  date: string;
  amount: number;
}

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");
  const [error, setError] = useState("");

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics?period=${period}`);
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Business Analytics
          </h1>
          <p className="text-gray-500 mt-1">
            Track your business performance and key metrics
          </p>
        </div>
        <div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.overview.totalSales)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.totalOrders}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.totalCustomers}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CubeIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.totalProducts}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h2>
        <div className="h-80">
          {analytics.chartData.length > 0 ? (
            <div className="flex items-end h-64 space-x-2 overflow-x-auto">
              {analytics.chartData.map((point, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-8 bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                    style={{
                      height: `${Math.max(
                        10,
                        (point.amount /
                          Math.max(
                            ...analytics.chartData.map((p) => p.amount)
                          )) *
                          200
                      )}px`,
                    }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">
                    {new Date(point.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No sales data available for the selected period
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Top Selling Products
          </h2>
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
                  Units Sold
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No product data available
                  </td>
                </tr>
              ) : (
                analytics.topProducts.map((productAnalytic) => (
                  <tr key={productAnalytic.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {productAnalytic.product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {productAnalytic.totalSold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(productAnalytic.totalRevenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
