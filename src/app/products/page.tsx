"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

interface Product {
  id: number;
  name: string;
  category: { name: string; id: number };
  brand: { name: string; id: number };
  sellingPrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  sku: string;
  barcode: string;
  unit: { symbol: string; id: number };
  expiryDate?: string;
}

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  name: string;
  symbol: string;
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // New state for dropdown data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

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

  // Fetch dropdown data when modal opens
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (isModalOpen) {
        setDropdownLoading(true);
        try {
          // Fetch categories
          const categoriesResponse = await fetch("/api/categories");
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);

          // Fetch brands
          const brandsResponse = await fetch("/api/brands");
          const brandsData = await brandsResponse.json();
          setBrands(brandsData.brands || []);

          // Fetch units
          const unitsResponse = await fetch("/api/units");
          const unitsData = await unitsResponse.json();
          setUnits(unitsData.units || []);
        } catch (error) {
          console.error("Error fetching dropdown data:", error);
        } finally {
          setDropdownLoading(false);
        }
      }
    };

    fetchDropdownData();
  }, [isModalOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const productData = {
      name: formData.get("name") as string,
      categoryId: parseInt(formData.get("categoryId") as string) || 1,
      brandId: parseInt(formData.get("brandId") as string) || 1,
      unitId: parseInt(formData.get("unitId") as string) || 1,
      sellingPrice: parseFloat(formData.get("sellingPrice") as string),
      costPrice: parseFloat(formData.get("costPrice") as string),
      stock: parseInt(formData.get("stock") as string),
      minStock: parseInt(formData.get("minStock") as string) || 10,
      sku: formData.get("sku") as string,
      barcode: formData.get("barcode") as string,
      expiryDate: (formData.get("expiryDate") as string) || null,
    };

    try {
      if (editingProduct) {
        // Update existing product
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        });

        if (response.ok) {
          // Refresh products list
          const updatedProduct = await response.json();
          setProducts(
            products.map((p) =>
              p.id === updatedProduct.id ? updatedProduct : p
            )
          );
        }
      } else {
        // Create new product
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        });

        if (response.ok) {
          // Add to products list
          const newProduct = await response.json();
          setProducts([...products, newProduct]);
        }
      }

      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  // Handle delete product
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setProducts(products.filter((product) => product.id !== id));
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
      setEditingProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Product Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your inventory and product information
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Import
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
            Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </motion.button>
        </div>
      </div>

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
            placeholder="Search products by name, category, or brand..."
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-500">Loading products...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cost
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Expiry
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.brand.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.sellingPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.costPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            product.stock > 20
                              ? "bg-green-100 text-green-800"
                              : product.stock > 10
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock} {product.unit.symbol}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.expiryDate
                          ? new Date(product.expiryDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              // Add to cart functionality would go here
                              console.log("Add to cart:", product);
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            <PlusIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setIsModalOpen(true);
                            }}
                            className="text-green-600 hover:text-green-900 transition-colors"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No products found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or add a new product.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-container slide-in w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="form-label">
                      Product Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      defaultValue={editingProduct?.name || ""}
                      className="form-input w-full"
                      required
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label htmlFor="categoryId" className="form-label">
                      Category
                    </label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      defaultValue={editingProduct?.category?.id || ""}
                      className="form-select w-full"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {dropdownLoading && (
                      <p className="text-xs text-gray-500 mt-1">
                        Loading categories...
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="brandId" className="form-label">
                      Brand
                    </label>
                    <select
                      id="brandId"
                      name="brandId"
                      defaultValue={editingProduct?.brand?.id || ""}
                      className="form-select w-full"
                    >
                      <option value="">Select Brand</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    {dropdownLoading && (
                      <p className="text-xs text-gray-500 mt-1">
                        Loading brands...
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="unitId" className="form-label">
                      Unit
                    </label>
                    <select
                      id="unitId"
                      name="unitId"
                      defaultValue={editingProduct?.unit?.id || ""}
                      className="form-select w-full"
                    >
                      <option value="">Select Unit</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.symbol})
                        </option>
                      ))}
                    </select>
                    {dropdownLoading && (
                      <p className="text-xs text-gray-500 mt-1">
                        Loading units...
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="sellingPrice" className="form-label">
                      Selling Price ($)
                    </label>
                    <input
                      type="number"
                      id="sellingPrice"
                      name="sellingPrice"
                      step="0.01"
                      defaultValue={editingProduct?.sellingPrice || ""}
                      className="form-input w-full"
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="costPrice" className="form-label">
                      Cost Price ($)
                    </label>
                    <input
                      type="number"
                      id="costPrice"
                      name="costPrice"
                      step="0.01"
                      defaultValue={editingProduct?.costPrice || ""}
                      className="form-input w-full"
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="stock" className="form-label">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      defaultValue={editingProduct?.stock || ""}
                      className="form-input w-full"
                      required
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="minStock" className="form-label">
                      Minimum Stock
                    </label>
                    <input
                      type="number"
                      id="minStock"
                      name="minStock"
                      defaultValue={editingProduct?.minStock || 10}
                      className="form-input w-full"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label htmlFor="sku" className="form-label">
                      SKU
                    </label>
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      defaultValue={editingProduct?.sku || ""}
                      className="form-input w-full"
                      placeholder="Enter SKU"
                    />
                  </div>

                  <div>
                    <label htmlFor="barcode" className="form-label">
                      Barcode
                    </label>
                    <input
                      type="text"
                      id="barcode"
                      name="barcode"
                      defaultValue={editingProduct?.barcode || ""}
                      className="form-input w-full"
                      placeholder="Enter barcode"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="expiryDate" className="form-label">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      defaultValue={
                        editingProduct?.expiryDate
                          ? new Date(editingProduct.expiryDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      className="form-input w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="btn btn-secondary px-4 py-2"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="btn btn-primary px-4 py-2"
                  >
                    {editingProduct ? "Update Product" : "Add Product"}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
