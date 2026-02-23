"use client";

export default function ScreenShell({
  children,
  bottomSlot,
}: {
  children: React.ReactNode;
  bottomSlot?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-[420px] flex flex-col min-h-screen">
        <div className="flex-1 px-5 py-6">{children}</div>
        {bottomSlot && (
          <div className="sticky bottom-0 px-5 py-4 bg-background/90 backdrop-blur-sm border-t border-border">
            {bottomSlot}
          </div>
        )}
      </div>
    </div>
  );
}
