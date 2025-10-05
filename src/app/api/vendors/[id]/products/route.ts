import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

// GET /api/vendors/[id]/products - Get all products for a vendor
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const where: any = {
      vendorId: parseInt(params.id),
    };

    if (search) {
      where.product = {
        name: { contains: search, mode: "insensitive" },
      };
    }

    const vendorProducts = await prisma.vendorProduct.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
      },
    });

    const total = await prisma.vendorProduct.count({ where });

    return NextResponse.json({
      vendorProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor products" },
      { status: 500 }
    );
  }
}

// POST /api/vendors/[id]/products - Add a product to a vendor
export async function POST(
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

    // Check if user is admin, manager, or the vendor themselves
    if (
      decoded.role !== "ADMIN" &&
      decoded.role !== "MANAGER" &&
      decoded.userId !== parseInt(params.id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.productId || !body.costPrice || !body.sellingPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if vendor product already exists
    const existingVendorProduct = await prisma.vendorProduct.findFirst({
      where: {
        vendorId: parseInt(params.id),
        productId: body.productId,
      },
    });

    if (existingVendorProduct) {
      return NextResponse.json(
        { error: "Product already assigned to this vendor" },
        { status: 400 }
      );
    }

    const vendorProduct = await prisma.vendorProduct.create({
      data: {
        vendorId: parseInt(params.id),
        productId: body.productId,
        costPrice: body.costPrice,
        sellingPrice: body.sellingPrice,
        stock: body.stock || 0,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(vendorProduct, { status: 201 });
  } catch (error) {
    console.error("Error adding vendor product:", error);
    return NextResponse.json(
      { error: "Failed to add vendor product" },
      { status: 500 }
    );
  }
}
