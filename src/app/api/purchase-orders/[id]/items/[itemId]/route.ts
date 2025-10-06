import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/purchase-orders/[id]/items/[itemId] - Update a purchase order item (receive items)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const params = await context.params;
    const orderId = parseInt(params.id);
    const itemId = parseInt(params.itemId);

    if (isNaN(orderId) || isNaN(itemId)) {
      return NextResponse.json(
        { error: "Invalid order or item ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const receivedQty = parseInt(body.receivedQty);

    if (isNaN(receivedQty) || receivedQty < 0) {
      return NextResponse.json(
        { error: "Invalid received quantity" },
        { status: 400 }
      );
    }

    // Check if purchase order item exists
    const existingItem = await prisma.purchaseOrderItem.findUnique({
      where: { id: itemId },
      include: {
        purchaseOrder: true,
        product: true,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Purchase order item not found" },
        { status: 404 }
      );
    }

    // Check if this is the correct order
    if (existingItem.purchaseOrderId !== orderId) {
      return NextResponse.json(
        { error: "Item does not belong to this order" },
        { status: 400 }
      );
    }

    // Update the received quantity
    const updatedItem = await prisma.purchaseOrderItem.update({
      where: { id: itemId },
      data: {
        receivedQty,
      },
    });

    // Update product stock if this is a full receipt
    if (receivedQty === existingItem.quantity) {
      await prisma.product.update({
        where: { id: existingItem.productId },
        data: {
          stock: {
            increment: receivedQty,
          },
        },
      });
    }

    // Check if all items in the order have been received
    const orderItems = await prisma.purchaseOrderItem.findMany({
      where: { purchaseOrderId: orderId },
    });

    const allReceived = orderItems.every(
      (item) => item.receivedQty === item.quantity
    );

    // Update order status if all items received
    if (allReceived) {
      await prisma.purchaseOrder.update({
        where: { id: orderId },
        data: {
          status: "received",
        },
      });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating purchase order item:", error);
    return NextResponse.json(
      { error: "Failed to update purchase order item" },
      { status: 500 }
    );
  }
}
