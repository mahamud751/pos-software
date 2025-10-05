import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

// GET /api/vendors/[id] - Get a specific vendor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        vendorProducts: {
          include: {
            product: true,
          },
        },
        commissions: {
          include: {
            sale: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor" },
      { status: 500 }
    );
  }
}

// PUT /api/vendors/[id] - Update a vendor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if user is admin or manager
    if (decoded.role !== "ADMIN" && decoded.role !== "MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const vendor = await prisma.vendor.update({
      where: { id: parseInt(params.id) },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        contactPerson: body.contactPerson,
        commissionRate: body.commissionRate,
        bankAccount: body.bankAccount,
        taxId: body.taxId,
        isActive: body.isActive,
        isApproved: body.isApproved,
      },
    });

    return NextResponse.json(vendor);
  } catch (error) {
    console.error("Error updating vendor:", error);
    return NextResponse.json(
      { error: "Failed to update vendor" },
      { status: 500 }
    );
  }
}

// DELETE /api/vendors/[id] - Delete a vendor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if user is admin
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if vendor has any products or commissions
    const vendorProducts = await prisma.vendorProduct.count({
      where: { vendorId: parseInt(params.id) },
    });

    const commissions = await prisma.commission.count({
      where: { vendorId: parseInt(params.id) },
    });

    if (vendorProducts > 0 || commissions > 0) {
      return NextResponse.json(
        { error: "Cannot delete vendor with products or commissions" },
        { status: 400 }
      );
    }

    await prisma.vendor.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return NextResponse.json(
      { error: "Failed to delete vendor" },
      { status: 500 }
    );
  }
}
