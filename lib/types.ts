// Vapi Assistant
export interface VapiAssistant {
  id: string;
  name: string;
  model?: {
    provider?: string;
    model?: string;
  };
  voice?: {
    provider?: string;
    voiceId?: string;
  };
  transcriber?: {
    provider?: string;
    model?: string;
  };
  firstMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Vapi Call
export interface VapiCall {
  id: string;
  assistantId?: string;
  phoneNumberId?: string;
  status?: string;
  type?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  transcript?: string;
  recordingUrl?: string;
  cost?: number;
  costBreakdown?: Record<string, unknown>;
  customer?: {
    number?: string;
  };
  // Structured outputs from Vapi analysis
  analysis?: {
    structuredData?: {
      appointmentBooked?: boolean;
      successScore?: number;
      callSummary?: string;
    };
    summary?: string;
    successEvaluation?: string;
  };
  // Messages array from the call
  messages?: Array<{
    role: string;
    message?: string;
    content?: string;
    time?: number;
  }>;
}

// Vapi Phone Number
export interface VapiPhoneNumber {
  id: string;
  number?: string;
  provider?: string;
  assistantId?: string;
  name?: string;
  createdAt?: string;
}

// Agent with computed status
export interface AgentWithStatus extends VapiAssistant {
  status: "idle" | "in-call" | "error";
  activeCallId?: string;
  stats: {
    totalCalls: number;
    avgSuccessScore: number;
    bookedRate: number;
  };
}

// Create call request
export interface CreateCallRequest {
  agentId: string;
  customerNumber: string;
}
