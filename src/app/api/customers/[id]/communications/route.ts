import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/customers/[id]/communications - Get communications for a customer
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const customerId = parseInt(params.id);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") || "";
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      customerId: number;
      type?: string;
    } = {
      customerId: customerId,
    };

    if (type) {
      where.type = type;
    }

    const communications = await prisma.customerCommunication.findMany({
      where,
      skip,
      take: limit,
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.customerCommunication.count({ where });

    return NextResponse.json({
      communications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching customer communications:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer communications" },
      { status: 500 }
    );
  }
}

// POST /api/customers/[id]/communications - Create a new communication for a customer
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const customerId = parseInt(params.id);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate input
    if (!body.type || !body.content || !body.direction) {
      return NextResponse.json(
        { error: "Communication type, content, and direction are required" },
        { status: 400 }
      );
    }

    const communication = await prisma.customerCommunication.create({
      data: {
        customerId: customerId,
        type: body.type,
        subject: body.subject,
        content: body.content,
        direction: body.direction,
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(communication, { status: 201 });
  } catch (error) {
    console.error("Error creating customer communication:", error);
    return NextResponse.json(
      { error: "Failed to create customer communication" },
      { status: 500 }
    );
  }
}
