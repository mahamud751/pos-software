"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  TagIcon,
  CalculatorIcon,
  PrinterIcon,
  CreditCardIcon,
  ArrowPathIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import BarcodeScanner from "@/components/BarcodeScanner";
import Receipt from "@/components/Receipt";
import StripePaymentModal from "@/components/StripePaymentModal";
import { useToast } from "@/context/ToastContext";

// Product interface
interface Product {
  id: number;
  name: string;
  sellingPrice: number;
  category: { name: string };
  stock: number;
  unit: { symbol: string };
  barcode: string;
}

// Cart item interface
interface CartItem extends Product {
  quantity: number;
}

// Sale interface
interface Sale {
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
  saleItems: {
    id: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product: {
      name: string;
    };
  }[];
}

// Receipt Sale interface
interface ReceiptSale {
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
  items: {
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

export default function SalesPage() {
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [completedSale, setCompletedSale] = useState<ReceiptSale | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products?query=${searchTerm}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm]);

  // Handle barcode scan
  const handleBarcodeScan = async (barcode: string) => {
    try {
      const response = await fetch(`/api/products?query=${barcode}`);
      const data = await response.json();

      if (data.length > 0) {
        addToCart(data[0]);
        setShowScanner(false);
        showToast("Product added to cart", "success");
      } else {
        showToast("Product not found for this barcode", "error");
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);
      showToast("Error scanning barcode. Please try again.", "error");
    }
  };

