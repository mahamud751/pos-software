import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface InventoryAlert {
  id: string;
  type: "low-stock" | "expiring";
  title: string;
  message: string;
  productId: number;
  priority: "high" | "medium";
  createdAt: string;
}

// GET /api/inventory/alerts - Get inventory alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // low-stock, expiring, all
    const limit = parseInt(searchParams.get("limit") || "10");

    let alerts: InventoryAlert[] = [];

    if (type === "low-stock" || type === "all") {
      // Get low stock products
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
        take: Math.floor(limit / 2),
      });

      alerts = alerts.concat(
        lowStockProducts.map((product) => ({
          id: `low-${product.id}`,
          type: "low-stock",
          title: "Low Stock Alert",
          message: `${product.name} is running low (${product.stock} ${product.unit.symbol} in stock)`,
          productId: product.id,
          priority: "high",
          createdAt: new Date().toISOString(),
        }))
      );
    }

    if (type === "expiring" || type === "all") {
      // Get expiring products (within 7 days)
      const expiringProducts = await prisma.product.findMany({
        where: {
          expiryDate: {
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
          isActive: true,
        },
        include: {
          category: true,
          brand: true,
          unit: true,
        },
        orderBy: {
          expiryDate: "asc",
        },
        take: Math.floor(limit / 2),
      });

      alerts = alerts.concat(
        expiringProducts.map((product) => ({
          id: `exp-${product.id}`,
          type: "expiring",
          title: "Expiring Product Alert",
          message: `${
            product.name
          } expires on ${product.expiryDate?.toLocaleDateString()}`,
          productId: product.id,
          priority: "medium",
          createdAt: new Date().toISOString(),
        }))
      );
    }

    // Sort alerts by priority and creation date
    alerts.sort((a, b) => {
      // High priority first
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (b.priority === "high" && a.priority !== "high") return 1;

      // Then by creation date (newer first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(alerts.slice(0, limit));
  } catch (error) {
    console.error("Error fetching inventory alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory alerts" },
      { status: 500 }
    );
  }
}
