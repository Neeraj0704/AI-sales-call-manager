"use client";

import Link from "next/link";
import { useAssistants, useCalls, useHiddenCalls } from "@/lib/hooks";
import { AgentCard } from "./agent-card";
import { StatCard } from "./stat-card";
import { RecentCallsTable } from "./recent-calls-table";

export function OverviewDashboard() {
  const { data: agents, isLoading: agentsLoading, error: agentsError } = useAssistants();
  const { data: calls, isLoading: callsLoading, error: callsError } = useCalls();
  const { hiddenIds, hideCall } = useHiddenCalls();

  const isLoading = agentsLoading || callsLoading;
  const hasError = agentsError || callsError;
  const agentList = Array.isArray(agents) ? agents : [];
  const allCalls = Array.isArray(calls) ? calls : [];
  const callList = allCalls.filter((c) => !hiddenIds.has(c.id));

  const endedCalls = callList.filter((c) => c.status === "ended");
  const activeCalls = callList.filter(
    (c) =>
      c.status === "in-progress" ||
      c.status === "ringing" ||
      c.status === "queued",
  );

  const scores = endedCalls
    .map((c) => c.analysis?.structuredData?.successScore)
    .filter((s): s is number => typeof s === "number");
  const avgScore =
    scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : "--";

  const bookedCount = endedCalls.filter(
    (c) => c.analysis?.structuredData?.appointmentBooked === true,
  ).length;
  const bookedRate =
    endedCalls.length > 0
      ? `${Math.round((bookedCount / endedCalls.length) * 100)}%`
      : "--";

  if (hasError) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-destructive">
            Failed to load data. Check your VAPI_API_KEY in environment variables.
          </p>
          <pre className="mt-2 max-w-lg overflow-auto rounded-md bg-card p-3 text-xs text-muted-foreground">
            {agentsError?.message ?? callsError?.message ?? "Unknown error"}
          </pre>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Loading dashboard...
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border border-border bg-card"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor your AI sales team in real-time
          </p>
        </div>
        <Link
          href="/dashboard/calls"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            <line x1="16" y1="2" x2="22" y2="2" />
            <line x1="22" y1="2" x2="22" y2="8" />
            <line x1="16" y1="8" x2="22" y2="2" />
          </svg>
          New Call
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Agents"
          value={String(agentList.length)}
          subValue={`${activeCalls.length} in call`}
        />
        <StatCard
          label="Total Calls"
          value={String(callList.length)}
          subValue={`${endedCalls.length} completed`}
        />
        <StatCard
          label="Avg Score"
          value={avgScore === "--" ? "--" : `${avgScore}/10`}
          subValue={scores.length > 0 ? `From ${scores.length} scored calls` : "No scored calls yet"}
        />
        <StatCard
          label="Booked Rate"
          value={bookedRate}
          subValue={bookedCount > 0 ? `${bookedCount} appointments` : "No bookings yet"}
        />
      </div>

      {/* Agents Section */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Agents
        </h2>
        {agentList.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No agents configured. Create an assistant in Vapi to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {agentList.map((agent) => (
              <AgentCard key={agent.id} agent={agent} calls={callList} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Calls */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Calls
          </h2>
          <Link
            href="/dashboard/calls"
            className="text-xs font-medium text-primary hover:text-primary/80"
          >
            View all
          </Link>
        </div>
        <RecentCallsTable calls={callList} agents={agentList} limit={5} onHideCall={hideCall} />
      </div>
    </div>
  );
}
