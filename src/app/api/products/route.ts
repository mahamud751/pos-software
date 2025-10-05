import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            isActive: true,
          },
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { barcode: { contains: query, mode: "insensitive" } },
              { sku: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      include: {
        category: true,
        brand: true,
        unit: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const product = await prisma.product.create({
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
        isActive: true,
      },
      include: {
        category: true,
        brand: true,
        unit: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
