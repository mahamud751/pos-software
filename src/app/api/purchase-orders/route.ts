import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/purchase-orders - Get all purchase orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";
    const supplierId = searchParams.get("supplierId") || "";
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      status?: string;
      supplierId?: number;
    } = {};

    if (status) {
      where.status = status;
    }

    if (supplierId) {
      where.supplierId = parseInt(supplierId);
    }

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where,
      skip,
      take: limit,
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        purchaseOrderItems: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.purchaseOrder.count({ where });

    return NextResponse.json({
      purchaseOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase orders" },
      { status: 500 }
    );
  }
}

// POST /api/purchase-orders - Create a new purchase order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate order number
    const orderCount = await prisma.purchaseOrder.count();
    const orderNumber = `PO-${new Date().getFullYear()}-${String(
      orderCount + 1
    ).padStart(4, "0")}`;

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        userId: body.userId,
        supplierId: body.supplierId,
        orderNumber,
        status: "pending",
        subtotal: parseFloat(body.subtotal),
        taxAmount: parseFloat(body.taxAmount),
        discount: parseFloat(body.discount),
        totalAmount: parseFloat(body.totalAmount),
        notes: body.notes,
        expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
        purchaseOrderItems: {
          create: body.items.map(
            (item: {
              productId: number;
              quantity: string;
              unitPrice: string;
              totalPrice: string;
            }) => ({
              productId: item.productId,
              quantity: parseInt(item.quantity),
              unitPrice: parseFloat(item.unitPrice),
              totalPrice: parseFloat(item.totalPrice),
            })
          ),
        },
      },
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        purchaseOrderItems: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return NextResponse.json(
      { error: "Failed to create purchase order" },
      { status: 500 }
    );
  }
}
