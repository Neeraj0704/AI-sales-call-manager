import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { vapiGet } from "@/lib/vapi";
import type { VapiCall } from "@/lib/types";

const MAX_CALLS = 5;
const MAX_TRANSCRIPT_CHARS = 2000;

interface InsightsChatRequest {
  assistantId: string;
  question: string;
}

function truncateTranscript(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + "...[truncated]";
}

function buildContextFromCalls(calls: VapiCall[]): string {
  if (calls.length === 0) {
    return "No call data available for this agent.";
  }

  const callSummaries = calls.slice(0, MAX_CALLS).map((call, idx) => {
    const duration =
      call.endedAt && call.startedAt
        ? (
            (new Date(call.endedAt).getTime() -
              new Date(call.startedAt).getTime()) /
            1000 /
            60
          ).toFixed(1)
        : "N/A";

    const appointmentBooked = call.analysis?.structuredData
      ?.appointmentBooked
      ? "Yes"
      : "No";
    const successScore =
      call.analysis?.structuredData?.successScore ?? "N/A";
    const callSummary =
      call.analysis?.structuredData?.callSummary ||
      call.analysis?.summary ||
      "No summary available";

    const transcript = call.transcript
      ? truncateTranscript(call.transcript, MAX_TRANSCRIPT_CHARS)
      : "No transcript available";

    return `
Call #${idx + 1} (${new Date(call.createdAt || "").toLocaleString()}):
- Duration: ${duration} minutes
- Appointment Booked: ${appointmentBooked}
- Success Score: ${successScore}/100
- Summary: ${callSummary}
- Transcript excerpt: ${transcript}
`;
  });

  return `Recent calls for this agent:\n${callSummaries.join("\n---\n")}`;
}

export async function POST(request: Request) {
  try {
    const body: InsightsChatRequest = await request.json();
    const { assistantId, question } = body;

    if (!assistantId || !question) {
      return NextResponse.json(
        { error: "assistantId and question are required" },
        { status: 400 }
      );
    }

    // Fetch all calls and filter by assistantId
    const allCalls: VapiCall[] = await vapiGet("/call");
    const agentCalls = allCalls.filter((c) => c.assistantId === assistantId);

    // Build context from agent's calls
    const context = buildContextFromCalls(agentCalls);

    // If no calls, return friendly message
    if (agentCalls.length === 0) {
      return NextResponse.json({
        answer:
          "No call history for this agent yet. Make at least one call and come back.",
        hasData: false,
      });
    }

    // Build system prompt with context
    const systemPrompt = `You are a sales manager analyst. Your job is to answer questions about a specific sales agent's call history.

You MUST:
1. Base your answer ONLY on the provided call data (transcripts, summaries, scores, appointment bookings).
2. If asked about something not in the data, say "I don't have information about that in this agent's call history."
3. Be concise and actionable. Focus on patterns and insights.
4. Do NOT make up or hallucinate information.
5. When you don't know something, admit it.

Here is the call data for the agent:
${context}`;

    // Call AI via Vercel AI Gateway
    const client = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://api.openai.com/v1",
    });

    const response = await generateText({
      model: client("gpt-4o-mini"),
      system: systemPrompt,
      prompt: question,
      temperature: 0.3,
      maxTokens: 500,
    });

    return NextResponse.json({
      answer: response.text,
      hasData: true,
      callCount: agentCalls.length,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to process insights chat";
    console.error("[v0] Insights chat error:", { message, error });
    return NextResponse.json(
      {
        error: message,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
