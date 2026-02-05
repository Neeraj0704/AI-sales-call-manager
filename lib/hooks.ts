"use client";

import useSWR from "swr";
import type { VapiAssistant, VapiCall, VapiPhoneNumber } from "./types";

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
