import { NextRequest, NextResponse } from "next/server";
import {
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  savePaymentToDatabase,
} from "@/lib/stripe/paymentService";

// POST /api/payments/create-payment-intent - Create a payment intent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.amount || !body.saleId) {
      return NextResponse.json(
        { error: "Amount and sale ID are required" },
        { status: 400 }
      );
    }

    // Create payment intent
    const result = await createPaymentIntent(
      body.amount,
      body.currency || "usd",
      {
        saleId: body.saleId,
        ...body.metadata,
      }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
