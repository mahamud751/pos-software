import { NextRequest, NextResponse } from "next/server";
import {
  confirmPayment,
  savePaymentToDatabase,
} from "@/lib/stripe/paymentService";

// POST /api/payments/confirm - Confirm a payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.paymentIntentId || !body.paymentMethodId || !body.saleId) {
      return NextResponse.json(
        {
          error:
            "Payment intent ID, payment method ID, and sale ID are required",
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof body.amount !== "number" || body.amount < 0) {
      return NextResponse.json(
        {
          error: "Invalid payment amount",
        },
        { status: 400 }
      );
    }

    // Confirm payment with Stripe
    const result = await confirmPayment(
      body.paymentIntentId,
      body.paymentMethodId
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Save payment to database
    const dbResult = await savePaymentToDatabase({
      saleId: body.saleId,
      amount: body.amount,
      paymentMethod: "card",
      status: result.status === "succeeded" ? "completed" : "pending",
      transactionId: body.paymentIntentId,
      paymentIntentId: body.paymentIntentId,
    });

    if (!dbResult.success) {
      console.error("Failed to save payment to database:", dbResult.error);
      return NextResponse.json(
        { error: `Failed to update sale record: ${dbResult.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: result.status,
      paymentIntentId: result.paymentIntentId,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
