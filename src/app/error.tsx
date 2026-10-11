"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Diya } from "@/components/ornament";

export default function ErrorPage({
  error, reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface the error for whoever operates the deployment. In a production
    // build this is where a reporting hook would go; it must never send a
    // user's bookmarks, journal or other local state.
    console.error("Navratri route error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
      <Diya className="mb-8 h-12 w-16" />

      <h1 className="display text-3xl font-semibold">Something went wrong</h1>
      <p className="muted mt-3 max-w-md leading-relaxed">
        This page could not be shown. Your saved items are untouched — they are stored in your
        browser, separately from whatever just failed.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        <button className="btn btn-primary" onClick={reset}>Try again</button>
        <Link href="/" className="btn btn-ghost">Back to the start</Link>
      </div>

      {error.digest && (
        <p className="muted mt-6 font-mono text-xs">
          Reference: {error.digest}
          <br />
          <span className="not-italic">
            Quote this if you report the problem from{" "}
            <Link href="/report-error" className="link-underline">the report form</Link>.
          </span>
        </p>
      )}
    </main>
  );
}
