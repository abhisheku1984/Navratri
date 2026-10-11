import { PageHeader } from "@/components/ui";
import { UploadTool } from "@/components/upload-tool";

export const metadata = { title: "Upload a text" };

export default function UploadPage() {
  return (
    <>
      <PageHeader
        eyebrow="Prepare a text"
        title="Upload the Durga Saptashati"
        sub="Choose your copy of the Durga Saptashati. This page checks its structure — script, verse markers and chapter headings — and gives you a tidied copy to work from. Everything happens on your device."
      />
      <UploadTool />
    </>
  );
}
