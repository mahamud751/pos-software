import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/expenses - Get all expenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      categoryId?: number;
      date?: { gte?: Date; lte?: Date };
    } = {};

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const total = await prisma.expense.count({ where });

    // Calculate total amount
    const totalAmountResult = await prisma.expense.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      totalAmount: totalAmountResult._sum.amount || 0,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const expense = await prisma.expense.create({
      data: {
        categoryId: parseInt(body.categoryId),
        userId: parseInt(body.userId),
        amount: parseFloat(body.amount),
        description: body.description,
        date: new Date(body.date),
      },
      include: {
        category: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
