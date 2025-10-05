import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/pricing-rules/[id] - Get a specific pricing rule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pricingRule = await prisma.pricingRule.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        productPricingRules: {
          include: {
            product: true,
          },
        },
        categoryPricingRules: {
          include: {
            category: true,
          },
        },
        customerPricingRules: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!pricingRule) {
      return NextResponse.json(
        { error: "Pricing rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pricingRule);
  } catch (error) {
    console.error("Error fetching pricing rule:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing rule" },
      { status: 500 }
    );
  }
}

// PUT /api/pricing-rules/[id] - Update a pricing rule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Check if pricing rule exists
    const existingPricingRule = await prisma.pricingRule.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingPricingRule) {
      return NextResponse.json(
        { error: "Pricing rule not found" },
        { status: 404 }
      );
    }

    const pricingRule = await prisma.pricingRule.update({
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
      },
    });

    return NextResponse.json(pricingRule);
  } catch (error) {
    console.error("Error updating pricing rule:", error);
    return NextResponse.json(
      { error: "Failed to update pricing rule" },
      { status: 500 }
    );
  }
}

// DELETE /api/pricing-rules/[id] - Delete a pricing rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if pricing rule exists
    const existingPricingRule = await prisma.pricingRule.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingPricingRule) {
      return NextResponse.json(
        { error: "Pricing rule not found" },
        { status: 404 }
      );
    }

    // Delete the pricing rule
    await prisma.pricingRule.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: "Pricing rule deleted successfully" });
  } catch (error) {
    console.error("Error deleting pricing rule:", error);
    return NextResponse.json(
      { error: "Failed to delete pricing rule" },
      { status: 500 }
    );
  }
}
