"use client";

import type { VapiAssistant, VapiCall } from "@/lib/types";
import { StatusBadge } from "./status-badge";

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

function getAgentStats(agentId: string, calls: VapiCall[]) {
  const agentCalls = calls.filter(
    (c) => c.assistantId === agentId && c.status === "ended",
  );
  const totalCalls = agentCalls.length;

  const scores = agentCalls
    .map((c) => c.analysis?.structuredData?.successScore)
    .filter((s): s is number => typeof s === "number");
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const booked = agentCalls.filter(
    (c) => c.analysis?.structuredData?.appointmentBooked === true,
  ).length;
  const bookedRate =
    totalCalls > 0 ? Math.round((booked / totalCalls) * 100) : 0;

  return { totalCalls, avgScore, bookedRate };
}

export function AgentCard({
  agent,
  calls,
}: {
  agent: VapiAssistant;
  calls: VapiCall[];
}) {
  const { status } = getAgentStatus(agent, calls);
  const stats = getAgentStats(agent.id, calls);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
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

      <div className="grid grid-cols-3 gap-3">
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
            {stats.avgScore > 0 ? `${stats.avgScore}/10` : "--"}
          </p>
        </div>
        <div className="rounded-md bg-secondary/50 px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Booked
          </p>
          <p className="text-lg font-semibold text-card-foreground">
            {stats.bookedRate > 0 ? `${stats.bookedRate}%` : "--"}
          </p>
        </div>
      </div>
    </div>
  );
}
