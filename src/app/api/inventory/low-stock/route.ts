import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/inventory/low-stock - Get low stock products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lt: 10, // Using default minStock value for now
        },
        isActive: true,
      },
      include: {
        category: true,
        brand: true,
        unit: true,
      },
      orderBy: {
        stock: "asc",
      },
      take: limit,
    });

    return NextResponse.json(lowStockProducts);
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    return NextResponse.json(
      { error: "Failed to fetch low stock products" },
      { status: 500 }
    );
  }
}
