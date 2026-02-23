"use client";

import { useRouter } from "next/navigation";

export default function TopBar({
  onBack,
  rightSlot,
}: {
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onBack || (() => router.back())}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface hover:bg-surface-light transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      {rightSlot && <div>{rightSlot}</div>}
    </div>
  );
}
