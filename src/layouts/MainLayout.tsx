"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  TruckIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  TagIcon,
  CubeIcon,
  BuildingStorefrontIcon,
  GiftIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ReceiptPercentIcon,
  UserCircleIcon,
  ShoppingCartIcon,
  ArchiveBoxIcon,
  ChartPieIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import AnimationWrapper from "@/components/AnimationWrapper";
import { ToastProvider } from "@/context/ToastContext";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface MainLayoutProps {
  children: ReactNode;
}

// Colorful icon mapping for each navigation item
const iconColors: Record<string, string> = {
  Dashboard: "text-blue-500",
  Sales: "text-green-500",
  Products: "text-purple-500",
  Brands: "text-indigo-500",
  Categories: "text-pink-500",
  Units: "text-yellow-500",
  Customers: "text-red-500",
  "Customer Segments": "text-orange-500",
  Campaigns: "text-teal-500",
  Coupons: "text-cyan-500",
  Deliveries: "text-lime-500",
  "Fraud Detection": "text-rose-500",
  Payments: "text-emerald-500",
  "Pricing Rules": "text-violet-500",
  "Discount Rules": "text-fuchsia-500",
  Suppliers: "text-amber-500",
  "Purchase Orders": "text-sky-500",
  Warehouses: "text-blue-400",
  Vendors: "text-indigo-600",
  Reports: "text-green-400",
  Settings: "text-gray-500",
};

// Updated navigation with unique icons
const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Sales", href: "/sales", icon: ShoppingCartIcon },
  { name: "Products", href: "/products", icon: CubeIcon },
  { name: "Brands", href: "/brands", icon: BuildingStorefrontIcon },
  { name: "Categories", href: "/categories", icon: TagIcon },
  { name: "Units", href: "/units", icon: ArchiveBoxIcon },
  { name: "Customers", href: "/customers", icon: UserGroupIcon },
  {
    name: "Customer Segments",
    href: "/customer-segments",
    icon: UserCircleIcon,
  },
  { name: "Campaigns", href: "/campaigns", icon: GiftIcon },
  { name: "Coupons", href: "/coupons", icon: ReceiptPercentIcon },
  { name: "Deliveries", href: "/deliveries", icon: TruckIcon },
  { name: "Fraud Detection", href: "/fraud-detection", icon: ShieldCheckIcon },
  { name: "Payments", href: "/payments", icon: CreditCardIcon },
  { name: "Pricing Rules", href: "/pricing-rules", icon: ChartPieIcon },
  { name: "Discount Rules", href: "/discount-rules", icon: BellAlertIcon },
  { name: "Suppliers", href: "/suppliers", icon: TruckIcon },
  { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCartIcon },
  { name: "Warehouses", href: "/warehouses", icon: ArchiveBoxIcon },
  { name: "Vendors", href: "/vendors", icon: BuildingStorefrontIcon },
  { name: "Reports", href: "/reports", icon: ChartBarIcon },
  { name: "Settings", href: "/settings", icon: CogIcon },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      // If we're on the login page, no need to check auth
      if (pathname === "/login") {
        setLoading(false);
        return;
      }

      // Check if user data exists in localStorage
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("auth-token");

      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setLoading(false);
          return;
        } catch (e) {
          // If parsing fails, clear localStorage
          localStorage.removeItem("user");
          localStorage.removeItem("auth-token");
        }
      }

      // If no stored data, redirect to login
      router.push("/login");
      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear localStorage on logout
      localStorage.removeItem("user");
      localStorage.removeItem("auth-token");
      setUser(null);
      router.push("/login");
    }
  };

  // Don't show layout on login page
  if (pathname === "/login") {
    return <AnimationWrapper>{children}</AnimationWrapper>;
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null; // Router.push in useEffect will handle redirection
  }

  return (
    <ToastProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
          className={`bg-white shadow-lg flex flex-col transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-xl font-bold text-green-700">
                    GroceryPOS
                  </h1>
                  <p className="text-xs text-gray-500">Modern Point of Sale</p>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={sidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                />
              </svg>
            </button>
          </div>

          {/* Scrollable navigation area */}
          <nav className="flex-1 overflow-y-auto py-2 px-2">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const colorClass = iconColors[item.name] || "text-gray-500";

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`${colorClass} ${
                          isActive ? "text-white" : ""
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </motion.div>
                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className={`ml-3 font-medium ${
                              isActive ? "text-white" : "text-gray-700"
                            }`}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </motion.div>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3 font-medium"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  Dashboard
                </h1>
                <p className="text-xs text-gray-500">
                  Welcome back, {user?.name || "Admin"}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <svg
                    className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || "A"}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <AnimationWrapper>{children}</AnimationWrapper>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
