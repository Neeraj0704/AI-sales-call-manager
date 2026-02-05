import { NextResponse } from "next/server";
import { vapiGet } from "@/lib/vapi";

export async function GET() {
  try {
    const phoneNumbers = await vapiGet("/phone-number");
    return NextResponse.json(phoneNumbers);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch phone numbers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
