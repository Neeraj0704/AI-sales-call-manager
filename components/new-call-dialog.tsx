"use client";

import React from "react"

import { useState } from "react";
import { useAssistants, usePhoneNumbers } from "@/lib/hooks";
import { mutate } from "swr";

export function NewCallDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: agents } = useAssistants();
  const { data: phoneNumbers } = usePhoneNumbers();
  const [assistantId, setAssistantId] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const agentList = Array.isArray(agents) ? agents : [];
  const phoneList = Array.isArray(phoneNumbers) ? phoneNumbers : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/vapi/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assistantId, phoneNumberId, customerNumber }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create call");
      }

      await mutate("/api/vapi/calls");
      setAssistantId("");
      setPhoneNumberId("");
      setCustomerNumber("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close dialog"
      />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">
            New Outbound Call
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-card-foreground"
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="agent"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Agent
            </label>
            <select
              id="agent"
              value={assistantId}
              onChange={(e) => setAssistantId(e.target.value)}
              required
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select agent...</option>
              {agentList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="phone"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              From (Phone Number)
            </label>
            {phoneList.length === 0 ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                No phone numbers provisioned. Add one in your Vapi dashboard.
              </p>
            ) : (
              <select
                id="phone"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                required
                className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select phone number...</option>
                {phoneList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.number ?? p.name ?? p.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="customer"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Customer Number
            </label>
            <input
              id="customer"
              type="tel"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
              placeholder="+1234567890"
              required
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-[11px] text-muted-foreground">
              Include country code (E.164 format)
            </p>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || phoneList.length === 0}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Dialing..." : "Start Call"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
