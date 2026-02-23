"use client";

export default function PricingCard({
  planName,
  price,
  perDay,
  selected = false,
  bestOffer = false,
  discount,
  onClick,
}: {
  planName: string;
  price: string;
  perDay: string;
  selected?: boolean;
  bestOffer?: boolean;
  discount?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 ${
        selected
          ? "border-gold bg-gold-soft"
          : "border-border bg-surface hover:border-muted"
      }`}
    >
      {bestOffer && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gold text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
          Best Offer
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selected ? "border-gold" : "border-muted"
            }`}
          >
            {selected && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
          </div>
          <div>
            <div className="font-semibold text-foreground">{planName}</div>
            <div className="text-sm text-muted">{price}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted">per day</div>
          <div className={`font-bold ${selected ? "text-gold" : "text-foreground"}`}>{perDay}</div>
          {discount && (
            <div className="text-xs text-gold font-medium mt-0.5">{discount}</div>
          )}
        </div>
      </div>
    </div>
  );
}
