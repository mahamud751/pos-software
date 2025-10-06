import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/coupons - Get all coupons
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
        code?: { contains: string; mode: "insensitive" };
      }[];
      isActive?: boolean;
    } = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive === "true") {
      where.isActive = true;
    } else if (isActive === "false") {
      where.isActive = false;
    }

    const coupons = await prisma.coupon.findMany({
      where,
      skip,
      take: limit,
      include: {
        campaign: true,
        _count: {
          select: { couponUsages: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.coupon.count({ where });

    return NextResponse.json({
      coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST /api/coupons - Create a new coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.code || !body.name || !body.discountType || !body.discountValue) {
      return NextResponse.json(
        {
          error:
            "Coupon code, name, discount type, and discount value are required",
        },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: body.code },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description,
        discountType: body.discountType,
        discountValue: body.discountValue,
        minimumOrderValue: body.minimumOrderValue,
        usageLimit: body.usageLimit,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate
          ? new Date(body.endDate)
          : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        isActive: body.isActive !== undefined ? body.isActive : true,
        campaignId: body.campaignId ? parseInt(body.campaignId) : null,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
