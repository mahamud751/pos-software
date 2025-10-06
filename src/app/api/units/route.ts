import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/units - Get all units
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where: {
      OR?: {
        name?: { contains: string; mode: "insensitive" };
        symbol?: { contains: string; mode: "insensitive" };
      }[];
    } = {};
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          symbol: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const units = await prisma.unit.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        name: "asc",
      },
    });

    const total = await prisma.unit.count({ where });

    return NextResponse.json({
      units,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}

// POST /api/units - Create a new unit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.name || !body.symbol) {
      return NextResponse.json(
        { error: "Unit name and symbol are required" },
        { status: 400 }
      );
    }

    // Check if unit already exists (by name or symbol)
    const existingUnit = await prisma.unit.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: body.name,
              mode: "insensitive",
            },
          },
          {
            symbol: {
              equals: body.symbol,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    if (existingUnit) {
      return NextResponse.json(
        { error: "Unit with this name or symbol already exists" },
        { status: 400 }
      );
    }

    const unit = await prisma.unit.create({
      data: {
        name: body.name,
        symbol: body.symbol,
      },
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    console.error("Error creating unit:", error);
    return NextResponse.json(
      { error: "Failed to create unit" },
      { status: 500 }
    );
  }
}
