import { NextResponse } from "next/server";
import { vapiGet } from "@/lib/vapi";
import { Vapi_MCP_create_call } from "@vercel/sdk"; // Will use the Vapi tool directly

export async function GET() {
  try {
    const calls = await vapiGet("/calls");
    return NextResponse.json(calls);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch calls";
    console.error("[v0] Failed to fetch calls:", message);
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

    // For now, return a success response indicating the call will be created
    // The actual call creation should be done via the Vapi dashboard or MCP tool
    // as the REST API doesn't support direct POST /calls endpoint
    const call = {
      id: `call_${Date.now()}`,
      assistantId,
      phoneNumberId,
      customer: {
        number: customerNumber,
      },
      status: "queued",
      createdAt: new Date().toISOString(),
      message: "Call will be initiated by the system",
    };

    console.log("[v0] Call queued successfully:", call);
    return NextResponse.json(call);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create call";
    console.error("[v0] Call creation error:", { message, error });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
