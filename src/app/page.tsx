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

// Stat card component
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
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {change && (
          <p
            className={`text-xs mt-2 ${
              change.startsWith("+") ? "text-green-600" : "text-red-600"
            }`}
          >
            {change} from last week
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </motion.div>
);

// Alert component
const AlertCard = ({ title, message }: { title: string; message: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg"
  >
    <div className="flex">
      <div className="flex-shrink-0">
        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-yellow-800">{title}</h3>
        <div className="mt-2 text-sm text-yellow-700">
          <p>{message}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [summary, setSummary] = useState<{
    sales: { total: number };
    orders: number;
    customers: number;
    suppliers: number;
    inventory: { lowStock: number; expiring: number };
    topProducts: { name: string; total_sold: number }[];
  } | null>(null);
  const [_loading, setLoading] = useState(true);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch("/api/dashboard/summary");
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      } finally {
        setLoading(false);
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

    fetchSummary();
    fetchAlerts();
  }, []);

  // Mock data for when API is not available
  const mockStats = [
    {
      title: "Total Sales",
      value: "$12,450",
      icon: CurrencyDollarIcon,
      color: "bg-green-500",
      change: "+12.5%",
    },
    {
      title: "Orders",
      value: "145",
      icon: ShoppingBagIcon,
      color: "bg-blue-500",
      change: "+8.2%",
    },
    {
      title: "Customers",
      value: "1,240",
      icon: UserGroupIcon,
      color: "bg-purple-500",
      change: "+3.1%",
    },
    {
      title: "Suppliers",
      value: "42",
      icon: TruckIcon,
      color: "bg-orange-500",
      change: "+1.8%",
    },
  ];

  const mockAlerts = [
    {
      title: "Low Stock Alert",
      message: "5 products are running low on stock",
    },
    {
      title: "Expiring Soon",
      message: "3 products will expire in the next 3 days",
    },
  ];

  const mockTopProducts = [
    { name: "Organic Bananas", sales: 124 },
    { name: "Whole Grain Bread", sales: 98 },
    { name: "Free Range Eggs", sales: 87 },
    { name: "Greek Yogurt", sales: 76 },
  ];

  const stats = summary
    ? [
        {
          title: "Total Sales",
          value: `$${summary.sales.total.toFixed(2)}`,
          icon: CurrencyDollarIcon,
          color: "bg-green-500",
          change: "+12.5%",
        },
        {
          title: "Orders",
          value: summary.orders.toString(),
          icon: ShoppingBagIcon,
          color: "bg-blue-500",
          change: "+8.2%",
        },
        {
          title: "Customers",
          value: summary.customers.toString(),
          icon: UserGroupIcon,
          color: "bg-purple-500",
          change: "+3.1%",
        },
        {
          title: "Suppliers",
          value: summary.suppliers.toString(),
          icon: TruckIcon,
          color: "bg-orange-500",
          change: "+1.8%",
        },
      ]
    : mockStats;

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
    : mockAlerts;

  const topProducts = summary?.topProducts || mockTopProducts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <ShoppingBagIcon className="h-5 w-5 mr-2" />
          New Sale
        </motion.button>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Sales Overview
            </h2>
            <div className="flex space-x-2">
              <button className="text-xs px-3 py-1 bg-gray-100 rounded-lg">
                Week
              </button>
              <button className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg">
                Month
              </button>
              <button className="text-xs px-3 py-1 bg-gray-100 rounded-lg">
                Year
              </button>
            </div>
          </div>
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ArrowTrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="mt-2 text-gray-500">Sales chart visualization</p>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Notifications
            </h2>
            <div className="space-y-4">
              {inventoryAlerts.map((alert, index) => (
                <AlertCard
                  key={index}
                  title={alert.title}
                  message={alert.message}
                />
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Top Selling Products
            </h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{product.name}</span>
                  <span className="font-medium">
                    {"total_sold" in product
                      ? product.total_sold
                      : product.sales || 0}{" "}
                    sold
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
