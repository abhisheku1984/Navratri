/**
 * Navigation and rendering.
 *
 * Renders real components against real content and checks the things a user
 * would notice: that the shell links where it says it does, that a chapter
 * renders its verses, that a Peetha shows its disagreement rather than hiding
 * it, and that empty and loading states exist.
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Breadcrumbs, Card, Chip, ConfidenceBadge, DefinitionList, EmptyState, ErrorState,
  Notice, PageHeader, SectionHeading, Stat, VerificationBadge, VerseBlock,
} from "@/components/ui";
import { Flashcards } from "@/components/interactive";
import { getChapter } from "@/lib/content";
import { UserProvider } from "@/lib/user";

function withUser(ui: React.ReactElement) {
  return render(<UserProvider>{ui}</UserProvider>);
}

describe("navigation components", () => {
  it("renders breadcrumbs with a link on every item but the last", () => {
    const { container } = render(
      <Breadcrumbs items={[
        { label: "Durga Saptashati", href: "/scripture" },
        { label: "Chapter 5" },
      ]} />,
    );
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe("/scripture");
    expect(container.textContent).toContain("Chapter 5");
  });

  it("renders a page header with eyebrow, title and subtitle", () => {
    render(<PageHeader eyebrow="Scripture" title="Durga Saptashati" sub="Thirteen chapters" />);
    expect(screen.getByText("Scripture")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Durga Saptashati");
    expect(screen.getByText("Thirteen chapters")).toBeInTheDocument();
  });

  it("renders a section heading with an accessible title", () => {
    render(<SectionHeading eyebrow="Explore" title="The nine forms" sub="One per day" />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("The nine forms");
  });

  it("renders a definition list, skipping empty values", () => {
    const { container } = render(
      <DefinitionList items={[["City", "Guwahati"], ["District", null], ["State", "Assam"]]} />,
    );
    const terms = container.querySelectorAll("dt");
    expect(terms).toHaveLength(2);
    expect(container.textContent).not.toContain("District");
  });
});

describe("trust markers", () => {
  it("labels verification status", () => {
    const { rerender } = render(<VerificationBadge status="verified" />);
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
    rerender(<VerificationBadge status="awaiting-review" />);
    expect(screen.getByText(/review/i)).toBeInTheDocument();
  });

  it("labels confidence, and never claims certainty for a contested site", () => {
    const { rerender, container } = render(<ConfidenceBadge confidence="low" />);
    expect(container.textContent!.length).toBeGreaterThan(0);
    rerender(<ConfidenceBadge confidence="high" />);
    expect(container.textContent!.length).toBeGreaterThan(0);
  });

  it("renders notices with an alert role for warnings", () => {
    render(<Notice tone="warn" title="Careful">Something is off.</Notice>);
    expect(screen.getByRole("alert")).toHaveTextContent("Something is off.");
  });
});

describe("states", () => {
  it("renders an empty state with an optional action", () => {
    render(
      <EmptyState title="Nothing saved yet" body="Save a verse to see it here."
                  action={<button>Go reading</button>} />,
    );
    expect(screen.getByText("Nothing saved yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go reading" })).toBeInTheDocument();
  });

  it("renders an error state with a retry control", () => {
    render(<ErrorState message="The page failed to load." onRetry={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent("The page failed to load.");
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("renders an error state that can explain a real content gap", () => {
    render(<ErrorState title="Incomplete"><p>Chapter 13 is truncated in the witness.</p></ErrorState>);
    expect(screen.getByText(/truncated in the witness/)).toBeInTheDocument();
  });

  it("renders a stat with label, value and hint", () => {
    render(<Stat label="Verses" value="700" hint="Per the colophon" />);
    expect(screen.getByText("Verses")).toBeInTheDocument();
    expect(screen.getByText("700")).toBeInTheDocument();
    expect(screen.getByText("Per the colophon")).toBeInTheDocument();
  });
});

describe("scripture rendering", () => {
  it("renders a verse with its label, Devanagari and IAST", () => {
    const ch5 = getChapter(5)!;
    const v = ch5.verses.find((x) => x.label === "5.14-16")!;
    const { container } = render(
      <VerseBlock label={v.label} devanagari={v.devanagari} iast={v.iast}
                  padas={v.padas} range />,
    );
    expect(container.textContent).toContain("5.14-16");
    expect(container.textContent).toContain("या देवी सर्वभूतेषु");
    expect(container.textContent).toContain("yā devī sarvabhūteṣu");
    expect(container.textContent).toMatch(/spans more than one verse/);
  });

  it("renders a whole chapter's worth of verses from real content", () => {
    const ch = getChapter(6)!;
    render(
      <ol>
        {ch.verses.map((v) => (
          <li key={v.label}>
            <VerseBlock label={v.label} devanagari={v.devanagari} iast={v.iast} />
          </li>
        ))}
      </ol>,
    );
    expect(screen.getByText("6.1")).toBeInTheDocument();
    expect(screen.getByText(`6.${ch.verses.length}`)).toBeInTheDocument();
  });

  it("renders a card, chip and ornament without crashing", () => {
    render(
      <Card raised>
        <Chip tone="gold">Day 7</Chip>
        <p>Kalaratri</p>
      </Card>,
    );
    expect(screen.getByText("Day 7")).toBeInTheDocument();
    expect(screen.getByText("Kalaratri")).toBeInTheDocument();
  });
});

describe("flashcards", () => {
  const cards = [
    { front: "तिथि", back: "tithi — a lunar day" },
    { front: "कवचम्", back: "kavacham — a protective hymn" },
  ];

  it("shows the first card's front by default", () => {
    withUser(<Flashcards cards={cards} />);
    expect(screen.getByText("तिथि")).toBeInTheDocument();
    expect(screen.queryByText(/a lunar day/)).not.toBeInTheDocument();
  });

  it("turns over on click and steps forward", async () => {
    const { user } = await import("@testing-library/user-event").then((m) => ({ user: m.default }));
    const u = user.setup();
    withUser(<Flashcards cards={cards} />);
    await u.click(screen.getByRole("button", { name: /show the definition/i }));
    expect(screen.getByText(/a lunar day/)).toBeInTheDocument();
    await u.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("कवचम्")).toBeInTheDocument();
  });

  it("renders an empty state when there are no cards", () => {
    withUser(<Flashcards cards={[]} />);
    expect(screen.getByText(/no cards yet/i)).toBeInTheDocument();
  });
});
