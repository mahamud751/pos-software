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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div
          ref={receiptRef}
          className="bg-white p-6 font-mono text-sm"
          style={{ fontFamily: "monospace" }}
        >
          <div className="text-center border-b border-gray-300 pb-4 mb-4">
            <h1 className="text-lg font-bold">{business.name}</h1>
            <p className="text-xs">{business.address}</p>
            <p className="text-xs">
              {business.phone} | {business.email}
            </p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between">
              <span>Invoice:</span>
              <span className="font-medium">{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formatDate(sale.createdAt)}</span>
            </div>
          </div>

          <div className="border-t border-b border-gray-300 py-2 mb-4">
            <div className="flex justify-between font-bold mb-1">
              <span>Item</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
            </div>
            {sale.items.map((item) => (
              <div key={item.id} className="mb-1">
                <div className="flex justify-between">
                  <span className="truncate max-w-[80px]">{item.name}</span>
                  <span>{item.quantity}</span>
                  <span>${item.unitPrice.toFixed(2)}</span>
                  <span>${item.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-${sale.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${sale.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-300">
              <span>Total:</span>
              <span>${sale.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid:</span>
              <span>${sale.amountPaid.toFixed(2)}</span>
            </div>
            {sale.amountDue > 0 && (
              <div className="flex justify-between font-bold">
                <span>Due:</span>
                <span>${sale.amountDue.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="text-center text-xs mb-4">
            <div className="flex justify-between mb-1">
              <span>Payment Method:</span>
              <span>{sale.paymentMethod}</span>
            </div>
          </div>

          <div className="text-center text-xs pt-4 border-t border-gray-300">
            <p>{business.receiptMessage}</p>
            <p className="mt-1">Thank you for your business!</p>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={printReceipt}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            Print
          </button>
        </div>
      </motion.div>
    </div>
  );
}
