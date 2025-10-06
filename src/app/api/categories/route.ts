import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where: { name?: { contains: string; mode: "insensitive" } } = {};
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const categories = await prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        name: "asc",
      },
    });

    const total = await prisma.category.count({ where });

    return NextResponse.json({
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: body.name,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: body.name,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
