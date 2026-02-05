"use client";

import Link from "next/link";
import type { VapiCall, VapiAssistant } from "@/lib/types";
import { StatusBadge } from "./status-badge";

function formatDuration(startedAt?: string, endedAt?: string): string {
  if (!startedAt || !endedAt) return "--";
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  return `${mins}:${String(remainSecs).padStart(2, "0")}`;
}

function formatTime(date?: string): string {
  if (!date) return "--";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getAgentName(
  assistantId?: string,
  agents: VapiAssistant[] = [],
): string {
  if (!assistantId) return "Unknown";
  const agent = agents.find((a) => a.id === assistantId);
  return agent?.name ?? assistantId.slice(0, 8);
}

export function RecentCallsTable({
  calls,
  agents,
  limit = 10,
}: {
  calls: VapiCall[];
  agents: VapiAssistant[];
  limit?: number;
}) {
  const sorted = [...calls]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime(),
    )
    .slice(0, limit);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-12">
        <p className="text-sm text-muted-foreground">No calls yet</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Initiate a call from the Calls page
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Agent
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Customer
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Duration
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Score
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((call) => (
            <tr
              key={call.id}
              className="bg-card transition-colors hover:bg-secondary/20"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/calls/${call.id}`}
                  className="text-sm font-medium text-card-foreground hover:text-primary"
                >
                  {getAgentName(call.assistantId, agents)}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {call.customer?.number ?? "--"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={call.status ?? "ended"} />
              </td>
              <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                {formatDuration(call.startedAt, call.endedAt)}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-card-foreground">
                {call.analysis?.structuredData?.successScore != null
                  ? `${call.analysis.structuredData.successScore}/10`
                  : "--"}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatTime(call.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
