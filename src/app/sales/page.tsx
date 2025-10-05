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
      } else {
        alert("Product not found for this barcode");
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);
      alert("Error scanning barcode. Please try again.");
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
          items: sale.saleItems.map((item) => ({
            id: item.id,
            name: item.product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        };
        setCompletedSale(receiptSale);

        if (paymentMethod === "Cash") {
          setShowReceipt(true);
          // Reset cart after payment
          setCart([]);
        } else {
          // For card payments, we'll handle this in the modal
          return sale.id;
        }
      } else {
        alert("Failed to process payment. Please try again.");
        return null;
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("An error occurred while processing payment.");
      return null;
    }
  };

  // Handle successful card payment
  const handleCardPaymentSuccess = () => {
    setShowReceipt(true);
    // Reset cart after payment
    setCart([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sales Terminal</h1>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowScanner(true)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <QrCodeIcon className="h-5 w-5 mr-2" />
            Scan Barcode
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            New Order
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            Print Receipt
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Search products by name or category..."
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Products
            </h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                <p className="mt-2 text-gray-500">Loading products...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="text-center">
                      <div className="bg-gray-100 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-2">
                        <TagIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {product.category.name}
                      </p>
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        ${product.sellingPrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {product.stock} {product.unit.symbol} in stock
                      </p>
                      {product.barcode && (
                        <p className="text-xs text-gray-400 mt-1">
                          Barcode: {product.barcode}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h2>
            <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              {cart.length} items
            </div>
          </div>

          {/* Cart Items */}
          <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto" />
                <p className="mt-2 text-gray-500">Your cart is empty</p>
                <p className="text-sm text-gray-400">
                  Add products to get started
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      ${item.sellingPrice.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
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
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax (8%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Options */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                if (cart.length === 0) return;
                const saleId = await handlePayment("Card");
                if (saleId) {
                  // Show Stripe payment modal
                  setShowStripePayment(true);
                }
              }}
              disabled={cart.length === 0}
              className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Card
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                if (cart.length === 0) return;
                await handlePayment("Cash");
              }}
              disabled={cart.length === 0}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CalculatorIcon className="h-5 w-5 mr-2" />
              Cash
            </motion.button>
          </div>

          {/* Checkout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              if (cart.length === 0) return;
              await handlePayment("Cash");
            }}
            disabled={cart.length === 0}
            className="mt-4 w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            Process Payment - ${total.toFixed(2)}
          </motion.button>
        </div>
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
            setShowStripePayment(false);
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
