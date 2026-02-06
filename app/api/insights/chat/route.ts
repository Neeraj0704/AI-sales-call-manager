import { generateText } from "ai";
import { createOllama } from "ollama-ai-provider-v2";
import { NextResponse } from "next/server";
import { vapiGet } from "@/lib/vapi";
import type { VapiCall } from "@/lib/types";

const MAX_CALLS = 5;
const MAX_TRANSCRIPT_CHARS = 2000;

/** Greetings / generic phrases – reply fast without fetching call data. */
const GENERAL_PATTERNS = [
  /^(hi|hey|hello|howdy|yo|sup|hiya|greetings)\s*[!.]?\s*$/i,
  /^(thanks?|thank you|thx|ok|okay|got it|cool|bye)\s*[!.]?\s*$/i,
  /^(what can you do|what do you do|help|who are you)\s*\??\s*$/i,
  /^[a-z]+[\s.!?]*$/i, // single word only (e.g. "hi", "hello")
];
/** Phrases that require call data – fetch and analyze. */
const NEEDS_DATA_PATTERNS = [
  /improve|improvement|better|recommendation/i,
  /summary|summarize|overview|recap/i,
  /metric|score|success|booked|appointment/i,
  /call(s)?\s*(history|data|transcript)?/i,
  /performance|objection|concern|feedback/i,
  /what\s+(did|went|happened|should)|how\s+(did|were)/i,
  /analyze|insight|pattern|trend/i,
];

function questionNeedsCallData(question: string): boolean {
  const trimmed = question.trim();
  if (!trimmed) return false;
  if (NEEDS_DATA_PATTERNS.some((p) => p.test(trimmed))) return true;
  if (GENERAL_PATTERNS.some((p) => p.test(trimmed))) return false;
  // Short and no clear analysis keywords → general (fast reply)
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount <= 2 && trimmed.length < 30) return false;
  return true;
}

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

    const ollama = createOllama({
      baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/api",
    });
    const modelName = process.env.OLLAMA_MODEL ?? "phi3";

    // General question (greeting, thanks, etc.) – reply fast without fetching call data
    if (!questionNeedsCallData(question)) {
      const quickResponse = await generateText({
        model: ollama(modelName),
        system: `You are the Insights assistant. The user sent a greeting or general message. Reply in 1–2 short, friendly lines. Optionally suggest they can ask about this agent's call performance, improvements, or metrics. Do not mention call data or transcripts.`,
        prompt: question,
        temperature: 0.3,
        maxTokens: 80,
      });
      return NextResponse.json({
        answer: quickResponse.text,
        hasData: false,
      });
    }

    // Analysis question – fetch call data and then answer
    const allCalls: VapiCall[] = await vapiGet("/call");
    const agentCalls = allCalls.filter((c) => c.assistantId === assistantId);
    const context = buildContextFromCalls(agentCalls);

    if (agentCalls.length === 0) {
      return NextResponse.json({
        answer:
          "No call history for this agent yet. Make at least one call and come back.",
        hasData: false,
      });
    }

    const systemPrompt = `You are a sales manager analyst. Answer questions about this agent's call history in exactly 4 to 5 short lines.

RULES:
1. Base your answer ONLY on the provided call data. Do not make up information.
2. Always cite metrics from the data: Success Score, Appointment Booked (Yes/No), Duration, and Call Summary. For example: "Avg success score 6/10; 1 of 4 calls booked (25%)."
3. Keep the response to 4–5 lines. No long paragraphs or bullet lists. One or two sentences per line is fine.
4. If asked about something not in the data, reply in one line: "I don't have that in this agent's call history."

Call data for the agent:
${context}`;

    const response = await generateText({
      model: ollama(modelName),
      system: systemPrompt,
      prompt: question,
      temperature: 0.3,
      maxTokens: 250,
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

    // Ollama not running or connection refused – friendly message
    const isConnectionError =
      /fetch failed|ECONNREFUSED|connect ECONNREFUSED|network/i.test(message);
    if (isConnectionError) {
      return NextResponse.json({
        answer:
          "Could not reach Ollama. Make sure Ollama is running locally (e.g. run `ollama serve` in a terminal and pull a model like `ollama pull phi3`).",
        hasData: true,
      });
    }

    // Model not found (404) – model not pulled in Ollama
    const modelName = process.env.OLLAMA_MODEL ?? "phi3";
    const isNotFound = /not found|404/i.test(message);
    if (isNotFound) {
      return NextResponse.json({
        answer: `Ollama model "${modelName}" was not found. Pull it first in a terminal: \`ollama pull ${modelName}\`. Then try again.`,
        hasData: true,
      });
    }

    console.error("[insights] Chat error:", { message, error });
    return NextResponse.json(
      {
        error: message,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
