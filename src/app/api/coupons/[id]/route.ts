import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/coupons/[id] - Get a specific coupon
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        campaign: true,
        couponUsages: {
          include: {
            customer: true,
            order: true,
          },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

// PUT /api/coupons/[id] - Update a coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingCoupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // If code is being updated, check if it already exists
    if (body.code && body.code !== existingCoupon.code) {
      const duplicateCoupon = await prisma.coupon.findUnique({
        where: { code: body.code },
      });

      if (duplicateCoupon) {
        return NextResponse.json(
          { error: "Coupon code already exists" },
          { status: 400 }
        );
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id: parseInt(params.id) },
      data: {
        code: body.code,
        name: body.name,
        description: body.description,
        discountType: body.discountType,
        discountValue: body.discountValue,
        minimumOrderValue: body.minimumOrderValue,
        usageLimit: body.usageLimit,
        usedCount: body.usedCount,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        isActive: body.isActive,
        campaignId: body.campaignId ? parseInt(body.campaignId) : null,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE /api/coupons/[id] - Delete a coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingCoupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Delete the coupon
    await prisma.coupon.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
