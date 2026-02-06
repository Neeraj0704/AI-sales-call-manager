"use client";

import { useState, useRef, useEffect } from "react";
import { useAssistants, useCalls } from "@/lib/hooks";
import type { VapiAssistant, VapiCall } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "What objections came up most in these calls?",
  "Did this agent book any appointments?",
  "What should this agent improve?",
  "What was the overall success rate?",
];

export function InsightsChat() {
  const { data: assistants, isLoading: assistantsLoading } = useAssistants();
  const { data: calls } = useCalls();

  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agentList = Array.isArray(assistants) ? assistants : [];
  const agentCalls = selectedAgentId
    ? (Array.isArray(calls) ? calls : []).filter(
        (c) => c.assistantId === selectedAgentId
      )
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Clear messages when switching agents
    if (selectedAgentId && messages.length > 0) {
      setMessages([]);
    }
  }, [selectedAgentId]);

  const handleSendMessage = async (question: string = input) => {
    if (!question.trim() || !selectedAgentId || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/insights/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: selectedAgentId,
          question,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "No response received.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content:
          error instanceof Error
            ? `Error: ${error.message}`
            : "Failed to get response. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Insights Chat</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask questions about an agent's call history. The AI will analyze their recent calls and provide insights.
        </p>
      </div>

      {/* Agent Selector */}
      <div className="rounded-lg border border-border bg-card p-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          Select Agent
        </label>
        <select
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          disabled={assistantsLoading}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">
            {assistantsLoading ? "Loading agents..." : "Choose an agent"}
          </option>
          {agentList.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name} ({agentCalls.length} calls)
            </option>
          ))}
        </select>

        {selectedAgentId && agentCalls.length === 0 && (
          <p className="mt-2 text-xs text-destructive">
            No call history for this agent yet. Make at least one call and come back.
          </p>
        )}
      </div>

      {selectedAgentId && agentCalls.length > 0 && (
        <>
          {/* Chat Messages */}
          <div className="rounded-lg border border-border bg-card p-4 h-96 overflow-y-auto flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Start by asking a question about this agent's calls.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {agentCalls.length} calls available for analysis
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-sm rounded-md px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2">
                    <div className="bg-muted text-foreground rounded-md px-3 py-2 text-sm animate-pulse">
                      Analyzing calls...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Questions */}
          {messages.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <p className="col-span-full text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quick Questions
              </p>
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSendMessage(q)}
                  disabled={loading}
                  className="rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground transition-colors hover:bg-accent/50 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleSendMessage();
                }
              }}
              disabled={loading}
              placeholder="Ask a question..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
