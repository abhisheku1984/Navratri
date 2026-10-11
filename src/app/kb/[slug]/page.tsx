import Link from "next/link";
import { notFound } from "next/navigation";
import { getKbDocument, getKbDocuments, getSources } from "@/lib/content";
import { KbArticle } from "@/components/kb-article";
import { Breadcrumbs } from "@/components/ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return getKbDocuments().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const doc = getKbDocument(slug);
  return {
    title: doc ? doc.title : "Article not found",
    description: doc?.summary,
  };
}

export default async function KbArticlePage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const doc = getKbDocument(slug);
  if (!doc) notFound();

  const sourceTitles: Record<string, string> = {};
  for (const s of getSources()) sourceTitles[s.id] = s.title;
  const hrefs: Record<string, string> = {};
  for (const s of getSources()) hrefs[s.id] = `/sources#${s.id}`;

  // prev / next within the section, so a reader can walk a section in order
  const siblings = getKbDocuments().filter((d) => d.section === doc.section);
  const i = siblings.findIndex((d) => d.slug === doc.slug);
  const prev = i > 0 ? siblings[i - 1] : null;
  const next = i >= 0 && i < siblings.length - 1 ? siblings[i + 1] : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Knowledge Base", href: "/kb" },
          { label: `Section ${doc.section}`, href: `/kb#section-${doc.section}` },
          { label: doc.title },
        ]}
      />

      <div className="mt-6">
        <KbArticle doc={doc} sourceTitles={sourceTitles} hrefs={hrefs} />
      </div>

      <nav className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5 text-sm">
        {prev ? (
          <Link href={`/kb/${prev.slug}`} className="text-[var(--accent)] hover:underline">
            ← {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/kb/${next.slug}`} className="text-right text-[var(--accent)] hover:underline">
            {next.title} →
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}
