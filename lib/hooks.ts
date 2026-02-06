"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import type { VapiAssistant, VapiCall, VapiPhoneNumber } from "./types";

const HIDDEN_CALLS_KEY = "salesforge-hidden-call-ids";

function readHiddenIds(): string[] {
  try {
    const raw = localStorage.getItem(HIDDEN_CALLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeHiddenIds(ids: string[]) {
  localStorage.setItem(HIDDEN_CALLS_KEY, JSON.stringify(ids));
}

export function useHiddenCalls() {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setHiddenIds(new Set(readHiddenIds()));
  }, []);

  const hideCall = useCallback((id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      writeHiddenIds([...next]);
      return next;
    });
  }, []);

  const restoreCall = useCallback((id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      writeHiddenIds([...next]);
      return next;
    });
  }, []);

  const restoreAll = useCallback(() => {
    setHiddenIds(new Set());
    writeHiddenIds([]);
  }, []);

  return { hiddenIds, hideCall, restoreCall, restoreAll };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAssistants() {
  return useSWR<VapiAssistant[]>("/api/vapi/assistants", fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });
}

export function useCalls() {
  return useSWR<VapiCall[]>("/api/vapi/calls", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });
}

export function useCall(id: string | null) {
  return useSWR<VapiCall>(id ? `/api/vapi/calls/${id}` : null, fetcher, {
    refreshInterval: 3000,
  });
}

export function usePhoneNumbers() {
  return useSWR<VapiPhoneNumber[]>("/api/vapi/phone-numbers", fetcher, {
    refreshInterval: 30000,
  });
}
