"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  ArrowLeftIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";

interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  barcode: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  expiryDate: Date | null;
  categoryId: number;
  brandId: number;
  unitId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: { name: string };
  brand: { name: string };
  unit: { symbol: string };
}

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // In a real app, you would fetch the product from an API
  // For now, we'll use mock data
  React.useEffect(() => {
    const mockProduct: Product = {
      id: parseInt(params.id),
      name: "Organic Apples",
      description: "Fresh organic apples from local farms",
      sku: "ORG-APP-001",
      barcode: "123456789012",
      sellingPrice: 2.99,
      costPrice: 1.5,
      stock: 50,
      minStock: 10,
      expiryDate: new Date("2023-12-31"),
      categoryId: 1,
      brandId: 1,
      unitId: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: { name: "Fruits" },
      brand: { name: "Organic Farms" },
      unit: { symbol: "lb" },
    };

    setTimeout(() => {
      setProduct(mockProduct);
      setLoading(false);
    }, 500);
  }, [params.id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      alert(`${quantity} ${product.name} added to cart!`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Products
      </button>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
            </div>

            <div className="md:w-2/3">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {product.name}
                  </h1>
                  <p className="text-gray-500 mt-1">{product.brand.name}</p>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(product.sellingPrice)}
                </span>
              </div>

              {product.description && (
                <p className="mt-4 text-gray-600">{product.description}</p>
              )}

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{product.category.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">SKU</p>
                  <p className="font-medium">{product.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Barcode</p>
                  <p className="font-medium">{product.barcode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stock</p>
                  <p className="font-medium">
                    {product.stock} {product.unit.symbol}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="font-medium">
                    {formatDate(product.expiryDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cost Price</p>
                  <p className="font-medium">
                    {formatCurrency(product.costPrice)}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-l-md border border-gray-300"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 border-t border-b border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 rounded-r-md border border-gray-300"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="ml-4 flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
