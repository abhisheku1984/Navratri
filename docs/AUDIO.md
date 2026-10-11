# Narration and audio policy

This document states what the app actually ships, what it does not, and how the
pieces in `src/lib/audio/tts.ts`, `src/app/api/tts/route.ts` and
`src/components/audio/narration.tsx` behave.

## What ships

- **Device speech only, by default.** `window.speechSynthesis` reads the text
  with whatever voices the reader's own device has installed. Nothing is
  downloaded, nothing is sent anywhere, and no API key is involved.
- **No recorded recitation.** No human recording of any mantra, stotra, aarti
  or chapter is bundled with this app, and none is fetched from a third party
  as a fallback. Recordings are performances with rights holders; where no
  licence exists, the honest state is "text, read by your device".

This is why the interface says *device voice* wherever it labels narration, and
why `src/content/blessing.json` records `audio.commercialRecording: null`.

## Voice selection, per language

`planVoice(lang, voices)` classifies every one of the 24 languages into exactly
one of three modes, and the reason string is never empty:

| Mode | Meaning |
| --- | --- |
| `native` | A voice exists whose BCP-47 tag matches the language (`bcp47`, or the same primary subtag). |
| `substitute` | No voice exists for the language, but a *related* voice does. Documented pairs: Sanskrit reads with a Hindi voice; Kashmiri and Sindhi read with an Urdu voice; Manipuri reads with a Bengali voice. The UI names the borrowed language on screen. |
| `none` | Nothing suitable exists. The player is disabled and the reason is printed — the app does not read an Odia paragraph in an American English voice and call it narration. |

The classification is per device, because the voice list is read from the
device. Settings shows the whole 24-row matrix with a legend (`●` native,
`◐` related voice, `○` text only) and says the list changes with the device.

## When a server speech service is configured

`GET /api/tts` reports `configured`. When it is false (the default) the player
never attempts a network call.

When a deployment sets both `TTS_PROVIDER` and `TTS_API_KEY`, `POST /api/tts`
accepts `{ text, lang, voice? }`, with:

- `text` capped at `TTS_MAX_CHARS` (1200 characters — one sentence or a short
  passage at a time, which is also what makes seeking exact);
- `lang` validated against the 24-language registry (`isLanguageCode`);
- the provider key read from `process.env` inside the route and never returned.

Supported provider values: `openai`, `elevenlabs`, `bhashini`, `custom`
(`TTS_ENDPOINT`, `TTS_MODEL`, `TTS_VOICE_MAP` for a self-hosted or bespoke
service). Without configuration the route answers `501 not_configured` and
names the environment variables that are missing, rather than pretending.

Even with a service configured, narration for a language is only offered when
that language appears in `TTS_VOICE_MAP`. A mapped voice is a claim that the
voice exists, and claims here are checkable.

## Playback behaviour

- Sentences are synthesised one at a time. Progress and seeking are therefore
  **sentence-level**, which is the only truthful granularity for device speech;
  an `<audio>` element (server mode) reports true time-based progress.
- Speeds: 0.75×, 1×, 1.25×, 1.5×.
- Captions show the sentence being spoken (below the player). Transcripts list
  every sentence and seek on click.
- If a configured provider fails mid-playback, the player falls back to device
  speech and says so.
- Nothing autoplays. Narration starts only on a button press, and the opening
  blessing in `src/content/blessing.json` carries `notAutoplay: true`.
- Keyboard: play/pause, stop, replay, previous/next sentence, speed and volume
  controls are all real `button` elements with labels per the i18n dictionary.

## Caching, rights and the 24 languages

- Nothing is cached to a server. Device speech happens in the browser; server
  synthesis is requested per sentence at play time and not stored.
- Translations of the opening blessing are recorded per language in
  `src/content/blessing.json` with a `status` of `source`, `authored` or
  `draft`. Draft translations are shown as drafts: the app never presents a
  provisional translation as reviewed.
- The blessing is an app-written devotional narration, not a scriptural
  quotation, and the text says so on screen. It is not presented as Maa Durga
  speaking through software.

## Adding a provider later

1. Set `TTS_PROVIDER`, `TTS_API_KEY`, and for `custom` also `TTS_ENDPOINT` and
   `TTS_MODEL`, in the deployment's server environment.
2. Add `TTS_VOICE_MAP` entries (`{"hi":"voice-id", …}`) for exactly the
   languages whose voices you have verified.
3. Reload Settings: the matrix switches from device-only to the mapped set, and
   the player starts using server synthesis for those languages.
