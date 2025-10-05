"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { PrinterIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ReceiptItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ReceiptProps {
  sale: {
    id: number;
    invoiceNumber: string;
    createdAt: string;
    subtotal: number;
    taxAmount: number;
    discount: number;
    totalAmount: number;
    amountPaid: number;
    amountDue: number;
    paymentMethod: string;
    items: ReceiptItem[];
  };
  business: {
    name: string;
    address: string;
    phone: string;
    email: string;
    receiptMessage: string;
  };
  onClose: () => void;
  onPrint: () => void;
}

export default function Receipt({
  sale,
  business,
  onClose,
  onPrint,
}: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const printReceipt = () => {
    onPrint();
    // In a real implementation, this would trigger the browser's print dialog
    // or connect to a physical receipt printer
    window.print();
  };

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
        className="modal-container slide-in p-6 w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100"
      >
        <div className="flex justify-between items-center mb-4">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-gray-800"
          >
            Receipt
          </motion.h2>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          ref={receiptRef}
          className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="text-center border-b border-gray-300 pb-4 mb-4">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-gray-800"
            >
              {business.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-gray-600 mt-1"
            >
              {business.address}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-600"
            >
              {business.phone} | {business.email}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-4"
          >
            <div className="flex justify-between text-gray-700 mb-1">
              <span className="font-medium">Invoice:</span>
              <span className="font-semibold text-gray-800">
                {sale.invoiceNumber}
              </span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Date:</span>
              <span className="text-gray-800">
                {formatDate(sale.createdAt)}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="border-t border-b border-gray-300 py-3 mb-4"
          >
            <div className="flex justify-between font-bold text-gray-800 mb-2">
              <span>Item</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
            </div>
            {sale.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="mb-2"
              >
                <div className="flex justify-between text-gray-700">
                  <span className="truncate max-w-[80px]">{item.name}</span>
                  <span>{item.quantity}</span>
                  <span>${item.unitPrice.toFixed(2)}</span>
                  <span className="font-medium text-gray-800">
                    ${item.totalPrice.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-2 mb-4"
          >
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Subtotal:</span>
              <span>${sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-gray-700">
                <span className="font-medium">Discount:</span>
                <span className="text-green-600">
                  -${sale.discount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Tax:</span>
              <span>${sale.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300 text-gray-800">
              <span>Total:</span>
              <span>${sale.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Paid:</span>
              <span className="text-green-600">
                ${sale.amountPaid.toFixed(2)}
              </span>
            </div>
            {sale.amountDue > 0 && (
              <div className="flex justify-between font-bold text-gray-800">
                <span>Due:</span>
                <span className="text-red-600">
                  ${sale.amountDue.toFixed(2)}
                </span>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="text-center text-sm mb-4"
          >
            <div className="flex justify-between mb-1 text-gray-700">
              <span className="font-medium">Payment Method:</span>
              <span className="font-semibold text-gray-800">
                {sale.paymentMethod}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="text-center text-sm pt-4 border-t border-gray-300"
          >
            <p className="text-gray-600">{business.receiptMessage}</p>
            <p className="mt-1 text-gray-700 font-medium">
              Thank you for your business!
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex space-x-3 mt-6"
        >
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 shadow-md transition-all duration-200 font-medium"
          >
            Close
          </button>
          <button
            onClick={printReceipt}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-md transition-all duration-200 font-medium flex items-center justify-center"
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            Print
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
