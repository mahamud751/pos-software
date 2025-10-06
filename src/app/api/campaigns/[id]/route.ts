import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/campaigns/[id] - Get a specific campaign
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        coupons: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/[id] - Update a campaign
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const campaign = await prisma.campaign.update({
      where: { id: parseInt(params.id) },
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        status: body.status,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        targetSegments: body.targetSegments,
        content: body.content,
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id] - Delete a campaign
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Delete the campaign
    await prisma.campaign.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
