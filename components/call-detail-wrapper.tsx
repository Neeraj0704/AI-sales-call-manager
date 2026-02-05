"use client";

import { CallDetail } from "./call-detail";

export function CallDetailWrapper({ callId }: { callId: string }) {
  return <CallDetail callId={callId} />;
}
