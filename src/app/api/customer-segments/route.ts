import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/customer-segments - Get all customer segments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const segments = await prisma.customerSegment.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: { customerSegmentMembers: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const total = await prisma.customerSegment.count({ where });

    return NextResponse.json({
      segments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching customer segments:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer segments" },
      { status: 500 }
    );
  }
}

// POST /api/customer-segments - Create a new customer segment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.name || !body.criteria) {
      return NextResponse.json(
        { error: "Segment name and criteria are required" },
        { status: 400 }
      );
    }

    const segment = await prisma.customerSegment.create({
      data: {
        name: body.name,
        criteria: body.criteria, // JSON string
      },
    });

    return NextResponse.json(segment, { status: 201 });
  } catch (error) {
    console.error("Error creating customer segment:", error);
    return NextResponse.json(
      { error: "Failed to create customer segment" },
      { status: 500 }
    );
  }
}
