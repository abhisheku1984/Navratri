"use client";

import { useMemo, useRef, useState } from "react";
import { getChapters, getNavadurgaForms } from "@/lib/content";
import { Card, Notice, PageHeader } from "@/components/ui";

/**
 * Shareable greeting cards.
 *
 * Rendered to a PNG in the browser with the canvas API, so the verse text is
 * taken from the verified corpus and set in real type. Nothing is uploaded and
 * no third-party service is called — the download happens locally.
 */
export default function SharePage() {
  const forms = getNavadurgaForms();
  const chapters = getChapters();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [formSlug, setFormSlug] = useState(forms[0]?.slug ?? "");
  const [message, setMessage] = useState("शुभ नवरात्रि");
  const [sub, setSub] = useState("With love and blessings");

  const form = forms.find((f) => f.slug === formSlug);
  const verse = useMemo(() => {
    const ch = chapters.find((c) => c.id === "chapter-5");
    return ch?.verses.find((v) => v.label === "5.14") ?? null;
  }, [chapters]);

  const W = 1080;
  const H = 1080;

  function draw() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = W;
    c.height = H;

    // background
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#1b0c11");
    g.addColorStop(1, "#3a1220");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // mandala rings
    ctx.strokeStyle = "rgba(201,162,39,0.20)";
    for (const r of [300, 380, 460]) {
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(232,200,106,0.30)";
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 + Math.cos(a) * 300, H / 2 + Math.sin(a) * 300);
      ctx.lineTo(W / 2 + Math.cos(a) * 460, H / 2 + Math.sin(a) * 460);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // frame
    ctx.strokeStyle = "rgba(201,162,39,0.55)";
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, W - 96, H - 96);
    ctx.lineWidth = 1;
    ctx.strokeRect(62, 62, W - 124, H - 124);

    ctx.textAlign = "center";

    // message
    ctx.fillStyle = "#e8c86a";
    ctx.font = "600 74px 'Noto Sans Devanagari', 'Nirmala UI', serif";
    ctx.fillText(message, W / 2, 240);

    ctx.fillStyle = "rgba(253,251,244,0.62)";
    ctx.font = "400 30px system-ui, sans-serif";
    ctx.fillText(sub, W / 2, 292);

    // form name
    if (form) {
      ctx.fillStyle = "#fdfbf4";
      ctx.font = "600 88px 'Noto Sans Devanagari', 'Nirmala UI', serif";
      ctx.fillText(form.nameDevanagari, W / 2, 452);
      ctx.fillStyle = "rgba(253,251,244,0.55)";
      ctx.font = "italic 400 30px system-ui, sans-serif";
      ctx.fillText(form.nameTransliterated, W / 2, 502);
    }

    // verse, wrapped
    if (verse) {
      ctx.fillStyle = "#f6dfae";
      ctx.font = "52px 'Noto Sans Devanagari', 'Nirmala UI', serif";
      const words = verse.devanagari.split(/\s+/);
      const lines: string[] = [];
      let line = "";
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width > W - 220 && line) { lines.push(line); line = w; }
        else line = test;
      }
      if (line) lines.push(line);
      const startY = 620 - ((lines.length - 1) * 34);
      lines.forEach((l, i) => ctx.fillText(l, W / 2, startY + i * 72));

      ctx.fillStyle = "rgba(253,251,244,0.42)";
      ctx.font = "400 26px system-ui, sans-serif";
      ctx.fillText(
        `Durga Saptashati ${verse.label} · imported and verified`,
        W / 2, startY + lines.length * 72 + 30,
      );
    }

    ctx.fillStyle = "rgba(232,200,106,0.85)";
    ctx.font = "600 34px 'Noto Sans Devanagari', serif";
    ctx.fillText("॥ जय माता दी ॥", W / 2, H - 130);
  }

  function download() {
    draw();
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement("a");
    a.download = `navratri-${formSlug || "greeting"}.png`;
    a.href = c.toDataURL("image/png");
    a.click();
  }

  return (
    <>
      <PageHeader eyebrow="Share" title="Greeting cards"
                  sub="A verse from the verified text, set in real type and exported as an image on your device. Nothing is uploaded and no service is called." />

      <Notice tone="info" title="How this works">
        The card is drawn in your browser on a canvas and downloaded as a PNG. The verse comes from
        the imported scripture, so what you share is the actual text — not a paraphrase, and not a
        screenshot of someone else&rsquo;s artwork.
      </Notice>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full rounded-2xl border"
            style={{ borderColor: "var(--line)", aspectRatio: "1 / 1" }}
            aria-label={`Preview of the greeting card for ${form?.nameTransliterated ?? "Navratri"}`}
          />
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button className="btn btn-primary" onClick={download}>Download PNG</button>
            <button className="btn btn-ghost" onClick={draw}>Redraw</button>
          </div>
          <p className="muted mt-2 text-xs">
            If the preview looks blank, press Redraw — the canvas only paints on demand.
          </p>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <label htmlFor="card-form" className="mb-1 block text-sm font-semibold">Form</label>
            <select id="card-form" value={formSlug} onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}>
              {forms.map((f) => (
                <option key={f.slug} value={f.slug}>Day {f.day} · {f.nameTransliterated}</option>
              ))}
            </select>

            <label htmlFor="card-msg" className="mt-4 mb-1 block text-sm font-semibold">
              Headline
            </label>
            <input id="card-msg" value={message} onChange={(e) => setMessage(e.target.value)}
                   className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                   style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }} />

            <label htmlFor="card-sub" className="mt-4 mb-1 block text-sm font-semibold">
              Second line
            </label>
            <input id="card-sub" value={sub} onChange={(e) => setSub(e.target.value)}
                   className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                   style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }} />
          </Card>

          <Card className="p-5">
            <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">Verse shown</p>
            {verse ? (
              <>
                <p className="verse-deva text-sm">{verse.devanagari}</p>
                <p className="muted mt-2 text-xs">
                  {verse.label} · imported from the identified edition.
                </p>
              </>
            ) : <p className="muted text-sm">No verse available.</p>}
          </Card>

          <Card className="p-5">
            <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">Fonts</p>
            <p className="text-xs leading-relaxed">
              The card asks the device for a Devanagari face and falls back to a system serif. On a
              device without one, the headline may render as boxes — the downloaded file uses
              whatever your system provided.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
