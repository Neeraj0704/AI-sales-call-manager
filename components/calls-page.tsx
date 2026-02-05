"use client";

import { useState } from "react";
import { useAssistants, useCalls } from "@/lib/hooks";
import { RecentCallsTable } from "./recent-calls-table";
import { NewCallDialog } from "./new-call-dialog";

export function CallsPage() {
  const { data: agents, isLoading: agentsLoading } = useAssistants();
  const { data: calls, isLoading: callsLoading } = useCalls();
  const [showNewCall, setShowNewCall] = useState(false);

  const isLoading = agentsLoading || callsLoading;
  const agentList = Array.isArray(agents) ? agents : [];
  const callList = Array.isArray(calls) ? calls : [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Calls</h1>
          <p className="mt-1 text-sm text-muted-foreground">Loading...</p>
        </div>
        <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Calls</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {callList.length} total call{callList.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowNewCall(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Call
        </button>
      </div>

      <RecentCallsTable calls={callList} agents={agentList} limit={100} />

      <NewCallDialog open={showNewCall} onClose={() => setShowNewCall(false)} />
    </div>
  );
}
