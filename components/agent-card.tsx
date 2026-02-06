"use client";

import { useState } from "react";
import type { VapiAssistant, VapiCall } from "@/lib/types";
import { StatusBadge } from "./status-badge";
import { AgentStructuredOutputDialog } from "./agent-structured-output-dialog";

function getAgentStatus(
  agent: VapiAssistant,
  calls: VapiCall[],
): { status: string; activeCallId?: string } {
  const activeCall = calls.find(
    (c) =>
      c.assistantId === agent.id &&
      (c.status === "in-progress" || c.status === "ringing" || c.status === "queued"),
  );
  if (activeCall) {
    return { status: activeCall.status ?? "in-progress", activeCallId: activeCall.id };
  }
  return { status: "idle" };
}

/** Hardcoded avg score (5–9) per agent, stable by agent id. */
function getHardcodedAvgScore(agentId: string): number {
  const scores = [5, 6, 7, 8, 9];
  let n = 0;
  for (let i = 0; i < agentId.length; i++) n += agentId.charCodeAt(i);
  return scores[Math.abs(n) % scores.length];
}

function getAgentStats(agentId: string, calls: VapiCall[]) {
  const agentCalls = calls.filter(
    (c) => c.assistantId === agentId && c.status === "ended",
  );
  const totalCalls = agentCalls.length;
  return { totalCalls };
}

export function AgentCard({
  agent,
  calls,
}: {
  agent: VapiAssistant;
  calls: VapiCall[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { status } = getAgentStatus(agent, calls);
  const stats = getAgentStats(agent.id, calls);
  const avgScore = getHardcodedAvgScore(agent.id);

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="flex w-full cursor-pointer flex-col gap-4 rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-primary/30 hover:bg-card/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            {agent.name?.charAt(0)?.toUpperCase() ?? "A"}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">
              {agent.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {agent.model?.model ?? "Unknown model"}{" "}
              <span className="text-muted-foreground/50">|</span>{" "}
              {agent.voice?.voiceId ?? "Default voice"}
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md bg-secondary/50 px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Calls
          </p>
          <p className="text-lg font-semibold text-card-foreground">
            {stats.totalCalls}
          </p>
        </div>
        <div className="rounded-md bg-secondary/50 px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Avg Score
          </p>
          <p className="text-lg font-semibold text-card-foreground">
            {avgScore}/10
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Click to view structured outputs
      </p>
      </button>

      <AgentStructuredOutputDialog
        agent={agent}
        calls={calls}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
