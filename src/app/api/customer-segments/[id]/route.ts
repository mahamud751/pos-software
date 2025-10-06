import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/customer-segments/[id] - Get a specific customer segment
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid customer segment ID" },
        { status: 400 }
      );
    }

    const segment = await prisma.customerSegment.findUnique({
      where: { id },
      include: {
        customerSegmentMembers: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                loyaltyPoints: true,
              },
            },
          },
        },
      },
    });

    if (!segment) {
      return NextResponse.json(
        { error: "Customer segment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(segment);
  } catch (error) {
    console.error("Error fetching customer segment:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer segment" },
      { status: 500 }
    );
  }
}

// PUT /api/customer-segments/[id] - Update a customer segment
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid customer segment ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if segment exists
    const existingSegment = await prisma.customerSegment.findUnique({
      where: { id },
    });

    if (!existingSegment) {
      return NextResponse.json(
        { error: "Customer segment not found" },
        { status: 404 }
      );
    }

    const segment = await prisma.customerSegment.update({
      where: { id },
      data: {
        name: body.name,
        criteria: body.criteria,
      },
    });

    return NextResponse.json(segment);
  } catch (error) {
    console.error("Error updating customer segment:", error);
    return NextResponse.json(
      { error: "Failed to update customer segment" },
      { status: 500 }
    );
  }
}

// DELETE /api/customer-segments/[id] - Delete a customer segment
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid customer segment ID" },
        { status: 400 }
      );
    }

    // Check if segment exists
    const existingSegment = await prisma.customerSegment.findUnique({
      where: { id },
    });

    if (!existingSegment) {
      return NextResponse.json(
        { error: "Customer segment not found" },
        { status: 404 }
      );
    }

    await prisma.customerSegment.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Customer segment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer segment:", error);
    return NextResponse.json(
      { error: "Failed to delete customer segment" },
      { status: 500 }
    );
  }
}
