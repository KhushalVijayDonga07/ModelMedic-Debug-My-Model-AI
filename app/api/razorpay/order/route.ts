import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { razorpay } from "@/lib/razorpay";
import { z } from "zod";

const schema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().min(3)
});

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = schema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const order = await razorpay.orders.create({
    amount: payload.data.amount,
    currency: payload.data.currency,
    receipt: `modelmedic_${Date.now()}"
  });

  return NextResponse.json({ orderId: order.id, order });
}