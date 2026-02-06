"use client";

import Link from "next/link";
import type { VapiAssistant, VapiCall } from "@/lib/types";

function formatCallDate(createdAt?: string): string {
  if (!createdAt) return "—";
  return new Date(createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Hardcoded sample structured outputs for now. */
const SAMPLE_OUTPUTS = [
  {
    successScore: 7,
    appointmentBooked: true,
    callSummary:
      "Prospect asked about pricing and product tiers. Agent explained options and booked a follow-up demo for next week.",
  },
  {
    successScore: 5,
    appointmentBooked: false,
    callSummary:
      "Call ended early. Prospect mentioned they were not interested in the current offering. Agent offered to follow up in a few months.",
  },
  {
    successScore: 8,
    appointmentBooked: true,
    callSummary:
      "Strong interest in enterprise plan. Agent qualified the lead and scheduled a technical walkthrough.",
  },
];

export function AgentStructuredOutputDialog({
  agent,
  calls,
  open,
  onClose,
}: {
  agent: VapiAssistant;
  calls: VapiCall[];
  open: boolean;
  onClose: () => void;
}) {
  const endedCalls = calls
    .filter((c) => c.assistantId === agent.id && c.status === "ended")
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
    );

  // For now: show at least 2 hardcoded sample cards so the dialog has content
  const cardsToShow =
    endedCalls.length > 0
      ? endedCalls
      : [
          { id: "sample-1", createdAt: new Date().toISOString() },
          { id: "sample-2", createdAt: new Date(Date.now() - 86400000).toISOString() },
        ] as Array<{ id: string; createdAt?: string }>;
  const subtitle =
    endedCalls.length > 0
      ? `Structured outputs from ${endedCalls.length} call${endedCalls.length !== 1 ? "s" : ""}`
      : "Sample structured outputs (hardcoded)";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close dialog"
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-lg border border-border bg-card shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {agent.name?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div>
              <h2 className="text-base font-semibold text-card-foreground">
                {agent.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-card-foreground"
            aria-label="Close"
            type="button"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="flex flex-col gap-4">
            {cardsToShow.map((call, index) => {
              // For now: use hardcoded sample values
              const sample = SAMPLE_OUTPUTS[index % SAMPLE_OUTPUTS.length];
              const score = sample.successScore;
              const booked = sample.appointmentBooked;
              const summary = sample.callSummary;
              const isRealCall =
                endedCalls.length > 0 && endedCalls.some((c) => c.id === call.id);

              return (
                <li
                  key={call.id}
                  className="rounded-lg border border-border bg-secondary/20 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {formatCallDate(call.createdAt)}
                    </span>
                    {isRealCall ? (
                      <Link
                        href={`/dashboard/calls/${call.id}`}
                        className="text-xs font-medium text-primary hover:text-primary/80"
                      >
                        View call →
                      </Link>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-md bg-card px-3 py-2">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Success score
                      </p>
                      <p className="text-sm font-semibold text-card-foreground">
                        {score}/10
                      </p>
                    </div>
                    <div className="rounded-md bg-card px-3 py-2">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Appointment booked
                      </p>
                      <p className="text-sm font-semibold text-card-foreground">
                        {booked ? (
                          <span className="text-success">Yes</span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-md border border-border bg-card/50 px-3 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Call summary
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-card-foreground">
                      {summary}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
