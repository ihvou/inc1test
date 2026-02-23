"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScreenShell from "@/components/ScreenShell";
import TopBar from "@/components/TopBar";
import PillButton from "@/components/PillButton";
import PricingCard from "@/components/PricingCard";
import { useAppState } from "@/lib/store";

type PlanOption = "week" | "month" | "quarter";

export default function PaywallPage() {
  const [selected, setSelected] = useState<PlanOption>("month");
  const { setIsPremiumState } = useAppState();
  const router = useRouter();

  function handleContinue() {
    setIsPremiumState(true);
    router.push("/checkout");
  }

  return (
    <ScreenShell
      bottomSlot={
        <div>
          <PillButton onClick={handleContinue}>Continue</PillButton>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Cancel anytime
            </span>
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Money-back guarantee
            </span>
          </div>
        </div>
      }
    >
      <TopBar />

      {/* Mini chart card */}
      <div className="bg-surface rounded-2xl border border-border p-4 mb-6">
        <div className="flex items-end gap-1 h-16 px-2">
          {[20, 35, 30, 50, 45, 65, 60, 80, 75, 95].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gold/30"
              style={{ height: `${h}%` }}
            >
              <div
                className="w-full rounded-t bg-gold"
                style={{ height: `${Math.min(h + 10, 100)}%` }}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted text-center mt-3">
          Users who complete the full program report 3x improvement
        </p>
      </div>

      {/* Headline */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Your custom program<br />is ready to start!
        </h1>
        <p className="text-sm text-muted">
          Unlock all 7 days and guided sessions
        </p>
      </div>

      {/* Pricing cards */}
      <div className="space-y-3 mb-6">
        <PricingCard
          planName="1 Week"
          price="$9.99/week"
          perDay="$1.43"
          selected={selected === "week"}
          onClick={() => setSelected("week")}
        />
        <PricingCard
          planName="1 Month"
          price="$19.99/month"
          perDay="$0.67"
          selected={selected === "month"}
          bestOffer
          discount="Save 53%"
          onClick={() => setSelected("month")}
        />
        <PricingCard
          planName="3 Months"
          price="$39.99/quarter"
          perDay="$0.44"
          selected={selected === "quarter"}
          discount="Save 69%"
          onClick={() => setSelected("quarter")}
        />
      </div>

      {/* Legal text */}
      <p className="text-[10px] text-muted/60 text-center leading-relaxed px-4">
        This is a prototype. No real payment will be processed. By continuing, you acknowledge this is a demo experience for testing purposes only.
      </p>

      <div className="h-24" />
    </ScreenShell>
  );
}
