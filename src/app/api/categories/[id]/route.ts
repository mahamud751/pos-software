import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/categories/[id] - Update a category
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    if (!body.name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if another category already exists with this name
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: body.name,
          mode: "insensitive",
        },
        NOT: {
          id: categoryId,
        },
      },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: body.name,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category is used by any products
    const productCount = await prisma.product.count({
      where: { categoryId: categoryId },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category that is used by products" },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
