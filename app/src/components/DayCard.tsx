"use client";

export default function DayCard({
  dayNumber,
  title,
  objective,
  isLocked,
  isCompleted,
  isActive,
  onClick,
}: {
  dayNumber: number;
  title: string;
  objective: string;
  isLocked: boolean;
  isCompleted?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border p-4 cursor-pointer transition-all duration-200 overflow-hidden ${
        isActive
          ? "border-gold bg-gold-soft"
          : isCompleted
          ? "border-success/30 bg-surface"
          : "border-border bg-surface hover:bg-surface-light"
      }`}
    >
      {isLocked && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-sm font-medium">Locked</span>
          </div>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            isCompleted
              ? "bg-success/20 text-success"
              : isActive
              ? "bg-gold/20 text-gold"
              : "bg-surface-light text-muted"
          }`}
        >
          {isCompleted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            dayNumber
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted uppercase tracking-wider">Day {dayNumber}</span>
            {isCompleted && <span className="text-xs text-success font-medium">Completed</span>}
          </div>
          <h3 className="font-semibold text-foreground mt-0.5">{title}</h3>
          <p className="text-sm text-muted mt-1 line-clamp-2">{objective}</p>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted flex-shrink-0 mt-1"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  );
}
