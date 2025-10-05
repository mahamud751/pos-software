import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/discount-rules/[id] - Get a specific discount rule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const discountRule = await prisma.discountRule.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        productDiscountRules: {
          include: {
            product: true,
          },
        },
        categoryDiscountRules: {
          include: {
            category: true,
          },
        },
        customerDiscountRules: {
          include: {
            customer: true,
          },
        },
        couponUsages: {
          include: {
            customer: true,
            order: true,
          },
        },
      },
    });

    if (!discountRule) {
      return NextResponse.json(
        { error: "Discount rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(discountRule);
  } catch (error) {
    console.error("Error fetching discount rule:", error);
    return NextResponse.json(
      { error: "Failed to fetch discount rule" },
      { status: 500 }
    );
  }
}

// PUT /api/discount-rules/[id] - Update a discount rule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Check if discount rule exists
    const existingDiscountRule = await prisma.discountRule.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingDiscountRule) {
      return NextResponse.json(
        { error: "Discount rule not found" },
        { status: 404 }
      );
    }

    // If coupon code is being updated, check if it already exists
    if (body.couponCode && body.couponCode !== existingDiscountRule.couponCode) {
      const duplicateRule = await prisma.discountRule.findUnique({
        where: { couponCode: body.couponCode },
      });

      if (duplicateRule) {
        return NextResponse.json(
          { error: "Coupon code already exists" },
          { status: 400 }
        );
      }
    }

    const discountRule = await prisma.discountRule.update({
      where: { id: parseInt(params.id) },
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        value: body.value,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: body.isActive,
        priority: body.priority,
        conditions: body.conditions,
        usageLimit: body.usageLimit,
        couponCode: body.couponCode,
      },
    });

    return NextResponse.json(discountRule);
  } catch (error) {
    console.error("Error updating discount rule:", error);
    return NextResponse.json(
      { error: "Failed to update discount rule" },
      { status: 500 }
    );
  }
}

// DELETE /api/discount-rules/[id] - Delete a discount rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if discount rule exists
    const existingDiscountRule = await prisma.discountRule.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingDiscountRule) {
      return NextResponse.json(
        { error: "Discount rule not found" },
        { status: 404 }
      );
    }

    // Delete the discount rule
    await prisma.discountRule.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: "Discount rule deleted successfully" });
  } catch (error) {
    console.error("Error deleting discount rule:", error);
    return NextResponse.json(
      { error: "Failed to delete discount rule" },
      { status: 500 }
    );
  }
}