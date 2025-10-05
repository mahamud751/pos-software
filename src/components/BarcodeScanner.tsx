"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { QrCodeIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({
  onScan,
  onClose,
}: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(true);
  const [barcode, setBarcode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle manual barcode entry
  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      onScan(barcode.trim());
      setBarcode("");
    }
  };

  // Handle keyboard input for barcode scanning
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && barcode.trim()) {
      onScan(barcode.trim());
      setBarcode("");
    }
  };

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="modal-container slide-in p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Scan Barcode</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="text-center py-8">
          <div className="mx-auto bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mb-4">
            <QrCodeIcon className="h-12 w-12 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-6">
            Position the barcode in front of the scanner or enter it manually
          </p>

          <form onSubmit={handleManualEntry} className="space-y-4">
            <div>
              <input
                ref={inputRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={handleKeyDown}
                className="form-input w-full px-4 py-3 text-center text-lg"
                placeholder="Enter barcode"
                autoFocus
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1 px-4 py-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1 px-4 py-3"
              >
                Scan
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Tips</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ensure the barcode is clean and undamaged</li>
            <li>• Hold the scanner 6-8 inches from the barcode</li>
            <li>• Keep the barcode steady while scanning</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
