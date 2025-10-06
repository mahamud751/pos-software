import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/deliveries/[id] - Get a specific delivery
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const delivery = await prisma.delivery.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        sale: {
          include: {
            customer: true,
            saleItems: {
              include: {
                product: true,
              },
            },
          },
        },
        deliveryUpdates: {
          orderBy: {
            timestamp: "desc",
          },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error("Error fetching delivery:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery" },
      { status: 500 }
    );
  }
}

// PUT /api/deliveries/[id] - Update a delivery
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();

    // Check if delivery exists
    const existingDelivery = await prisma.delivery.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingDelivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    const delivery = await prisma.delivery.update({
      where: { id: parseInt(params.id) },
      data: {
        trackingNumber: body.trackingNumber,
        carrier: body.carrier,
        status: body.status,
        estimatedDelivery: body.estimatedDelivery
          ? new Date(body.estimatedDelivery)
          : null,
        actualDelivery: body.actualDelivery
          ? new Date(body.actualDelivery)
          : null,
        shippingAddress: body.shippingAddress,
        shippingCost: body.shippingCost,
        notes: body.notes,
      },
    });

    // If status changed, add a delivery update
    if (body.status && body.status !== existingDelivery.status) {
      await prisma.deliveryUpdate.create({
        data: {
          deliveryId: delivery.id,
          status: body.status,
          notes: `Status updated to ${body.status}`,
        },
      });
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error("Error updating delivery:", error);
    return NextResponse.json(
      { error: "Failed to update delivery" },
      { status: 500 }
    );
  }
}

// DELETE /api/deliveries/[id] - Delete a delivery
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Check if delivery exists
    const existingDelivery = await prisma.delivery.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingDelivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    // Delete the delivery
    await prisma.delivery.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: "Delivery deleted successfully" });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    return NextResponse.json(
      { error: "Failed to delete delivery" },
      { status: 500 }
    );
  }
}
