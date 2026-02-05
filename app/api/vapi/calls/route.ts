import { NextResponse } from "next/server";
import { vapiGet, vapiPost } from "@/lib/vapi";

export async function GET() {
  try {
    const calls = await vapiGet("/call");
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

    const call = await vapiPost("/call", {
      assistantId,
      phoneNumberId,
      customer: {
        number: customerNumber,
      },
    });

    return NextResponse.json(call);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create call";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
