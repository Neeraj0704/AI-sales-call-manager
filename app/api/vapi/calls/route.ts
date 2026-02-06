import { NextResponse } from "next/server";
import { vapiGet, vapiPost } from "@/lib/vapi";

export async function GET() {
  try {
    const calls = await vapiGet("/calls");
    return NextResponse.json(calls);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch calls";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { assistantId, phoneNumberId, customerNumber } = body;

    if (!assistantId || !phoneNumberId || !customerNumber) {
      return NextResponse.json(
        { error: "assistantId, phoneNumberId, and customerNumber are required" },
        { status: 400 },
      );
    }

    console.log("[v0] Creating call with:", { assistantId, phoneNumberId, customerNumber });

    // Vapi expects phoneNumber field (the ID), not phoneNumberId
    const call = await vapiPost("/calls", {
      assistantId,
      phoneNumber: phoneNumberId,
      customer: {
        number: customerNumber,
      },
    });

    console.log("[v0] Call created successfully:", call);
    return NextResponse.json(call);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create call";
    console.error("[v0] Call creation error:", { message, error });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
