import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/campaigns - Get all campaigns
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
      name?: { contains: string; mode: "insensitive" };
      status?: string;
    } = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (status) {
      where.status = status;
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: { coupons: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.campaign.count({ where });

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.name || !body.type || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: "Campaign name, type, start date, and end date are required" },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        targetSegments: body.targetSegments,
        content: body.content || "{}",
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
