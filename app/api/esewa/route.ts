import { NextResponse } from "next/server";

const MERCHANT_ID = "EPAYTEST";
const ESEWA_URL = "https://rc-epay.esewa.com.np/epay/main";

export async function POST(req: Request) {
  try {
    const { amount, orderId } = await req.json();
    const requestUrl = new URL(req.url);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || requestUrl.origin;
    const total = String(amount);

    return NextResponse.json({
      amt: total,
      txAmt: "0",
      psc: "0",
      pdc: "0",
      tAmt: total,
      pid: orderId,
      scd: MERCHANT_ID,
      su: `${baseUrl}/payment/success`,
      fu: `${baseUrl}/payment/failure`,
      esewa_url: ESEWA_URL,
    });
  } catch (error) {
    console.error("eSewa route error:", error);
    return NextResponse.json({ error: "Failed to build payment payload" }, { status: 500 });
  }
}
