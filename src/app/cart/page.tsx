"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { TrashIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

export default function ShoppingCartPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Your Shopping Cart
          </h1>
          <p className="text-gray-500 mb-6">Your cart is currently empty</p>
          <button
            onClick={() => router.push("/products")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Your Shopping Cart
      </h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="p-6 flex flex-col sm:flex-row"
            >
              <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No Image</span>
                </div>
              </div>

              <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      SKU: {item.product.sku}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="p-1 rounded-md border border-gray-300"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="mx-3 text-gray-700">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="p-1 rounded-md border border-gray-300"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-lg font-medium text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between text-lg font-medium text-gray-900 mb-4">
            <span>Total</span>
            <span>{formatCurrency(getTotalPrice())}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push("/products")}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
