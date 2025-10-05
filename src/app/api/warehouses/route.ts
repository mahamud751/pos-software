import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/warehouses - Get all warehouses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const isActive = searchParams.get("isActive") || "";
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (isActive === "true") {
      where.isActive = true;
    } else if (isActive === "false") {
      where.isActive = false;
    }

    const warehouses = await prisma.warehouse.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        name: "asc",
      },
    });

    const total = await prisma.warehouse.count({ where });

    return NextResponse.json({
      warehouses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 }
    );
  }
}

// POST /api/warehouses - Create a new warehouse
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.name || !body.location) {
      return NextResponse.json(
        { error: "Warehouse name and location are required" },
        { status: 400 }
      );
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name: body.name,
        location: body.location,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });

    return NextResponse.json(warehouse, { status: 201 });
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to create warehouse" },
      { status: 500 }
    );
  }
}
