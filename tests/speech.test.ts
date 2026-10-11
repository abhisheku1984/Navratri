import { describe, expect, it } from "vitest";
import { pickVoice, prepareSpeechText, speechLang } from "@/components/speech";

/**
 * Read-aloud runs on the device's own speech synthesis, so the part that can be
 * verified without a browser is the text-and-voice selection logic. These tests
 * pin that down; the actual audio is the user's engine's job.
 */

describe("speechLang", () => {
  it("maps app languages to BCP-47 tags", () => {
    expect(speechLang("en")).toBe("en-IN");
    expect(speechLang("hi")).toBe("hi-IN");
    expect(speechLang("te")).toBe("te-IN");
    expect(speechLang("bn")).toBe("bn-IN");
  });

  it("uses the closest common voice for Sanskrit Devanagari", () => {
    expect(speechLang("sa")).toBe("hi-IN");
  });

  it("falls back to English for anything unrecognised", () => {
    expect(speechLang("xx")).toBe("en-IN");
    expect(speechLang("")).toBe("en-IN");
  });
});

describe("prepareSpeechText", () => {
  it("turns a lone danda into a spoken pause", () => {
    expect(prepareSpeechText("वन्दे वाञ्छितलाभाय । यशस्विनीम्")).toBe(
      "वन्दे वाञ्छितलाभाय , यशस्विनीम्",
    );
  });

  it("drops verse-number markers ॥ n ॥ entirely", () => {
    // The marker is not read; only the word remains.
    expect(prepareSpeechText("श्लोक ॥ १ ॥")).toBe("श्लोक");
  });

  it("keeps the verse text when a number marker follows it", () => {
    expect(
      prepareSpeechText("वन्दे वाञ्छितलाभाय चन्द्रार्धकृतशेखराम् ॥ १ ॥"),
    ).toBe("वन्दे वाञ्छितलाभाय चन्द्रार्धकृतशेखराम्");
  });

  it("collapses whitespace and trims", () => {
    expect(prepareSpeechText("  a \n\t b   c  ")).toBe("a b c");
  });

  it("returns an empty string for whitespace-only input", () => {
    expect(prepareSpeechText("   \n  ")).toBe("");
  });

  it("leaves ordinary English prose readable", () => {
    expect(prepareSpeechText("The Devi protected the sage.")).toBe(
      "The Devi protected the sage.",
    );
  });
});

describe("pickVoice", () => {
  const voices = [
    { lang: "en-US", name: "US English" },
    { lang: "en-IN", name: "Indian English" },
    { lang: "hi-IN", name: "Hindi" },
    { lang: "fr-FR", name: "French" },
  ];

  it("prefers an exact language match", () => {
    expect(pickVoice(voices, "hi-IN")?.name).toBe("Hindi");
    expect(pickVoice(voices, "en-IN")?.name).toBe("Indian English");
  });

  it("falls back to the same primary subtag", () => {
    // en-GB is not present; any en voice is acceptable.
    expect(pickVoice(voices, "en-GB")?.lang?.startsWith("en")).toBe(true);
  });

  it("accepts underscore-style engine locales", () => {
    const underscore = [{ lang: "hi_IN", name: "Hindi underscore" }];
    expect(pickVoice(underscore, "hi-IN")?.name).toBe("Hindi underscore");
  });

  it("returns the engine default when nothing matches", () => {
    expect(pickVoice(voices, "te-IN")?.name).toBe("US English");
  });

  it("returns null when there are no voices at all", () => {
    expect(pickVoice([], "hi-IN")).toBeNull();
  });
});
