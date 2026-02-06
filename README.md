# SalesForge AI

**An AI-powered sales agent management platform where voice AI agents make real outbound phone calls, and a human sales manager monitors, manages, and analyzes their performance through a unified dashboard.**

---

## Overview

SalesForge AI demonstrates a new paradigm in sales operations: instead of human sales reps making cold calls, AI voice agents handle the conversations autonomously. A human sales manager uses the SalesForge dashboard to:

- Deploy and monitor AI sales agents
- Initiate real outbound phone calls to prospects
- Review call transcripts and structured post-call analytics
- Ask natural language questions about agent performance using an AI-powered Insights Chat

The AI agents speak naturally over the phone using large language models and text-to-speech, while the manager retains full visibility and control through the dashboard.

---

## Key Features

- **AI-Powered Voice Sales Agents** -- Configurable agents with distinct voices, personalities, and LLM backends (GPT-4o, etc.)
- **Real Outbound Phone Calls** -- Not simulated. Agents dial real phone numbers and conduct live sales conversations.
- **Live Agent Status** -- Dashboard shows whether each agent is idle or currently in a call.
- **Call History with Transcripts** -- Every call is logged with full conversation transcripts, duration, cost, and timestamps.
- **Structured Post-Call Outputs** -- After each call, the system generates a success score, appointment-booked flag, and call summary.
- **AI Insights Chat** -- A RAG-powered chatbot that lets managers ask natural language questions about any agent's call history, grounded entirely in real data.
- **Manager-Style Dashboard UX** -- Dark, professional interface designed for command-center oversight of an AI sales team.

---

## High-Level Architecture

```
                    +---------------------+
                    |   Next.js Dashboard  |
                    |   (React Frontend)   |
                    +----------+----------+
                               |
                               | API requests (agents, calls, chat)
                               v
                    +---------------------+
                    |  Next.js API Routes |
                    |  (MCP client + LLM) |
                    +----------+----------+
                               |
         +---------------------+---------------------+
         |                     |                     |
         | list_assistants     | list_calls           | chat (with context)
         | list_phone_numbers  | get_call             |
         | create_call         | (transcripts,        |
         v                     |  structured data)   v
+----------------+              |              +----------------+
|  Vapi MCP      |<-------------+              |      LLM       |
|  Server        |   retrieve context         | (Insights Chat)|
| (Telephony +   |   for Insights Chat        |                |
|  Voice AI)     |                             |  Context:      |
+----------------+                             |  - transcripts |
                                              |  - success     |
                                              |  - summary     |
                                              +----------------+
```

**How context is retrieved for the LLM**

1. **Source** — Call data (transcripts, structured outputs) lives in **Vapi** (via MCP tools `list_calls`, `get_call`).
2. **Retrieval** — When the user asks a question in AI Insights Chat, the **API routes** call those MCP tools to fetch the selected agent’s calls and full call details.
3. **Augmentation** — The backend formats that data (transcripts, success score, appointment booked, call summary) into a **context payload** and injects it into the LLM system prompt.
4. **Generation** — The **LLM** (via Vercel AI SDK) answers only from that context, so responses are grounded in real call data.

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| **Frontend** | Next.js + React | Dashboard UI, agent cards, call tables, chat interface |
| **Backend** | Next.js API Routes | MCP client to Vapi; assembles context and calls LLM for Insights Chat |
| **Telephony + Voice AI** | Vapi | Manages phone calls, voice synthesis, transcription; source of call data |
| **Context retrieval** | MCP tools (`list_calls`, `get_call`) | Fetches calls, transcripts, and structured outputs from Vapi |
| **LLM** | Vercel AI SDK + any compatible LLM | Consumes retrieved context and powers AI Insights Chat |

---

## MCP (Model Context Protocol) Integration

### What is MCP?

The Model Context Protocol (MCP) is an open standard that provides a tool-based interface for LLMs and AI systems to interact with external services. Instead of writing custom API integrations, MCP defines a uniform way to discover, describe, and invoke tools exposed by an MCP server.

### Why MCP in This Project?

SalesForge AI uses MCP as the **control plane** between the dashboard backend and Vapi's telephony platform. Rather than making raw REST API calls with hand-coded request/response handling, the backend connects to Vapi's MCP server and invokes well-defined tools to:

- List and inspect AI agents (assistants)
- Initiate outbound phone calls
- Retrieve call history, transcripts, and metadata
- Query phone number inventory

### How It Works

1. **Vapi exposes an MCP server** with tools for managing calls, assistants, phone numbers, and more.
2. **The Next.js backend acts as an MCP client**, calling these tools through the standardized protocol.
3. **The frontend** communicates with the backend via standard API routes, which in turn invoke MCP tools.

This architecture decouples the dashboard from Vapi's internal API surface, making the system more maintainable and portable.

---

## Vapi MCP Server Details

| Property | Value |
|----------|-------|
| **MCP Server** | Vapi MCP |
| **Authentication** | Bearer token (Vapi private API key) |
| **Transport** | HTTP / REST-compatible |
| **Purpose** | Initiate calls, list calls, retrieve transcripts, manage assistants |

The Vapi API key is stored as an environment variable (`VAPI_API_KEY`) and is never exposed to the frontend.

---

## MCP Tools Used

The following MCP tools are actively used in SalesForge AI:

