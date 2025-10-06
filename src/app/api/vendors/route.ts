import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

// GET /api/vendors - Get all vendors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: {
      OR?: {
        name?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
        phone?: { contains: string; mode: "insensitive" };
      }[];
      isActive?: boolean;
      isApproved?: boolean;
    } = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    } else if (status === "pending") {
      where.isApproved = false;
    } else if (status === "approved") {
      where.isApproved = true;
    }

    const vendors = await prisma.vendor.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        vendorProducts: {
          include: {
            product: true,
          },
        },
        commissions: {
          where: {
            status: "pending",
          },
        },
      },
    });

    const total = await prisma.vendor.count({ where });

    return NextResponse.json({
      vendors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}

// POST /api/vendors - Create a new vendor
export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.contactPerson) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if vendor with same email or phone already exists
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        OR: [{ email: body.email }, { phone: body.phone }],
      },
    });

    if (existingVendor) {
      return NextResponse.json(
        { error: "Vendor with this email or phone already exists" },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address || null,
        contactPerson: body.contactPerson,
        commissionRate: body.commissionRate || 10,
        bankAccount: body.bankAccount || null,
        taxId: body.taxId || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        isApproved: body.isApproved !== undefined ? body.isApproved : false,
      },
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      { error: "Failed to create vendor" },
      { status: 500 }
    );
  }
}
