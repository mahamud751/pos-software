import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/products/[id] - Get a specific product
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        brand: true,
        unit: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name,
        description: body.description,
        sku: body.sku,
        barcode: body.barcode,
        categoryId: body.categoryId,
        brandId: body.brandId,
        unitId: body.unitId,
        costPrice: parseFloat(body.costPrice),
        sellingPrice: parseFloat(body.sellingPrice),
        stock: parseInt(body.stock),
        minStock: parseInt(body.minStock),
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        isActive: body.isActive,
      },
      include: {
        category: true,
        brand: true,
        unit: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Instead of deleting, we'll mark as inactive
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
