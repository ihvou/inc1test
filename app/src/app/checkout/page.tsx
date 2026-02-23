"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScreenShell from "@/components/ScreenShell";
import PillButton from "@/components/PillButton";
import { useAppState } from "@/lib/store";

export default function CheckoutPage() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveMethod, setSaveMethod] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { isPremium } = useAppState();
  const router = useRouter();

  if (!isPremium) {
    router.push("/paywall");
    return null;
  }

  function formatCardNumber(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + "/" + digits.slice(2);
    }
    return digits;
  }

  async function completeDemoPurchase() {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 900));
    setProcessing(false);
    router.push("/plan/full");
  }

  async function handleFastPay() {
    await completeDemoPurchase();
  }

  async function handlePurchase() {
    await completeDemoPurchase();
  }

  const isFormValid = cardNumber.replace(/\s/g, "").length === 16 && expiry.length === 5 && cvv.length >= 3;

  return (
    <ScreenShell>
      {/* Top bar: X close + Total */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => router.push("/paywall")}
          className="w-10 h-10 flex items-center justify-center text-muted hover:text-foreground transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <span className="text-sm text-muted">
          Total <strong className="text-foreground text-base">$14.99</strong>
        </span>
      </div>

      {/* Checkout heading */}
      <h1 className="text-2xl font-bold text-foreground text-center mb-6">Checkout</h1>

      {/* Fast payments section */}
      <div className="bg-surface rounded-2xl border border-border p-4 mb-4">
        <h2 className="text-sm font-semibold text-foreground text-center mb-3">Fast payments</h2>
        <button
          onClick={handleFastPay}
          disabled={processing}
          className="w-full bg-white text-black rounded-xl py-3 font-semibold text-base flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Pay
        </button>
      </div>

      {/* Credit card section */}
      <div className="bg-surface rounded-2xl border border-border p-4 mb-4">
        <h2 className="text-sm font-semibold text-foreground text-center mb-3">Credit card</h2>

        {/* Card brand icons */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {["VISA", "MC", "AMEX", "CB", "DISC"].map((brand) => (
            <div
              key={brand}
              className="w-10 h-7 bg-surface-light border border-border rounded flex items-center justify-center text-[9px] font-bold text-muted"
            >
              {brand}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {/* Card number */}
          <div>
            <label className="text-xs text-muted mb-1 block">Card number</label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                className="w-full bg-surface-light border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted/40 focus:outline-none focus:border-gold/50 text-sm tracking-wider"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-[10px]">Secured by <strong className="text-muted">stripe</strong></span>
              </div>
            </div>
          </div>

          {/* Expiry + CVV row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted mb-1 block">Expiration date</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full bg-surface-light border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted/40 focus:outline-none focus:border-gold/50 text-sm tracking-wider"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted mb-1 block">Security code</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="CVV"
                maxLength={4}
                className="w-full bg-surface-light border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted/40 focus:outline-none focus:border-gold/50 text-sm tracking-wider"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Complete payment button */}
      <PillButton onClick={handlePurchase} disabled={!isFormValid || processing}>
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          "Complete payment"
        )}
      </PillButton>

      {/* Money-Back Guarantee */}
      <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-muted/60">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted/40">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Money-Back Guarantee
      </div>

      {/* Save payment method checkbox */}
      <label className="flex items-center gap-3 mt-6 cursor-pointer">
        <div
          onClick={() => setSaveMethod(!saveMethod)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            saveMethod ? "bg-gold border-gold" : "border-border bg-surface-light"
          }`}
        >
          {saveMethod && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <span className="text-sm text-muted">Save this payment method</span>
      </label>

      <div className="h-8" />
    </ScreenShell>
  );
}
