import Link from "next/link";
import { Lotus, Mandala } from "@/components/ornament";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
      <div className="relative mb-8">
        <Mandala className="h-40 w-40 opacity-20" petals={16} stroke="var(--gold)" spin />
        <Lotus className="absolute inset-0 m-auto h-10 w-24" stroke="var(--gold)" />
      </div>

      <p className="deva mb-2 text-lg" style={{ color: "var(--gold)" }}>क्षमस्व</p>
      <h1 className="display text-3xl font-semibold">This page is not here</h1>
      <p className="muted mt-3 max-w-md leading-relaxed">
        The link may be old, or the address may be mistyped. Nothing you had saved is lost —
        bookmarks and reading progress live in your browser, not in the page you were on.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        <Link href="/" className="btn btn-primary">Back to the start</Link>
        <Link href="/scripture" className="btn btn-ghost">Durga Saptashati</Link>
        <Link href="/search" className="btn btn-ghost">Search instead</Link>
        <Link href="/saved" className="btn btn-ghost">Your saved items</Link>
      </div>

      <p className="muted mt-10 text-xs">
        If a link inside this app brought you here, that is a bug — please report it from{" "}
        <Link href="/report-error" className="link-underline">the report form</Link>.
      </p>
    </main>
  );
}
