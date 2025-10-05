import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/sales - Get all sales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const sales = await prisma.sale.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
          },
        },
        customer: {
          select: {
            name: true,
          },
        },
        saleItems: {
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

    const total = await prisma.sale.count();

    return NextResponse.json({
      sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

// POST /api/sales - Create a new sale
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Start a transaction to ensure data consistency
    const sale = await prisma.$transaction(async (prisma) => {
      // Create the sale
      const newSale = await prisma.sale.create({
        data: {
          userId: body.userId,
          customerId: body.customerId,
          invoiceNumber: body.invoiceNumber,
          subtotal: parseFloat(body.subtotal),
          taxAmount: parseFloat(body.taxAmount),
          discount: parseFloat(body.discount),
          totalAmount: parseFloat(body.totalAmount),
          amountPaid: parseFloat(body.amountPaid),
          amountDue: parseFloat(body.amountDue),
          paymentMethod: body.paymentMethod,
          status: body.status,
          notes: body.notes,
        },
      });

      // Create sale items and update product stock
      for (const item of body.saleItems) {
        await prisma.saleItem.create({
          data: {
            saleId: newSale.id,
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
              decrement: parseInt(item.quantity),
            },
          },
        });
      }

      return newSale;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}
