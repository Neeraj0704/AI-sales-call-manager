import { NextResponse } from "next/server";
import { vapiGet } from "@/lib/vapi";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const call = await vapiGet(`/call/${id}`);
    return NextResponse.json(call);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch call";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