| Tool | Description | Usage in App |
|------|-------------|--------------|
| `list_assistants` | Returns all AI assistants (agents) configured on the account | Populates the agent cards on the Overview page, the agent selector in AI Insights Chat, and the agent dropdown in the New Call dialog |
| `list_calls` | Returns all calls made by any agent | Populates the call history table, computes dashboard stats (total calls, avg duration, success rates), and provides data for the AI Insights Chat |
| `get_call` | Returns full details for a single call, including transcript, structured outputs, and recording URL | Powers the Call Detail page with transcript viewer, metadata grid, and structured output panels |
| `create_call` | Initiates a new outbound phone call with a specified agent, phone number, and customer number | Called when a manager clicks "New Call" and submits the dial form |
| `list_phone_numbers` | Returns all phone numbers provisioned on the account | Populates the "From Number" dropdown in the New Call dialog |

### Tools Available but Not Used

The Vapi MCP server also exposes tools for creating/updating assistants, getting individual phone numbers, and managing Vapi-side tools. These are available for future expansion but are not used in the current demo.

---

## Structured Outputs

### What Are Structured Outputs?

Vapi can generate structured data after each call ends. Instead of just a raw transcript, the system extracts specific fields that are useful for business analytics.

### Outputs Used in This Project

| Output | Type | Description |
|--------|------|-------------|
| **Success Score** | Numeric (0--10) | How successful the call was in achieving its sales objective |
| **Appointment Booked** | Boolean | Whether the prospect agreed to schedule a follow-up meeting |
| **Call Summary** | String | A concise natural language summary of what happened on the call |

### How They Power the Dashboard

- **Overview Page** -- Aggregate success scores and appointment-booked rates are computed across all calls and displayed as stat cards.
- **Call Detail Page** -- Individual structured outputs are shown alongside the transcript with a visual score ring and status indicators.
- **Agent Cards** -- Per-agent performance metrics (avg score, total calls, booked rate) are derived from structured outputs.
- **AI Insights Chat** -- Structured outputs are included in the context sent to the LLM, enabling questions like "Which agent has the highest booking rate?"

---

## AI Insights Chat

The AI Insights Chat is a conversational interface that lets a sales manager ask natural language questions about any agent's call history.

### How It Works

1. **Manager selects an agent** from the dropdown.
2. **System fetches all calls** for that agent via the Vapi API.
3. **Call transcripts and structured outputs** are assembled into a context payload.
4. **Manager asks a question** (free text or quick-action button).
5. **The LLM (via Vercel AI SDK) analyzes the context** and returns an answer grounded entirely in real call data.

### Key Behaviors

- **Data-grounded answers only** -- The LLM is instructed to answer ONLY from provided call data. It will not speculate or hallucinate.
- **No calls = clear message** -- If an agent has no call history, the system responds with "This agent hasn't made any calls yet."
- **Agent switching** -- Selecting a different agent clears the chat history and loads fresh context.
- **Quick questions** -- Pre-built buttons for common queries: "What objections came up?", "Any appointments booked?", "Summarize performance", "What concerns were raised?"

### Technical Pattern

This is a **Retrieval-Augmented Generation (RAG)** pattern (see architecture diagram above):
- **Retrieval**: Call transcripts and structured outputs are fetched from Vapi via MCP tools (`list_calls`, `get_call`).
- **Augmentation**: The API routes format the data and inject it into the LLM's system prompt as context.
- **Generation**: The LLM produces an answer constrained to that context.

---

## Demo Flow

1. **Open the dashboard** at `/dashboard` to see the Overview page with agent cards and stats.
2. **View agents** -- Each card shows the agent's name, voice, model, status (idle/in-call), and performance metrics.
3. **Initiate a call** -- Click "New Call", select an agent, choose a phone number, enter a customer number, and submit.
4. **Agent makes a real phone call** -- The AI agent dials the number and conducts a live sales conversation.
5. **Call ends** -- Vapi generates structured outputs (success score, appointment booked, summary).
6. **Dashboard updates** -- The call appears in the history table, stats recalculate, and the agent card reflects the new data.
7. **Review the call** -- Click into any call to see the full transcript, metadata, and structured outputs.
8. **Ask questions in AI Insights Chat** -- Navigate to AI Insights, select an agent, and ask about patterns, objections, or outcomes across their calls.

---

## Design Philosophy

| Principle | Explanation |
|-----------|-------------|
| **Demo-First Reliability** | Every feature prioritizes working correctly in a live demo over handling obscure edge cases. |
| **No Unnecessary Persistence** | Vapi is the source of truth. The dashboard queries live data rather than maintaining a separate database. |
| **MCP as the Control Plane** | All communication with Vapi flows through the standardized MCP tool interface, not custom API wrappers. |
| **Humans Manage, AI Executes** | The manager has full visibility and control. AI agents handle the calls but the human decides when, who, and how. |

---

## Tech Stack

| Technology | Role |
|------------|------|
| **Next.js 16** | Full-stack framework (frontend + API routes) |
| **React** | UI component library |
| **Tailwind CSS v4** | Utility-first styling |
| **LLM** | Powers AI Insights Chat; context is retrieved from Vapi and passed via Vercel AI SDK |
| **Vapi** | Voice AI platform for outbound phone calls |
| **Model Context Protocol (MCP)** | Standardized tool interface connecting the backend to Vapi |
| **SWR** | Client-side data fetching with polling for real-time updates |

---

## Deployment (optional)

This project is **not set up for hosting**. There is no `vercel.json` or other deployment config in the repo.

**To stop automatic deployments** (e.g. if the repo was previously connected to Vercel):

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your project.
2. Go to **Settings** → **Git**.
3. Either **disconnect** the Git repository, or turn off **Automatically deploy pushes** (and optionally **Automatically deploy pull requests**).

After that, pushes to the repo will no longer trigger new deployments.

---

## Disclaimer

SalesForge AI is a **demo and prototype** built to showcase the integration of AI voice agents, MCP, and a manager-facing dashboard. It is not intended for production sales usage. Call volumes, error handling, and security measures are scoped for demonstration purposes.