  // Add item to cart
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Handle payment
  const handlePayment = async (paymentMethod: string) => {
    try {
      const saleData = {
        userId: 1, // In a real app, this would come from the authenticated user
        customerId: null,
        invoiceNumber: `INV-${Date.now()}`,
        subtotal: subtotal,
        taxAmount: tax,
        discount: 0,
        totalAmount: total,
        amountPaid: paymentMethod === "Cash" ? total : 0,
        amountDue: paymentMethod === "Cash" ? 0 : total,
        paymentMethod: paymentMethod,
        status: paymentMethod === "Cash" ? "completed" : "pending",
        notes: "",
        saleItems: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
          totalPrice: item.sellingPrice * item.quantity,
        })),
      };

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        const sale: Sale = await response.json();

        // Validate that the required data is present
        if (!sale || !sale.id) {
          throw new Error("Invalid sale data received from server");
        }

        const receiptSale: ReceiptSale = {
          id: sale.id,
          invoiceNumber: sale.invoiceNumber,
          createdAt: sale.createdAt,
          subtotal: sale.subtotal,
          taxAmount: sale.taxAmount,
          discount: sale.discount,
          totalAmount: sale.totalAmount,
          amountPaid: sale.amountPaid,
          amountDue: sale.amountDue,
          paymentMethod: sale.paymentMethod,
          items:
            sale.saleItems?.map((item) => ({
              id: item.id,
              name: item.product?.name || "Unknown Product",
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })) || [],
        };

        setCompletedSale(receiptSale);
        showToast(
          `Sale ${sale.invoiceNumber} created successfully!`,
          "success"
        );

        if (paymentMethod === "Cash") {
          setShowReceipt(true);
          // Reset cart after payment
          setCart([]);
        } else {
          // For card payments, we'll handle this in the modal
          return sale.id;
        }
      } else {
        // Try to parse error response
        let errorMessage = "Failed to process payment";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || "Please try again.";
        } catch (parseError) {
          // If we can't parse the error, use the status text
          errorMessage = response.statusText || "Please try again.";
        }

        showToast(`Failed to process payment: ${errorMessage}`, "error");
        return null;
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      showToast(
        `An error occurred while processing payment: ${errorMessage}`,
        "error"
      );
      return null;
    }
  };
  // Handle successful card payment
  const handleCardPaymentSuccess = () => {
    if (completedSale) {
      setShowReceipt(true);
      showToast(
        `Payment for sale ${completedSale.invoiceNumber} processed successfully!`,
        "success"
      );
      // Reset cart after payment
      setCart([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with animated background */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 shadow-lg"
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

        <div className="relative z-10 flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-black"
          >
            Sales Terminal
          </motion.h1>
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowScanner(true)}
              className="flex items-center px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-green-700 hover:bg-opacity-30 shadow-sm transition-all duration-200"
            >
              <QrCodeIcon className="h-5 w-5 mr-2" />
              Scan Barcode
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-green-700 hover:bg-opacity-30 shadow-sm transition-all duration-200"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              New Order
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-gray-100 shadow-md transition-all duration-200 font-medium"
            >
              <PrinterIcon className="h-5 w-5 mr-2" />
              Print Receipt
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection - Enhanced with animations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Bar with gradient border */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Search products by name or category..."
              />
            </div>
          </motion.div>

          {/* Product Grid with enhanced cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Products</h2>
              <div className="text-sm text-gray-500">
                {products.length} items available
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"
                />
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{
                      y: -10,
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      scale: 1.03,
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    className="border border-gray-200 rounded-2xl p-4 cursor-pointer transition-all duration-300 bg-gradient-to-br from-white to-gray-50 hover:from-green-50 hover:to-emerald-50 group"
                  >
                    <div className="text-center">
                      <motion.div
                        whileHover={{ rotate: 10 }}
                        className="bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-3 group-hover:from-green-200 group-hover:to-emerald-300 transition-all duration-300"
                      >
                        <TagIcon className="h-8 w-8 text-green-700" />
                      </motion.div>
                      <h3 className="text-sm font-bold text-gray-800 truncate group-hover:text-green-700 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {product.category.name}
                      </p>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        ${product.sellingPrice.toFixed(2)}
                      </p>
                      <div className="flex justify-between items-center mt-3 text-xs">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            product.stock > 5
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock} {product.unit.symbol}
                        </span>
                        {product.barcode && (
                          <span className="text-gray-400 truncate ml-1">
                            {product.barcode}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Cart - Enhanced with glassmorphism effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 h-fit sticky top-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full"
            >
              {cart.length} items
            </motion.div>
          </div>

          {/* Cart Items with enhanced styling */}
          <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto" />
                </motion.div>
                <h3 className="mt-4 text-lg font-medium text-gray-700">
                  Your cart is empty
                </h3>
                <p className="mt-1 text-gray-500">
                  Add products to get started
                </p>
              </div>
            ) : (
              cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-800">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      ${item.sellingPrice.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-green-500 hover:text-green-600 transition-all duration-200"
                    >
                      -
                    </motion.button>
                    <span className="text-sm font-bold text-gray-800 w-10 text-center">
                      {item.quantity}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-green-500 hover:text-green-600 transition-all duration-200"
                    >
                      +
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-all duration-200"
                    >
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Order Totals with enhanced styling */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-800">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (8%)</span>
              <span className="font-medium text-gray-800">
                ${tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-800">Total</span>
              <motion.span
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-green-600"
              >
                ${total.toFixed(2)}
              </motion.span>
            </div>
          </div>

          {/* Payment Options with enhanced buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                if (cart.length === 0) return;
                const saleId = await handlePayment("Card");
                if (saleId) {
                  // Show Stripe payment modal
                  setShowStripePayment(true);
                } else {
                  // handlePayment already showed the error toast
                  console.log("Failed to create sale for card payment");
                }
              }}
              disabled={cart.length === 0}
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-200 font-medium"
            >
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Card
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                if (cart.length === 0) return;
                const result = await handlePayment("Cash");
                if (result === null) {
                  // handlePayment already showed the error toast
                  console.log("Failed to process cash payment");
                }
              }}
              disabled={cart.length === 0}
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-200 font-medium"
            >
              <CalculatorIcon className="h-5 w-5 mr-2" />
              Cash
            </motion.button>
          </div>

          {/* Checkout Button with enhanced styling */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              if (cart.length === 0) return;
              const result = await handlePayment("Cash");
              if (result === null) {
                // handlePayment already showed the error toast
                console.log("Failed to process checkout payment");
              }
            }}
            disabled={cart.length === 0}
            className="mt-4 w-full py-4 px-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all duration-200"
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            Process Payment - ${total.toFixed(2)}
          </motion.button>
        </motion.div>
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Stripe Payment Modal */}
      {showStripePayment && completedSale && (
        <StripePaymentModal
          amount={total}
          saleId={completedSale.id}
          items={cart.map((item) => ({
            name: item.name,
            price: item.sellingPrice,
            quantity: item.quantity,
          }))}
          onClose={() => {
            setShowStripePayment(false);
            // If payment was cancelled, we might want to delete the pending sale
            // or mark it as cancelled in the database
          }}
          onSuccess={() => {
            handleCardPaymentSuccess();
          }}
        />
      )}

      {/* Receipt Modal */}
      {showReceipt && completedSale && (
        <Receipt
          sale={completedSale}
          business={{
            name: "Fresh Market Grocery",
            address: "123 Main Street, City, State 12345",
            phone: "+1 (555) 123-4567",
            email: "info@freshmarket.com",
            receiptMessage: "Thank you for shopping with us!",
          }}
          onClose={() => setShowReceipt(false)}
          onPrint={() => console.log("Printing receipt...")}
        />
      )}
    </div>
  );
}
