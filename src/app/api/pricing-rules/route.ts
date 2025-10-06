import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/pricing-rules - Get all pricing rules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive") || "";
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      name?: { contains: string; mode: "insensitive" };
      isActive?: boolean;
    } = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (isActive === "true") {
      where.isActive = true;
    } else if (isActive === "false") {
      where.isActive = false;
    }

    const pricingRules = await prisma.pricingRule.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            productPricingRules: true,
            categoryPricingRules: true,
            customerPricingRules: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.pricingRule.count({ where });

    return NextResponse.json({
      pricingRules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching pricing rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing rules" },
      { status: 500 }
    );
  }
}

// POST /api/pricing-rules - Create a new pricing rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.name || !body.type || !body.value || !body.startDate) {
      return NextResponse.json(
        { error: "Name, type, value, and start date are required" },
        { status: 400 }
      );
    }

    const pricingRule = await prisma.pricingRule.create({
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        value: body.value,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        priority: body.priority || 0,
        conditions: body.conditions || "{}",
      },
    });

    return NextResponse.json(pricingRule, { status: 201 });
  } catch (error) {
    console.error("Error creating pricing rule:", error);
    return NextResponse.json(
      { error: "Failed to create pricing rule" },
      { status: 500 }
    );
  }
}
