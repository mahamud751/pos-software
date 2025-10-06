import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/fraud-detection - Get all fraud detections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      OR?: {
        sale?: {
          customer?: { name?: { contains: string; mode: "insensitive" } };
          invoiceNumber?: { contains: string; mode: "insensitive" };
        };
      }[];
      status?: string;
    } = {};

    if (search) {
      where.OR = [
        {
          sale: {
            customer: { name: { contains: search, mode: "insensitive" } },
          },
        },
        { sale: { invoiceNumber: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const fraudDetections = await prisma.fraudDetection.findMany({
      where,
      skip,
      take: limit,
      include: {
        sale: {
          include: {
            customer: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.fraudDetection.count({ where });

    return NextResponse.json({
      fraudDetections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching fraud detections:", error);
    return NextResponse.json(
      { error: "Failed to fetch fraud detections" },
      { status: 500 }
    );
  }
}

// POST /api/fraud-detection - Create a new fraud detection record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.saleId || body.riskScore === undefined) {
      return NextResponse.json(
        { error: "Sale ID and risk score are required" },
        { status: 400 }
      );
    }

    // Check if fraud detection already exists for this sale
    const existingFraudDetection = await prisma.fraudDetection.findUnique({
      where: { saleId: body.saleId },
    });

    if (existingFraudDetection) {
      return NextResponse.json(
        { error: "Fraud detection already exists for this sale" },
        { status: 400 }
      );
    }

    const fraudDetection = await prisma.fraudDetection.create({
      data: {
        saleId: body.saleId,
        riskScore: body.riskScore,
        flags: body.flags || "[]",
        status: body.status || "pending",
        notes: body.notes,
      },
    });

    return NextResponse.json(fraudDetection, { status: 201 });
  } catch (error) {
    console.error("Error creating fraud detection:", error);
    return NextResponse.json(
      { error: "Failed to create fraud detection" },
      { status: 500 }
    );
  }
}
