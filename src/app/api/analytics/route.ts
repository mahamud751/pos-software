import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7d"; // 7d, 30d, 90d
    const endDate = new Date();
    let startDate = new Date();

    // Set start date based on period
    switch (period) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Get sales analytics
    const salesAnalytics = await prisma.salesAnalytics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Get customer analytics
    const customerAnalytics = await prisma.customerAnalytics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Get top products
    const topProducts = await prisma.productAnalytics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        totalRevenue: "desc",
      },
      take: 10,
      include: {
        product: true,
      },
    });

    // Get overall statistics
    const totalSales = await prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalOrders = await prisma.sale.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalCustomers = await prisma.customer.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalProducts = await prisma.product.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get recent sales for chart
    const recentSales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group sales by date for chart
    const salesByDate = recentSales.reduce((acc: any, sale) => {
      const date = new Date(sale.createdAt).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += sale.totalAmount;
      return acc;
    }, {});

    // Format chart data
    const chartData = Object.entries(salesByDate).map(([date, amount]) => ({
      date,
      amount: Number(amount),
    }));

    return NextResponse.json({
      salesAnalytics,
      customerAnalytics,
      topProducts,
      overview: {
        totalSales: totalSales._sum.totalAmount || 0,
        totalOrders,
        totalCustomers,
        totalProducts,
      },
      chartData,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

// POST /api/analytics - Generate analytics data (for background jobs)
export async function POST(request: NextRequest) {
  try {
    // This endpoint would be called by a background job to generate analytics data
    // For now, we'll just return a success message
    return NextResponse.json({ message: "Analytics generation started" });
  } catch (error) {
    console.error("Error generating analytics:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics" },
      { status: 500 }
    );
  }
}
