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
      <div className="w-full max-w-[420px] md:max-w-[980px] flex flex-col min-h-screen">
        <div className="flex-1 w-full px-5 py-6 md:px-8 md:py-8 md:max-w-[780px] md:mx-auto">{children}</div>
        {bottomSlot && (
          <div className="sticky bottom-0 px-5 py-4 md:px-8 bg-background/90 backdrop-blur-sm border-t border-border">
            <div className="w-full md:max-w-[780px] md:mx-auto">
              {bottomSlot}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
