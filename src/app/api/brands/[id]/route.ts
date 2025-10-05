import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/brands/[id] - Update a brand
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = parseInt(params.id);

    if (isNaN(brandId)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 });
    }

    const body = await request.json();

    // Validate input
    if (!body.name) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!existingBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check if another brand already exists with this name
    const duplicateBrand = await prisma.brand.findFirst({
      where: {
        name: {
          equals: body.name,
          mode: "insensitive",
        },
        NOT: {
          id: brandId,
        },
      },
    });

    if (duplicateBrand) {
      return NextResponse.json(
        { error: "Brand with this name already exists" },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.update({
      where: { id: brandId },
      data: {
        name: body.name,
      },
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: "Failed to update brand" },
      { status: 500 }
    );
  }
}

// DELETE /api/brands/[id] - Delete a brand
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = parseInt(params.id);

    if (isNaN(brandId)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 });
    }

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!existingBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check if brand is used by any products
    const productCount = await prisma.product.count({
      where: { brandId: brandId },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete brand that is used by products" },
        { status: 400 }
      );
    }

    await prisma.brand.delete({
      where: { id: brandId },
    });

    return NextResponse.json({ message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { error: "Failed to delete brand" },
      { status: 500 }
    );
  }
}
