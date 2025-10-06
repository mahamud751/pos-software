"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BuildingStorefrontIcon,
  PrinterIcon,
  BellIcon,
  GlobeAltIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

const tabs = [
  { id: "general", name: "General", icon: BuildingStorefrontIcon },
  { id: "receipt", name: "Receipt", icon: PrinterIcon },
  { id: "notifications", name: "Notifications", icon: BellIcon },
  { id: "localization", name: "Localization", icon: GlobeAltIcon },
  { id: "payment", name: "Payment", icon: CreditCardIcon },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your system preferences and configurations
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Business Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="businessName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Business Name
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    defaultValue="Fresh Market Grocery"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="businessPhone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="businessPhone"
                    defaultValue="(555) 123-4567"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="businessAddress"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address
                  </label>
                  <textarea
                    id="businessAddress"
                    rows={3}
                    defaultValue="123 Main Street, City, State 12345"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="taxRate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Default Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    id="taxRate"
                    step="0.01"
                    defaultValue="8.5"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="currency"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Currency
                  </label>
                  <select
                    id="currency"
                    defaultValue="USD"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                    <option value="CAD">Canadian Dollar (CAD)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Receipt Settings */}
          {activeTab === "receipt" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Receipt Configuration
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Print Receipts
                    </h3>
                    <p className="text-sm text-gray-500">
                      Automatically print receipts after each sale
                    </p>
                  </div>
                  <button
                    type="button"
                    className="bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Email Receipts
                    </h3>
                    <p className="text-sm text-gray-500">
                      Send digital receipts to customers
                    </p>
                  </div>
                  <button
                    type="button"
                    className="bg-green-600 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                  </button>
                </div>

                <div>
                  <label
                    htmlFor="receiptMessage"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Footer Message
                  </label>
                  <textarea
                    id="receiptMessage"
                    rows={3}
                    defaultValue="Thank you for shopping with us! Please come again."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="receiptLogo"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Logo (Optional)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Notification Preferences
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Low Stock Alerts
                    </h3>
                    <p className="text-sm text-gray-500">
                      Get notified when inventory is running low
                    </p>
                  </div>
                  <button
                    type="button"
                    className="bg-green-600 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Expiry Date Alerts
                    </h3>
                    <p className="text-sm text-gray-500">
                      Get notified about expiring products
                    </p>
                  </div>
                  <button
                    type="button"
                    className="bg-green-600 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Daily Summary
                    </h3>
                    <p className="text-sm text-gray-500">
                      Receive daily sales summary via email
                    </p>
                  </div>
                  <button
                    type="button"
                    className="bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Localization Settings */}
          {activeTab === "localization" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Localization
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="language"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Language
                  </label>
                  <select
                    id="language"
                    defaultValue="en"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="timezone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    defaultValue="America/New_York"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">
                      Pacific Time (PT)
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="dateFormat"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date Format
                  </label>
                  <select
                    id="dateFormat"
                    defaultValue="MM/DD/YYYY"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="timeFormat"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Time Format
                  </label>
                  <select
                    id="timeFormat"
                    defaultValue="12h"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="12h">12-hour clock</option>
                    <option value="24h">24-hour clock</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment Settings */}
          {activeTab === "payment" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Methods
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <svg
                        className="h-6 w-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        Credit Card
                      </h3>
                      <p className="text-sm text-gray-500">
                        Accept all major credit cards
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bg-green-600 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <svg
                        className="h-6 w-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        Cash
                      </h3>
                      <p className="text-sm text-gray-500">
                        Accept cash payments
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bg-green-600 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <svg
                        className="h-6 w-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        Mobile Payments
                      </h3>
                      <p className="text-sm text-gray-500">
                        Apple Pay, Google Pay, etc.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Changes
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
