"use client";

import Link from "next/link";
import { useCall, useAssistants } from "@/lib/hooks";
import { StatusBadge } from "./status-badge";

function formatDuration(startedAt?: string, endedAt?: string): string {
  if (!startedAt || !endedAt) return "--";
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  return `${mins}m ${remainSecs}s`;
}

function formatTimestamp(date?: string): string {
  if (!date) return "--";
  return new Date(date).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function ScoreRing({
  score,
  maxScore = 10,
}: {
  score: number;
  maxScore?: number;
}) {
  const pct = (score / maxScore) * 100;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  let color = "text-destructive";
  if (score >= 7) color = "text-success";
  else if (score >= 4) color = "text-warning";

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-secondary"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={color}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-xl font-bold ${color}`}>{score}</span>
        <span className="text-[10px] text-muted-foreground">/{maxScore}</span>
      </div>
    </div>
  );
}

function TranscriptViewer({
  messages,
  transcript,
}: {
  messages?: Array<{ role: string; message?: string; content?: string; time?: number }>;
  transcript?: string;
}) {
  if (messages && messages.length > 0) {
    return (
      <div className="flex flex-col gap-2">
        {messages.map((msg, i) => {
          const text = msg.message || msg.content || "";
          if (!text) return null;
          const isBot = msg.role === "bot" || msg.role === "assistant";
          return (
            <div
              key={`msg-${msg.time ?? i}`}
              className={`flex flex-col gap-0.5 rounded-lg px-4 py-2.5 ${
                isBot
                  ? "mr-8 bg-primary/10"
                  : "ml-8 bg-secondary"
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {isBot ? "Agent" : "Customer"}
              </span>
              <p className="text-sm leading-relaxed text-card-foreground">
                {text}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  if (transcript) {
    return (
      <div className="rounded-lg bg-secondary/50 p-4">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-card-foreground">
          {transcript}
        </pre>
      </div>
    );
  }

  return (
    <p className="py-8 text-center text-sm text-muted-foreground">
      No transcript available yet
    </p>
  );
}

export function CallDetail({ callId }: { callId: string }) {
  const { data: call, isLoading } = useCall(callId);
  const { data: agents } = useAssistants();

  const agentList = Array.isArray(agents) ? agents : [];
  const agent = agentList.find((a) => a.id === call?.assistantId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-48 animate-pulse rounded bg-secondary" />
        <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-sm text-muted-foreground">Call not found</p>
        <Link
          href="/dashboard/calls"
          className="text-sm font-medium text-primary hover:text-primary/80"
        >
          Back to Calls
        </Link>
      </div>
    );
  }

  const structuredData = call.analysis?.structuredData;
  const hasAnalysis = structuredData && (
    structuredData.successScore != null ||
    structuredData.appointmentBooked != null ||
    structuredData.callSummary
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/calls"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Back to calls"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">
              Call with {call.customer?.number ?? "Unknown"}
            </h1>
            <StatusBadge status={call.status ?? "ended"} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Agent: {agent?.name ?? call.assistantId?.slice(0, 8) ?? "Unknown"}
          </p>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Started
          </p>
          <p className="mt-1 text-sm font-medium text-card-foreground">
            {formatTimestamp(call.startedAt)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Duration
          </p>
          <p className="mt-1 font-mono text-sm font-medium text-card-foreground">
            {formatDuration(call.startedAt, call.endedAt)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Cost
          </p>
          <p className="mt-1 text-sm font-medium text-card-foreground">
            {call.cost != null ? `$${call.cost.toFixed(4)}` : "--"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Type
          </p>
          <p className="mt-1 text-sm font-medium capitalize text-card-foreground">
            {call.type ?? "outbound"}
          </p>
        </div>
      </div>

      {/* Analysis + Transcript */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Structured Outputs Panel */}
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Analysis
          </h2>

          {hasAnalysis ? (
            <>
              {structuredData?.successScore != null && (
                <div className="flex flex-col items-center gap-2">
                  <ScoreRing score={structuredData.successScore} />
                  <p className="text-xs font-medium text-muted-foreground">
                    Success Score
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {structuredData?.appointmentBooked != null && (
                  <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Appointment Booked
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        structuredData.appointmentBooked
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {structuredData.appointmentBooked ? "Yes" : "No"}
                    </span>
                  </div>
                )}

                {call.analysis?.successEvaluation && (
                  <div className="flex flex-col gap-1 rounded-md bg-secondary/50 px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Evaluation
                    </span>
                    <p className="text-sm text-card-foreground">
                      {call.analysis.successEvaluation}
                    </p>
                  </div>
                )}
              </div>

              {structuredData?.callSummary && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Summary
                  </span>
                  <p className="text-sm leading-relaxed text-card-foreground">
                    {structuredData.callSummary}
                  </p>
                </div>
              )}

              {call.analysis?.summary && !structuredData?.callSummary && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Summary
                  </span>
                  <p className="text-sm leading-relaxed text-card-foreground">
                    {call.analysis.summary}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">
                {call.status === "ended"
                  ? "No structured analysis available"
                  : "Analysis will appear after the call ends"}
              </p>
            </div>
          )}
        </div>

        {/* Transcript Panel */}
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Transcript
          </h2>
          <div className="max-h-[500px] overflow-y-auto">
            <TranscriptViewer
              messages={call.messages}
              transcript={call.transcript}
            />
          </div>
        </div>
      </div>

      {/* Recording */}
      {call.recordingUrl && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recording
          </h2>
          <audio controls className="w-full" src={call.recordingUrl}>
            <track kind="captions" />
          </audio>
        </div>
      )}
    </div>
  );
}
