"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBagIcon,
  UserGroupIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Stat card component with enhanced design
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  change,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  change?: string;
}) => (
  <motion.div
    whileHover={{ y: -10, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100 backdrop-blur-sm glass transition-all duration-300 hover:shadow-xl"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <motion.h3
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-3xl font-bold mt-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
        >
          {value}
        </motion.h3>
        {change && (
          <p
            className={`text-xs mt-2 font-medium ${
              change.startsWith("+") ? "text-green-600" : "text-red-600"
            }`}
          >
            {change} from last week
          </p>
        )}
      </div>
      <motion.div
        whileHover={{ rotate: 10 }}
        className={`p-4 rounded-xl ${color} shadow-md`}
      >
        <Icon className="h-8 w-8 text-white" />
      </motion.div>
    </div>
  </motion.div>
);

// Alert component with enhanced design
const AlertCard = ({ title, message }: { title: string; message: string }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ x: 5 }}
    className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-4 rounded-xl shadow-sm backdrop-blur-sm glass"
  >
    <div className="flex">
      <div className="flex-shrink-0">
        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-bold text-yellow-800">{title}</h3>
        <div className="mt-1 text-sm text-yellow-700">
          <p>{message}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

// Chart component with enhanced design
const SalesChart = ({ data }: { data: { date: string; amount: number }[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center rounded-xl bg-gray-800 bg-opacity-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowTrendingUpIcon className="h-12 w-12 text-gray-500 mx-auto" />
          </motion.div>
          <p className="mt-3 text-gray-400 font-medium">
            No sales data available
          </p>
        </div>
      </div>
    );
  }

  // Find max value for scaling
  const maxValue = Math.max(...data.map((d) => d.amount), 0);
  const minValue = Math.min(...data.map((d) => d.amount), 0);

  // Calculate the range for better visualization
  const range = maxValue - minValue;
  const chartHeight = 180; // Reduced height for better fit

  return (
    <div className="h-64 overflow-x-auto pb-4">
      <div className="flex items-end justify-between h-48 space-x-2 min-w-full px-2">
        {data.map((point, index) => {
          // Calculate bar height as a percentage of the range
          const barHeight =
            range > 0
              ? ((point.amount - minValue) / range) * chartHeight * 0.8 +
                chartHeight * 0.2
              : chartHeight * 0.2;

          // Determine bar color based on value
          let barColor = "bg-gradient-to-t from-cyan-500 to-blue-500";
          if (index > 0) {
            const prevValue = data[index - 1].amount;
            if (point.amount > prevValue) {
              barColor = "bg-gradient-to-t from-green-500 to-emerald-500";
            } else if (point.amount < prevValue) {
              barColor = "bg-gradient-to-t from-red-500 to-orange-500";
            }
          }

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: barHeight }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="flex flex-col items-center flex-shrink-0 group"
            >
              <motion.div
                whileHover={{ scaleY: 1.05 }}
                className={`${barColor} rounded-t-lg hover:opacity-90 transition-all duration-200 cursor-pointer relative shadow-md w-8`}
                style={{
                  height: `${barHeight}px`,
                }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap z-10 shadow-lg border border-gray-700">
                  <div className="font-bold text-sm">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(point.amount)}
                  </div>
                  <div className="text-gray-300 text-xs mt-1">
                    {new Date(point.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </motion.div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="text-xs text-gray-400 mt-2 font-medium"
              >
                {new Date(point.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </motion.span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [summary, setSummary] = useState<{
    sales: { total: number };
    orders: number;
    customers: number;
    suppliers: number;
    inventory: { lowStock: number; expiring: number };
    topProducts: { name: string; total_sold: number }[];
  } | null>(null);
  const [analytics, setAnalytics] = useState<{
    chartData: { date: string; amount: number }[];
    overview: {
      totalSales: number;
      totalOrders: number;
      totalCustomers: number;
      totalProducts: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch("/api/dashboard/summary");
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      }
    };

    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics?period=30d");
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    const fetchAlerts = async () => {
      try {
        const response = await fetch("/api/inventory/alerts?limit=5");
        const data = await response.json();
        setInventoryAlerts(data);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };

    Promise.all([fetchSummary(), fetchAnalytics(), fetchAlerts()]).finally(() =>
      setLoading(false)
    );
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Make formatCurrency available to child components
  const chartFormatter = formatCurrency;

  const stats = summary
    ? [
        {
          title: "Total Sales",
          value: formatCurrency(summary.sales.total),
          icon: CurrencyDollarIcon,
          color: "bg-gradient-to-br from-green-500 to-emerald-600",
          change: "+12.5%",
        },
        {
          title: "Orders",
          value: summary.orders.toString(),
          icon: ShoppingBagIcon,
          color: "bg-gradient-to-br from-blue-500 to-indigo-600",
          change: "+8.2%",
        },
        {
          title: "Customers",
          value: summary.customers.toString(),
          icon: UserGroupIcon,
          color: "bg-gradient-to-br from-purple-500 to-fuchsia-600",
          change: "+3.1%",
        },
        {
          title: "Suppliers",
          value: summary.suppliers.toString(),
          icon: TruckIcon,
          color: "bg-gradient-to-br from-orange-500 to-amber-600",
          change: "+1.8%",
        },
      ]
    : [];

  const alerts = summary
    ? [
        {
          title: "Low Stock Alert",
          message: `${summary.inventory.lowStock} products are running low on stock`,
        },
        {
          title: "Expiring Soon",
          message: `${summary.inventory.expiring} products will expire in the next 7 days`,
        },
      ]
    : [];

  const topProducts = summary?.topProducts || [];
  const chartData = analytics?.chartData || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Animated background elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 -right-20 w-80 h-80 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-10 blur-3xl"
        />
      </div>

      {/* Header with enhanced design */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-8 shadow-xl"
      >
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <motion.div
            animate={{ x: [0, 100, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 -left-20 w-64 h-64 bg-white bg-opacity-10 rounded-full"
          />
          <motion.div
            animate={{ x: [0, -100, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-10 -right-20 w-48 h-48 bg-white bg-opacity-10 rounded-full"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold text-zinc-800"
            >
              Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-lg text-zinc-800"
            >
              Welcome back! Here&apos;s what&apos;s happening today.
            </motion.p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 md:mt-0 bg-white text-green-700 px-6 py-3 rounded-xl flex items-center font-bold shadow-lg hover:bg-gray-100 transition-all duration-200"
          >
            <ShoppingBagIcon className="h-6 w-6 mr-2" />
            New Sale
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid with enhanced animations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index + 0.3 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts and Alerts with enhanced design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart - Enhanced Sales Overview Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Sales Overview
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Track your revenue and growth metrics
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors text-gray-700 flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                Week
              </button>
              <button className="text-xs px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium shadow-md flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                Month
              </button>
              <button className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors text-gray-700 flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                Year
              </button>
            </div>
          </div>

          {/* Chart Header Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-gray-600 text-xs">Total Revenue</p>
              <p className="text-gray-800 font-bold text-base">
                {analytics?.overview.totalSales
                  ? formatCurrency(analytics.overview.totalSales)
                  : "$0"}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-green-600 text-xs font-medium flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 15l7-7 7 7"
                    ></path>
                  </svg>
                  {analytics?.overview.totalSales &&
                  analytics.overview.totalSales > 0
                    ? "+12.5%"
                    : "0%"}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-gray-600 text-xs">Avg. Order</p>
              <p className="text-gray-800 font-bold text-base">
                {analytics &&
                analytics.overview.totalOrders > 0 &&
                analytics.overview.totalSales > 0
                  ? formatCurrency(
                      analytics.overview.totalSales /
                        analytics.overview.totalOrders
                    )
                  : "$0"}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-green-600 text-xs font-medium flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 15l7-7 7 7"
                    ></path>
                  </svg>
                  {analytics && analytics.overview.totalOrders > 0
                    ? "+4.2%"
                    : "0%"}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-gray-600 text-xs">Transactions</p>
              <p className="text-gray-800 font-bold text-base">
                {analytics?.overview.totalOrders || 0}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-red-500 text-xs font-medium flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                  {analytics?.overview.totalOrders &&
                  analytics.overview.totalOrders > 0
                    ? "-1.8%"
                    : "0%"}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-gray-600 text-xs">Conversion</p>
              <p className="text-gray-800 font-bold text-base">
                {analytics && analytics.overview.totalCustomers > 0
                  ? `${(
                      (analytics.overview.totalOrders /
                        analytics.overview.totalCustomers) *
                      100
                    ).toFixed(2)}%`
                  : "0%"}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-green-600 text-xs font-medium flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 15l7-7 7 7"
                    ></path>
                  </svg>
                  {analytics &&
                  analytics.overview.totalCustomers &&
                  analytics.overview.totalCustomers > 0
                    ? "+0.7%"
                    : "0%"}
                </span>
              </div>
            </div>
          </div>

          {/* Main Chart */}
          <SalesChart data={chartData} />

          {/* Chart Footer */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600 text-xs">Revenue</span>
            </div>
            <div className="text-gray-500 text-xs">Updated just now</div>
          </div>
        </motion.div>

        {/* Alerts and Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          {/* Alerts */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100 backdrop-blur-sm glass">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {inventoryAlerts.length > 0 ? (
                inventoryAlerts.map((alert, index) => (
                  <AlertCard
                    key={index}
                    title={alert.title}
                    message={alert.message}
                  />
                ))
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">
                    No alerts at this time
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100 backdrop-blur-sm glass">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Top Selling Products
            </h2>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.7 }}
                    className="flex justify-between items-center p-3 bg-white bg-opacity-50 rounded-xl hover:bg-opacity-75 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-purple-700 font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-gray-800 font-medium">
                        {product.name}
                      </span>
                    </div>
                    <span className="font-bold text-green-600">
                      {product.total_sold} sold
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">
                    No top products data
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
