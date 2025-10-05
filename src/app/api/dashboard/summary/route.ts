import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/summary - Get dashboard summary data
export async function GET(_request: NextRequest) {
  try {
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Calculate today's sales
    const todaySales = await prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "completed",
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Calculate total sales
    const totalSales = await prisma.sale.aggregate({
      where: {
        status: "completed",
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get total orders
    const totalOrders = await prisma.sale.count({
      where: {
        status: "completed",
      },
    });

    // Get total customers
    const totalCustomers = await prisma.customer.count({
      where: {
        isActive: true,
      },
    });

    // Get total suppliers
    const totalSuppliers = await prisma.supplier.count({
      where: {
        isActive: true,
      },
    });

    // Get low stock products (stock < minStock)
    const lowStockProducts = await prisma.product.count({
      where: {
        stock: {
          lt: 10, // Using the default minStock value since we can't reference the field directly
        },
        isActive: true,
      },
    });

    // Get expiring products (within 7 days)
    const expiringProducts = await prisma.product.count({
      where: {
        expiryDate: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
        isActive: true,
      },
    });

    // Get top selling products
    const topProducts: Array<{ name: string; total_sold: bigint }> =
      await prisma.$queryRaw`
      SELECT 
        p.name,
        SUM(si.quantity) as total_sold
      FROM "SaleItem" si
      JOIN "Product" p ON si."productId" = p.id
      JOIN "Sale" s ON si."saleId" = s.id
      WHERE s.status = 'completed'
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `;

    // Convert BigInt values to strings or numbers to avoid serialization issues
    const serializedTopProducts = topProducts.map((product) => ({
      ...product,
      total_sold: Number(product.total_sold), // Convert BigInt to Number
    }));

    return NextResponse.json({
      sales: {
        today: Number(todaySales._sum.totalAmount) || 0,
        total: Number(totalSales._sum.totalAmount) || 0,
      },
      orders: totalOrders,
      customers: totalCustomers,
      suppliers: totalSuppliers,
      inventory: {
        lowStock: lowStockProducts,
        expiring: expiringProducts,
      },
      topProducts: serializedTopProducts,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}
