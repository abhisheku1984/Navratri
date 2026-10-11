import { NextResponse } from "next/server";
import { answer, retrieve } from "@/lib/devi-gyan";

export const runtime = "nodejs";

/**
 * Devi Gyan endpoint.
 *
 * Retrieval always works: it runs against the local curated corpus and returns
 * cited passages. Generation only runs when a provider is configured on the
 * server, so an unconfigured deployment still returns a fully usable answer.
 *
 * Keys are read from process.env on the server only and are never returned to
 * the client.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON body." }, { status: 400 });
  }

  const question = typeof (body as { question?: unknown }).question === "string"
    ? (body as { question: string }).question.trim()
    : "";

  if (!question) {
    return NextResponse.json({ error: "A question is required." }, { status: 400 });
  }
  if (question.length > 600) {
    return NextResponse.json({ error: "Please keep the question under 600 characters." }, { status: 400 });
  }

  const result = await answer(question);
  return NextResponse.json(result);
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const limit = Math.min(Number(new URL(req.url).searchParams.get("limit") ?? 6), 20);
  return NextResponse.json({ passages: retrieve(q, limit) });
}
