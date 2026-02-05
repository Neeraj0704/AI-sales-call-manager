import { NextResponse } from "next/server";
import { vapiGet } from "@/lib/vapi";

export async function GET() {
  try {
    const assistants = await vapiGet("/assistant");
    return NextResponse.json(assistants);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch assistants";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
