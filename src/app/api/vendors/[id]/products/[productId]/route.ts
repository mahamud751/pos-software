import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

// PUT /api/vendors/[id]/products/[productId] - Update a vendor product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user is admin, manager, or the vendor themselves
    if (
      decoded.role !== "ADMIN" &&
      decoded.role !== "MANAGER" &&
      decoded.userId !== parseInt(params.id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const vendorProduct = await prisma.vendorProduct.update({
      where: {
        vendorId_productId: {
          vendorId: parseInt(params.id),
          productId: parseInt(params.productId),
        },
      },
      data: {
        costPrice: body.costPrice,
        sellingPrice: body.sellingPrice,
        stock: body.stock,
        isActive: body.isActive,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(vendorProduct);
  } catch (error) {
    console.error("Error updating vendor product:", error);
    return NextResponse.json(
      { error: "Failed to update vendor product" },
      { status: 500 }
    );
  }
}

// DELETE /api/vendors/[id]/products/[productId] - Remove a product from a vendor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user is admin, manager, or the vendor themselves
    if (
      decoded.role !== "ADMIN" &&
      decoded.role !== "MANAGER" &&
      decoded.userId !== parseInt(params.id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.vendorProduct.delete({
      where: {
        vendorId_productId: {
          vendorId: parseInt(params.id),
          productId: parseInt(params.productId),
        },
      },
    });

    return NextResponse.json({
      message: "Vendor product removed successfully",
    });
  } catch (error) {
    console.error("Error removing vendor product:", error);
    return NextResponse.json(
      { error: "Failed to remove vendor product" },
      { status: 500 }
    );
  }
}
