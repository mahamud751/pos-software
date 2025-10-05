import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe/paymentService";

// POST /api/payments/checkout - Create a checkout session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.items || !body.successUrl || !body.cancelUrl) {
      return NextResponse.json(
        { error: "Items, success URL, and cancel URL are required" },
        { status: 400 }
      );
    }

    // Create checkout session
    const result = await createCheckoutSession(
      body.items,
      body.successUrl,
      body.cancelUrl,
      body.metadata
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      sessionId: result.sessionId,
      url: result.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
