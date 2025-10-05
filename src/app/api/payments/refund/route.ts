import { NextRequest, NextResponse } from "next/server";
import { refundPayment } from "@/lib/stripe/paymentService";

// POST /api/payments/refund - Refund a payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    // Refund payment with Stripe
    const result = await refundPayment(body.paymentIntentId, body.amount);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      refundId: result.refundId,
      status: result.status,
    });
  } catch (error) {
    console.error("Error refunding payment:", error);
    return NextResponse.json(
      { error: "Failed to refund payment" },
      { status: 500 }
    );
  }
}
