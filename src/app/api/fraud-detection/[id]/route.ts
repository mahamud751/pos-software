import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/fraud-detection/[id] - Get a specific fraud detection record
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const fraudDetection = await prisma.fraudDetection.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        sale: {
          include: {
            customer: true,
            saleItems: {
              include: {
                product: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!fraudDetection) {
      return NextResponse.json(
        { error: "Fraud detection record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(fraudDetection);
  } catch (error) {
    console.error("Error fetching fraud detection:", error);
    return NextResponse.json(
      { error: "Failed to fetch fraud detection" },
      { status: 500 }
    );
  }
}

// PUT /api/fraud-detection/[id] - Update a fraud detection record
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();

    // Check if fraud detection exists
    const existingFraudDetection = await prisma.fraudDetection.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingFraudDetection) {
      return NextResponse.json(
        { error: "Fraud detection record not found" },
        { status: 404 }
      );
    }

    const fraudDetection = await prisma.fraudDetection.update({
      where: { id: parseInt(params.id) },
      data: {
        riskScore: body.riskScore,
        flags: body.flags,
        status: body.status,
        reviewedBy: body.reviewedBy,
        reviewedAt: body.reviewedAt ? new Date(body.reviewedAt) : null,
        notes: body.notes,
      },
    });

    return NextResponse.json(fraudDetection);
  } catch (error) {
    console.error("Error updating fraud detection:", error);
    return NextResponse.json(
      { error: "Failed to update fraud detection" },
      { status: 500 }
    );
  }
}

// DELETE /api/fraud-detection/[id] - Delete a fraud detection record
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Check if fraud detection exists
    const existingFraudDetection = await prisma.fraudDetection.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingFraudDetection) {
      return NextResponse.json(
        { error: "Fraud detection record not found" },
        { status: 404 }
      );
    }

    // Delete the fraud detection record
    await prisma.fraudDetection.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({
      message: "Fraud detection record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting fraud detection:", error);
    return NextResponse.json(
      { error: "Failed to delete fraud detection record" },
      { status: 500 }
    );
  }
}
