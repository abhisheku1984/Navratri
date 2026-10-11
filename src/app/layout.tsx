import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shell } from "@/components/shell";
import { UserProvider } from "@/lib/user";
import { OfflineProvider } from "@/components/offline";
import { introForms, getBlessing } from "@/lib/intro-data";

export const metadata: Metadata = {
  title: {
    default: "Navratri — The Divine Shakti",
    template: "%s · Navratri",
  },
  description:
    "A multilingual spiritual library for Maa Durga and the nine Navadurga forms: the complete " +
    "Durga Saptashati, puja and mantra guides, the traditions of Navratri in 24 languages, " +
    "matching-language narration, and a source-grounded AI guide.",
  applicationName: "Navratri — The Divine Shakti",
  keywords: [
    "Navratri", "Durga Saptashati", "Devi Mahatmya", "Navadurga", "Shakti Peetha",
    "Maa Durga", "Chandi Path", "Ghatasthapana",
  ],
  openGraph: {
    title: "Navratri — The Divine Shakti",
    description:
      "Discover Maa Durga. Explore Sacred Scriptures. Experience the Power of Shakti.",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffefb" },
    { media: "(prefers-color-scheme: dark)", color: "#14080c" },
  ],
};

/**
 * The interface font stack is deliberately local-first: system Devanagari faces
 * with a graceful fallback chain. A hosted webfont can be added in production by
 * pointing `--font-display` / `--font-sans` in globals.css at self-hosted files;
 * the build must not depend on a font CDN it cannot reach.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The intro's nine forms and the opening blessing are read on the server and
  // passed down, so that only the two small JSON files those need travel to the
  // browser rather than the whole corpus. The language of the blessing shown is
  // chosen on the client, from the reader's stored preference.
  const forms = introForms();
  const blessing = getBlessing("en");

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning data-theme="light" data-motion="full">
      <body>
        <UserProvider>
          <OfflineProvider>
            <Shell
              introFormList={forms}
              introBlessing={{
                text: blessing.translation.text,
                status: blessing.translation.status,
                disclosure: blessing.disclosure,
                notAutoplay: blessing.notAutoplay,
              }}
            >
              {children}
            </Shell>
          </OfflineProvider>
        </UserProvider>
      </body>
    </html>
  );
}
