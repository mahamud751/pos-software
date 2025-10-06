import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/warehouses/[id] - Get a specific warehouse
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid warehouse ID" },
        { status: 400 }
      );
    }

    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
    });

    if (!warehouse) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouse" },
      { status: 500 }
    );
  }
}

// PUT /api/warehouses/[id] - Update a warehouse
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid warehouse ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if warehouse exists
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id },
    });

    if (!existingWarehouse) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      );
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        name: body.name,
        location: body.location,
        isActive: body.isActive,
      },
    });

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to update warehouse" },
      { status: 500 }
    );
  }
}

// DELETE /api/warehouses/[id] - Delete a warehouse
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid warehouse ID" },
        { status: 400 }
      );
    }

    // Check if warehouse exists
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id },
    });

    if (!existingWarehouse) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      );
    }

    await prisma.warehouse.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Warehouse deleted successfully" });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return NextResponse.json(
      { error: "Failed to delete warehouse" },
      { status: 500 }
    );
  }
}
