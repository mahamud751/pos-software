import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/purchases - Get all purchases
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const purchases = await prisma.purchase.findMany({
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
        purchaseItems: {
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

    const total = await prisma.purchase.count();

    return NextResponse.json({
      purchases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}

// POST /api/purchases - Create a new purchase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Start a transaction to ensure data consistency
    const purchase = await prisma.$transaction(async (prisma) => {
      // Create the purchase
      const newPurchase = await prisma.purchase.create({
        data: {
          supplierId: body.supplierId,
          userId: body.userId,
          invoiceNumber: body.invoiceNumber,
          subtotal: parseFloat(body.subtotal),
          taxAmount: parseFloat(body.taxAmount),
          discount: parseFloat(body.discount),
          totalAmount: parseFloat(body.totalAmount),
          amountPaid: parseFloat(body.amountPaid),
          amountDue: parseFloat(body.amountDue),
          status: body.status,
          notes: body.notes,
        },
      });

      // Create purchase items and update product stock
      for (const item of body.purchaseItems) {
        await prisma.purchaseItem.create({
          data: {
            purchaseId: newPurchase.id,
            productId: item.productId,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.totalPrice),
          },
        });

        // Update product stock
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: parseInt(item.quantity),
            },
          },
        });
      }

      return newPurchase;
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 }
    );
  }
}
