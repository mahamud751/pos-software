import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/purchase-orders/[id] - Get a specific purchase order
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid purchase order ID" },
        { status: 400 }
      );
    }

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        user: {
          select: {
            name: true,
          },
        },
        purchaseOrderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase order" },
      { status: 500 }
    );
  }
}

// PUT /api/purchase-orders/[id] - Update a purchase order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid purchase order ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if purchase order exists
    const existingPurchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!existingPurchaseOrder) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: body.status,
        notes: body.notes,
        expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
      },
      include: {
        supplier: true,
        user: {
          select: {
            name: true,
          },
        },
        purchaseOrderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.error("Error updating purchase order:", error);
    return NextResponse.json(
      { error: "Failed to update purchase order" },
      { status: 500 }
    );
  }
}

// DELETE /api/purchase-orders/[id] - Delete a purchase order
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid purchase order ID" },
        { status: 400 }
      );
    }

    // Check if purchase order exists
    const existingPurchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!existingPurchaseOrder) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    // Only allow deletion of pending orders
    if (existingPurchaseOrder.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending orders can be deleted" },
        { status: 400 }
      );
    }

    await prisma.purchaseOrder.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Purchase order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    return NextResponse.json(
      { error: "Failed to delete purchase order" },
      { status: 500 }
    );
  }
}
