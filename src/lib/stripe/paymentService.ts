import { stripe } from "./client";
import prisma from "@/lib/prisma";

// Create a payment intent
export async function createPaymentIntent(
  amount: number,
  currency: string = "usd",
  metadata?: Record<string, string>
) {
  try {
    // Validate amount
    if (amount <= 0) {
      throw new Error("Invalid payment amount");
    }

    const amountInCents = Math.round(amount * 100); // Convert to cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create payment intent",
    };
  }
}

// Confirm a payment
export async function confirmPayment(
  paymentIntentId: string,
  paymentMethodId: string
) {
  try {
    // Validate inputs
    if (!paymentIntentId || !paymentMethodId) {
      throw new Error("Payment intent ID and payment method ID are required");
    }

    // First, retrieve the payment intent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // If it's already succeeded, don't try to confirm it again
    if (paymentIntent.status === "succeeded") {
      return {
        success: true,
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id,
      };
    }

    // Otherwise, confirm the payment
    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
      paymentIntentId,
      {
        payment_method: paymentMethodId,
      }
    );

    return {
      success: true,
      status: confirmedPaymentIntent.status,
      paymentIntentId: confirmedPaymentIntent.id,
    };
  } catch (error) {
    console.error("Error confirming payment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to confirm payment",
    };
  }
}

// Refund a payment
export async function refundPayment(paymentIntentId: string, amount?: number) {
  try {
    // First, retrieve the payment intent to get the charge ID
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent.latest_charge) {
      throw new Error("No charge found for this payment intent");
    }

    const refund = await stripe.refunds.create({
      charge: paymentIntent.latest_charge as string,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if provided
    });

    return {
      success: true,
      refundId: refund.id,
      status: refund.status,
    };
  } catch (error) {
    console.error("Error refunding payment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to refund payment",
    };
  }
}

// Create a checkout session
export async function createCheckoutSession(
  items: { name: string; price: number; quantity: number }[],
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
) {
  try {
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create checkout session",
    };
  }
}

// Save payment to database
export async function savePaymentToDatabase(paymentData: {
  saleId: number;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId: string;
  paymentIntentId?: string;
}) {
  try {
    // Validate inputs
    if (!paymentData.saleId || paymentData.amount < 0) {
      throw new Error("Invalid sale ID or payment amount");
    }

    // First, get the current sale to calculate the correct amountDue
    const currentSale = await prisma.sale.findUnique({
      where: { id: paymentData.saleId },
    });

    if (!currentSale) {
      throw new Error("Sale not found");
    }

    // Calculate new amount paid (existing amount paid + new payment)
    const newAmountPaid = currentSale.amountPaid + paymentData.amount;
    // Calculate amount due (totalAmount - new amount paid)
    const amountDue = Math.max(0, currentSale.totalAmount - newAmountPaid);

    const payment = await prisma.sale.update({
      where: { id: paymentData.saleId },
      data: {
        amountPaid: newAmountPaid,
        amountDue: amountDue,
        paymentMethod: paymentData.paymentMethod,
        status: amountDue <= 0 ? "completed" : "partial",
        notes: paymentData.transactionId,
      },
    });

    return {
      success: true,
      payment,
    };
  } catch (error) {
    console.error("Error saving payment to database:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save payment to database",
    };
  }
}
