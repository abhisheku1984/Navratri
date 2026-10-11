import { LoadingBlock } from "@/components/ui";
import { Lotus } from "@/components/ornament";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <Lotus className="h-8 w-20 shrink-0 opacity-50" stroke="var(--gold)" />
        <div className="flex-1">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton mt-2 h-7 w-64" />
        </div>
      </div>
      <LoadingBlock label="Opening the text…" />
    </div>
  );
}
