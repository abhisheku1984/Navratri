import Link from "next/link";
import { PageHeader, SectionHeading } from "@/components/ui";
import { PdfIntake } from "@/components/pdf-intake";
import { UploadTool } from "@/components/upload-tool";

export const metadata = {
  title: "Upload a PDF or a text",
  description:
    "Drop a PDF and this app tells you what it is and what it may do with it — read, compare, translate, publish or narrate — and what it will not do. Everything happens on your device.",
};

/**
 * Two intakes on one page, in the order a reader actually arrives:
 *
 *  1. a PDF — "what is this, and what can you do with it?" — the question a
 *     reader has when they own a scan or a bought edition; and
 *  2. a plain text or ITRANS file — structural preparation for the corpus.
 *
 * Neither uploads anything. The PDF path has no server route at all; the text
 * path runs the same normaliser it always did.
 */
export default function UploadPage() {
  return (
    <>
      <PageHeader
        eyebrow="Bring your own text"
        title="Upload a PDF — and see what can be done with it"
        sub="Drop any PDF: a scan, a bought edition, a photograph of a page. The app inspects it on your device, names what it is, and gives a verdict for each use — read, compare with the verified edition, translate, publish or narrate — along with what it will not do."
      />

      <PdfIntake />

      <div className="mt-12">
        <SectionHeading
          eyebrow="Or a text file"
          title="Prepare a plain-text edition"
          sub="A .txt or ITRANS file of the Saptashati: this checks its structure — script, verse markers, chapter headings — and gives you a tidied copy. It does not publish anything; the corpus is changed only by the verified import scripts."
        />
        <UploadTool />
        <p className="muted mt-4 text-sm">
          Corpus rules and verification: <Link href="/sources" className="link-underline">Sources and verification</Link>
          {" · "}
          <Link href="/about" className="link-underline">Editorial approach</Link>
        </p>
      </div>
    </>
  );
}
