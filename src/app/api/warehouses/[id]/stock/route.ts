import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/warehouses/[id]/stock - Get stock levels for a warehouse
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const warehouseId = parseInt(params.id);

    if (isNaN(warehouseId)) {
      return NextResponse.json(
        { error: "Invalid warehouse ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      warehouseId: number;
      product?: { name?: { contains: string; mode: "insensitive" } };
    } = {
      warehouseId: warehouseId,
    };

    if (search) {
      where.product = {
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    const warehouseStocks = await prisma.warehouseStock.findMany({
      where,
      skip,
      take: limit,
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            unit: {
              select: {
                symbol: true,
              },
            },
          },
        },
      },
      orderBy: {
        quantity: "desc",
      },
    });

    const total = await prisma.warehouseStock.count({ where });

    return NextResponse.json({
      warehouseStocks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching warehouse stock:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouse stock" },
      { status: 500 }
    );
  }
}

// POST /api/warehouses/[id]/stock - Add or update stock for a product in warehouse
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const warehouseId = parseInt(params.id);

    if (isNaN(warehouseId)) {
      return NextResponse.json(
        { error: "Invalid warehouse ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    if (!body.productId || body.quantity === undefined) {
      return NextResponse.json(
        { error: "Product ID and quantity are required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: body.productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Upsert warehouse stock
    const warehouseStock = await prisma.warehouseStock.upsert({
      where: {
        warehouseId_productId: {
          warehouseId: warehouseId,
          productId: body.productId,
        },
      },
      update: {
        quantity: {
          increment: parseInt(body.quantity),
        },
      },
      create: {
        warehouseId: warehouseId,
        productId: body.productId,
        quantity: parseInt(body.quantity),
      },
    });

    return NextResponse.json(warehouseStock);
  } catch (error) {
    console.error("Error updating warehouse stock:", error);
    return NextResponse.json(
      { error: "Failed to update warehouse stock" },
      { status: 500 }
    );
  }
}
