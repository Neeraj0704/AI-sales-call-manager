"use client";

import Link from "next/link";

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={24}
      height={24}
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
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

const steps = [
  {
    number: "01",
    title: "Deploy AI agents",
    description:
      "Spin up voice-native sales reps powered by GPT-4o with custom scripts, personas, and voices. Each agent is tuned for your product.",
  },
  {
    number: "02",
    title: "Launch outbound calls",
    description:
      "Select an agent, enter a phone number, and dial. The AI handles the full conversation with natural turn-taking and objection handling.",
  },
  {
    number: "03",
    title: "Review structured results",
    description:
      "Every call produces a transcript, success score, appointment status, and summary. Compare agent performance instantly.",
  },
];

const differentiators = [
  {
    title: "Voice-native, not chat-first",
    description:
      "Built from the ground up for phone calls. Sub-second latency, natural interruptions, real-time transcription.",
  },
  {
    title: "Structured post-call outputs",
    description:
      "No manual note-taking. Every call automatically returns a success score (1-10), appointment booked status, and a concise summary.",
  },
  {
    title: "Manager-first dashboard",
    description:
      "One command center for your entire AI sales team. Monitor live calls, review transcripts, compare agents side-by-side.",
  },
  {
    title: "Zero infrastructure",
    description:
      "No telephony setup, no call center software. We handle the stack end-to-end via Vapi so you can focus on revenue.",
  },
];

const useCases = [
  {
    title: "Outbound lead qualification",
    description:
      "AI agents call warm leads, qualify interest, and book discovery meetings on your calendar.",
  },
  {
    title: "Appointment setting at scale",
    description:
      "Replace manual BDR workflows with AI that dials 24/7 and handles scheduling objections naturally.",
  },
  {
    title: "Product demo scheduling",
    description:
      "AI reps describe your product, answer FAQs, and lock in demo times without human intervention.",
  },
];

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <PhoneIcon className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              SalesForge AI
            </span>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Dashboard
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-20 pt-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-xs font-medium text-primary">
            AI-powered outbound sales
          </span>
        </div>
        <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Your sales team never sleeps, never improvises, always closes
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          SalesForge AI deploys voice-native AI agents that make real phone
          calls, follow your playbook, and deliver structured results after every
          conversation.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Dashboard
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Product Preview */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="overflow-hidden rounded-xl border border-border bg-card p-1">
          <div className="rounded-lg bg-secondary/30 p-6 sm:p-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Active Agents
                </p>
                <p className="mt-1 text-2xl font-bold text-card-foreground">
                  3
                </p>
                <p className="text-xs text-muted-foreground">1 in call</p>
              </div>
              <div className="rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Total Calls
                </p>
                <p className="mt-1 text-2xl font-bold text-card-foreground">
                  147
                </p>
                <p className="text-xs text-muted-foreground">
                  128 completed
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Avg Score
                </p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  7.4/10
                </p>
                <p className="text-xs text-muted-foreground">
                  From 128 calls
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Booked Rate
                </p>
                <p className="mt-1 text-2xl font-bold text-card-foreground">
                  34%
                </p>
                <p className="text-xs text-muted-foreground">
                  44 appointments
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border bg-secondary/20 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            How it works
          </h2>
          <p className="mt-3 text-center text-2xl font-bold text-foreground sm:text-3xl">
            Three steps to autonomous outbound
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6"
              >
                <span className="text-3xl font-bold text-primary/30">
                  {step.number}
                </span>
                <h3 className="text-lg font-semibold text-card-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes It Different */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            What makes it different
          </h2>
          <p className="mt-3 text-center text-2xl font-bold text-foreground sm:text-3xl">
            Built for the sales manager, not the engineer
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {differentiators.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6"
              >
                <h3 className="text-base font-semibold text-card-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-t border-border bg-secondary/20 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Use cases
          </h2>
          <p className="mt-3 text-center text-2xl font-bold text-foreground sm:text-3xl">
            Where AI sales agents excel
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6"
              >
                <h3 className="text-base font-semibold text-card-foreground">
                  {uc.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {uc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Ready to see it in action?
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Open the dashboard, connect your Vapi account, and launch your first
            AI-powered outbound call.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Dashboard
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary">
              <PhoneIcon className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              SalesForge AI
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Powered by Vapi
          </p>
        </div>
      </footer>
    </div>
  );
}
