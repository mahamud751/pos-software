import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/discount-rules - Get all discount rules
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
      OR?: {
        name?: { contains: string; mode: "insensitive" };
        couponCode?: { contains: string; mode: "insensitive" };
      }[];
      isActive?: boolean;
    } = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { couponCode: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive === "true") {
      where.isActive = true;
    } else if (isActive === "false") {
      where.isActive = false;
    }

    const discountRules = await prisma.discountRule.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            productDiscountRules: true,
            categoryDiscountRules: true,
            customerDiscountRules: true,
            couponUsages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.discountRule.count({ where });

    return NextResponse.json({
      discountRules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching discount rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch discount rules" },
      { status: 500 }
    );
  }
}

// POST /api/discount-rules - Create a new discount rule
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

    // Check if coupon code already exists
    if (body.couponCode) {
      const existingRule = await prisma.discountRule.findUnique({
        where: { couponCode: body.couponCode },
      });

      if (existingRule) {
        return NextResponse.json(
          { error: "Coupon code already exists" },
          { status: 400 }
        );
      }
    }

    const discountRule = await prisma.discountRule.create({
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
        usageLimit: body.usageLimit,
        couponCode: body.couponCode,
      },
    });

    return NextResponse.json(discountRule, { status: 201 });
  } catch (error) {
    console.error("Error creating discount rule:", error);
    return NextResponse.json(
      { error: "Failed to create discount rule" },
      { status: 500 }
    );
  }
}
