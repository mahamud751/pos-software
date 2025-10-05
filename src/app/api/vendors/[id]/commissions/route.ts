import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

// GET /api/vendors/[id]/commissions - Get all commissions for a vendor
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
    const status = searchParams.get("status") || "";

    const where: any = {
      vendorId: parseInt(params.id),
    };

    if (status) {
      where.status = status;
    }

    const commissions = await prisma.commission.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        sale: true,
      },
    });

    const total = await prisma.commission.count({ where });

    return NextResponse.json({
      commissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching vendor commissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor commissions" },
      { status: 500 }
    );
  }
}

// POST /api/vendors/[id]/commissions - Pay a commission to a vendor
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

    // Check if user is admin or manager
    if (decoded.role !== "ADMIN" && decoded.role !== "MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.commissionId || !body.transactionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const commission = await prisma.commission.update({
      where: { id: body.commissionId },
      data: {
        status: "paid",
        paymentDate: new Date(),
        transactionId: body.transactionId,
        notes: body.notes,
      },
      include: {
        vendor: true,
        sale: true,
      },
    });

    // Create a notification for the vendor
    await prisma.notification.create({
      data: {
        vendorId: commission.vendorId,
        type: "commission_paid",
        title: "Commission Paid",
        message: `Commission of $${commission.amount.toFixed(
          2
        )} has been paid for sale #${commission.sale?.invoiceNumber || "N/A"}`,
        priority: 1,
      },
    });

    return NextResponse.json(commission);
  } catch (error) {
    console.error("Error paying vendor commission:", error);
    return NextResponse.json(
      { error: "Failed to pay vendor commission" },
      { status: 500 }
    );
  }
}
