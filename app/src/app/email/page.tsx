"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScreenShell from "@/components/ScreenShell";
import PillButton from "@/components/PillButton";
import { useAppState } from "@/lib/store";

export default function EmailPage() {
  const [email, setEmailInput] = useState("");
  const { setEmailState } = useAppState();
  const router = useRouter();

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function handleSubmit() {
    if (isValid) {
      setEmailState(email);
      router.push("/plan");
    }
  }

  return (
    <ScreenShell>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        {/* Envelope icon */}
        <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center mb-6">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 7l-10 7L2 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Enter your email to get<br />detailed test results
        </h1>
        <p className="text-sm text-muted mb-8">
          We&apos;ll save your personalized plan so you can access it anytime.
        </p>

        {/* Email input */}
        <div className="w-full mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50 text-center"
          />
        </div>

        {/* Privacy card */}
        <div className="w-full bg-surface rounded-xl border border-border p-3 flex items-start gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p className="text-xs text-muted text-left leading-relaxed">
            Your data is secure. We don&apos;t share your email with third parties and you can unsubscribe at any time.
          </p>
        </div>

        <PillButton onClick={handleSubmit} disabled={!isValid}>
          Explore results
        </PillButton>

        <button
          onClick={() => router.push("/plan")}
          className="text-sm text-muted hover:text-foreground mt-4 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </ScreenShell>
  );
}
