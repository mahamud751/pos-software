import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/units/[id] - Update a unit
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const unitId = parseInt(params.id);

    if (isNaN(unitId)) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    const body = await request.json();

    // Validate input
    if (!body.name || !body.symbol) {
      return NextResponse.json(
        { error: "Unit name and symbol are required" },
        { status: 400 }
      );
    }

    // Check if unit exists
    const existingUnit = await prisma.unit.findUnique({
      where: { id: unitId },
    });

    if (!existingUnit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Check if another unit already exists with this name or symbol
    const duplicateUnit = await prisma.unit.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: body.name,
              mode: "insensitive",
            },
          },
          {
            symbol: {
              equals: body.symbol,
              mode: "insensitive",
            },
          },
        ],
        NOT: {
          id: unitId,
        },
      },
    });

    if (duplicateUnit) {
      return NextResponse.json(
        { error: "Unit with this name or symbol already exists" },
        { status: 400 }
      );
    }

    const unit = await prisma.unit.update({
      where: { id: unitId },
      data: {
        name: body.name,
        symbol: body.symbol,
      },
    });

    return NextResponse.json(unit);
  } catch (error) {
    console.error("Error updating unit:", error);
    return NextResponse.json(
      { error: "Failed to update unit" },
      { status: 500 }
    );
  }
}

// DELETE /api/units/[id] - Delete a unit
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const unitId = parseInt(params.id);

    if (isNaN(unitId)) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    // Check if unit exists
    const existingUnit = await prisma.unit.findUnique({
      where: { id: unitId },
    });

    if (!existingUnit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Check if unit is used by any products
    const productCount = await prisma.product.count({
      where: { unitId: unitId },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete unit that is used by products" },
        { status: 400 }
      );
    }

    await prisma.unit.delete({
      where: { id: unitId },
    });

    return NextResponse.json({ message: "Unit deleted successfully" });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return NextResponse.json(
      { error: "Failed to delete unit" },
      { status: 500 }
    );
  }
}
