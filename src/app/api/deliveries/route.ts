import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/deliveries - Get all deliveries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: "insensitive" } },
        { carrier: { contains: search, mode: "insensitive" } },
        {
          sale: {
            customer: { name: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      skip,
      take: limit,
      include: {
        sale: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.delivery.count({ where });

    return NextResponse.json({
      deliveries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json(
      { error: "Failed to fetch deliveries" },
      { status: 500 }
    );
  }
}

// POST /api/deliveries - Create a new delivery
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (
      !body.saleId ||
      !body.trackingNumber ||
      !body.carrier ||
      !body.shippingAddress
    ) {
      return NextResponse.json(
        {
          error:
            "Sale ID, tracking number, carrier, and shipping address are required",
        },
        { status: 400 }
      );
    }

    // Check if delivery already exists for this sale
    const existingDelivery = await prisma.delivery.findUnique({
      where: { saleId: body.saleId },
    });

    if (existingDelivery) {
      return NextResponse.json(
        { error: "Delivery already exists for this sale" },
        { status: 400 }
      );
    }

    const delivery = await prisma.delivery.create({
      data: {
        saleId: body.saleId,
        trackingNumber: body.trackingNumber,
        carrier: body.carrier,
        status: body.status || "pending",
        estimatedDelivery: body.estimatedDelivery
          ? new Date(body.estimatedDelivery)
          : null,
        shippingAddress: body.shippingAddress,
        shippingCost: body.shippingCost || 0,
        notes: body.notes,
      },
    });

    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    console.error("Error creating delivery:", error);
    return NextResponse.json(
      { error: "Failed to create delivery" },
      { status: 500 }
    );
  }
}
