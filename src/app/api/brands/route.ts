import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/brands - Get all brands
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where: any = {};
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const brands = await prisma.brand.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        name: "asc",
      },
    });

    const total = await prisma.brand.count({ where });

    return NextResponse.json({
      brands,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

// POST /api/brands - Create a new brand
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.name) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    // Check if brand already exists
    const existingBrand = await prisma.brand.findFirst({
      where: {
        name: {
          equals: body.name,
          mode: "insensitive",
        },
      },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "Brand with this name already exists" },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        name: body.name,
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}
