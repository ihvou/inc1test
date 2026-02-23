"use client";

export default function Card({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-2xl border border-border p-4 ${onClick ? "cursor-pointer hover:bg-surface-light transition-colors" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
