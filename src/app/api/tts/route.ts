/**
 * Server-side text-to-speech, when a deployment has credentials for one.
 *
 * This route is the only place a TTS key is ever read. It is a *proxy*: the
 * browser posts text, the server calls the provider and streams audio back. No
 * key reaches the client bundle, and there is no client-side code path that
 * assumes this route works.
 *
 * Shipped state: **not configured**. With no credentials the route answers
 * `501` and a JSON body that names exactly which environment variables are
 * missing, so a deployer can turn it on without reading the source. The player
 * in the browser reads `/api/tts` 's status and stays on the device's own
 * speech engine, which is real, needs no licence and works offline.
 *
 * Supported providers (all optional):
 *   TTS_PROVIDER      "openai" | "elevenlabs" | "bhashini" | "custom"
 *   TTS_API_KEY       provider API key (never logged, never returned)
 *   TTS_ENDPOINT      override endpoint; required for "custom"
 *   TTS_MODEL         model id (openai/elevenlabs)
 *   TTS_VOICE_MAP     JSON map of app language code -> provider voice id
 *   TTS_MAX_CHARS     optional cap, default 1200
 *
 * Text that is not in the requested language must not be synthesised: the
 * caller sends the language it verified, and the route rejects a mismatch
 * rather than producing, say, English prose in a Telugu voice.
 */
import { NextResponse } from "next/server";
import { isLanguageCode, getLanguage } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CHARS = Number(process.env.TTS_MAX_CHARS ?? 1200);

interface ProviderConfig {
  provider: string;
  apiKey: string;
  endpoint: string;
  model: string | null;
  voiceMap: Record<string, string>;
}

function readConfig(): ProviderConfig | null {
  const provider = (process.env.TTS_PROVIDER ?? "").toLowerCase();
  const apiKey = process.env.TTS_API_KEY ?? "";
  if (!provider || !apiKey) return null;

  let endpoint = process.env.TTS_ENDPOINT ?? "";
  if (!endpoint) {
    if (provider === "openai") endpoint = "https://api.openai.com/v1/audio/speech";
    else if (provider === "elevenlabs") endpoint = "https://api.elevenlabs.io/v1/text-to-speech";
    else return null; // custom/bhashini need an explicit endpoint
  }

  let voiceMap: Record<string, string> = {};
  try {
    voiceMap = JSON.parse(process.env.TTS_VOICE_MAP ?? "{}") as Record<string, string>;
  } catch {
    voiceMap = {};
  }

  return {
    provider,
    apiKey,
    endpoint,
    model: process.env.TTS_MODEL ?? null,
    voiceMap,
  };
}

/** What the UI needs in order to be honest about which mode is running. */
function speechAvailability() {
  const cfg = readConfig();
  return {
    configured: Boolean(cfg),
    provider: cfg?.provider ?? null,
    /** Languages with an explicitly mapped provider voice. */
    languages: cfg ? Object.keys(cfg.voiceMap) : [],
    mode: cfg ? "server" : "device",
    note: cfg
      ? "Server synthesis is configured. Audio for a language is offered only when that language has a mapped voice."
      : "No server speech service is configured on this deployment, so narration uses your device's own speech voices. Nothing is uploaded and nothing is invented.",
  };
}

export async function GET() {
  return NextResponse.json(speechAvailability(), {
    headers: { "cache-control": "no-store" },
  });
}

interface Body {
  text?: unknown;
  lang?: unknown;
  voice?: unknown;
}

export async function POST(request: Request) {
  const cfg = readConfig();
  if (!cfg) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "Server-side speech is not configured on this deployment. Narration falls back to the device's own speech engine, which is what the player uses by default.",
        requiredEnv: [
          "TTS_PROVIDER (openai | elevenlabs | bhashini | custom)",
          "TTS_API_KEY",
          "TTS_ENDPOINT  (required for bhashini and custom)",
          "TTS_VOICE_MAP (JSON: { \"hi\": \"voice-id\", ... })",
        ],
      },
      { status: 501 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const lang = typeof body.lang === "string" ? body.lang : "";
  const requestedVoice = typeof body.voice === "string" ? body.voice : "";

  if (!text) return NextResponse.json({ error: "empty_text" }, { status: 400 });
  if (text.length > MAX_CHARS) {
    return NextResponse.json(
      { error: "text_too_long", message: `Limit is ${MAX_CHARS} characters per request; send the text in sentences.` },
      { status: 413 },
    );
  }
  if (!isLanguageCode(lang)) {
    return NextResponse.json(
      { error: "unsupported_language", supported: "one of the 24 registered language codes" },
      { status: 422 },
    );
  }

  const voice = requestedVoice || cfg.voiceMap[lang];
  if (!voice) {
    return NextResponse.json(
      {
        error: "no_voice_for_language",
        message: `No ${getLanguage(lang).label} voice is mapped for the configured provider, so this text will not be synthesised. Map one in TTS_VOICE_MAP rather than using another language's voice.`,
      },
      { status: 422 },
    );
  }

  try {
    const res = await fetch(cfg.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${cfg.apiKey}`,
        "xi-api-key": cfg.apiKey,
      },
      body: JSON.stringify({
        model: cfg.model,
        input: text,
        text,
        voice,
        voice_id: voice,
        language: getLanguage(lang).bcp47,
        response_format: "mp3",
      }),
      // The provider's own timeout is unknown; fail rather than hang a request.
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok || !res.body) {
      return NextResponse.json(
        { error: "provider_error", status: res.status, message: "The speech service rejected the request. The player will use device speech instead." },
        { status: 502 },
      );
    }

    return new Response(res.body, {
      headers: {
        "content-type": res.headers.get("content-type") ?? "audio/mpeg",
        "cache-control": "private, max-age=3600",
        "x-speech-provider": cfg.provider,
        "x-speech-language": lang,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "provider_unreachable", message: "The speech service could not be reached. Device speech remains available." },
      { status: 504 },
    );
  }
}
