"use client";

export default function PillButton({
  children,
  variant = "primary",
  disabled = false,
  onClick,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  const base =
    "w-full py-4 px-6 rounded-full text-base font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gold text-black hover:brightness-110 active:scale-[0.98]",
    secondary: "bg-surface text-foreground border border-border hover:bg-surface-light active:scale-[0.98]",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
