# -*- coding: utf-8 -*-
"""Emit the remaining editorial content collections.

Everything written by this script is editorial content authored for this app.
Every record carries an explicit verification status and a `sampleContent`
flag so the UI can distinguish authored guidance from imported scripture.
"""
import json, os

OUT = "src/content"
os.makedirs(OUT, exist_ok=True)


def w(name, obj):
    open(os.path.join(OUT, name), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    print("wrote", name)


SAMPLE_NOTE = ("Editorial content authored for this app. It has not been through "
               "independent scholarly review. See the Content Verification page.")

# ---------------------------------------------------------------- sources ---
w("sources.json", {
    "collectionId": "sources",
    "title": "Sources, Editions and Verification",
    "intro": ("Every substantive record in this app points at one of the entries below. Where a "
              "record could not be tied to a source it is marked as awaiting verification rather "
              "than being given a plausible-sounding citation."),
    "sources": [
        {
            "id": "durga700",
            "kind": "scripture",
            "title": "Devi Mahatmyam / Durga Saptashati (ITRANS transcription)",
            "provenance": "Sanskrit Documents (sanskritdocuments.org), doc_devii/durga700",
            "people": {"transcribers": ["K. Shankaran", "Kirk Wortman", "Dhruba Chakroborty", "Ahto Jarve"],
                       "proofreaders": ["Sunder Hattangadi", "Kirk Wortman"]},
            "editionNote": "ITRANS source dated 26 February 2024 per its own header.",
            "localCopy": "scripts/sources/durga700.itx",
            "derived": "Devanagari and IAST are produced mechanically from the ITRANS with the "
                       "indic-transliteration library. No verse wording was edited.",
            "licence": ("The Sanskrit text itself is ancient and out of copyright. The transcription "
                        "is volunteer work whose header asks that it not be reposted for commercial "
                        "promotion without permission — see docs/CONTENT_SOURCING.md before shipping."),
            "status": "verified",
            "verification": "scripts/verify-scripture.ts checks all 13 chapters, verse numbering "
                            "continuity, and that the verse total reconciles with the source's own "
                            "colophon (700).",
        },
        {
            "id": "pargiter-1904",
            "kind": "translation",
            "title": "The Markandeya Purana — Devi Mahatmya (English translation)",
            "author": "F. Eden Pargiter",
            "published": "Bibliotheca Indica, Asiatic Society of Bengal, Calcutta, 1904",
            "licence": "public_domain",
            "localCopy": "scripts/sources/devi_mahatmya_pargiter_1904.txt",
            "digitalCopy": "Archive.org witness cu31924022991974 (uncorrected OCR)",
            "caveats": [
                "The OCR is uncorrected; spelling artefacts are preserved rather than silently fixed.",
                "OCR verse numbers are corrupt, so no verse-level alignment is offered.",
                "Canto XCIII is truncated in this witness; chapter 13 is incomplete.",
            ],
            "status": "verified-with-caveats",
        },
        {
            "id": "navadurga-stotram",
            "kind": "stotra",
            "title": "Navadurga Stotram (nine dhyana shlokas)",
            "provenance": "Traditional; text as printed in Parayan Grantham (पारायण ग्रन्थम्)",
            "localCopy": "scripts/sources/navadurga-stotram-sangrah.md",
            "caveats": ["Not collated against a critical edition. Wording differs between lineages."],
            "status": "partially-verified",
        },
        {
            "id": "panchang-engine",
            "kind": "computation",
            "title": "Tithi / nakshatra / Navratri date computation",
            "provenance": "Jean Meeus, Astronomical Algorithms (2nd ed.), ch. 22, 25 and 47",
            "localCopy": "src/lib/panchang/astronomy.ts",
            "caveats": [
                "Low-precision series: about 0.01 degrees for the Sun, 0.3 degrees for the Moon.",
                "Tropical (nirayana) longitudes are used; no ayanamsha is applied. Traditions that "
                "use sidereal reckoning can place a tithi boundary differently.",
                "No muhurat is hard-coded. All timings are computed for the selected location.",
            ],
            "status": "verified",
            "verification": "tests/panchang.test.ts checks the engine against four independently "
                            "known syzygies (2000 and 2024 new and full moons).",
        },
        {
            "id": "peetha-traditions",
            "kind": "tradition",
            "title": "Shakti Peetha enumerations",
            "provenance": "Puranic and tantric lists (Pithanirnaya and related), plus regional "
                          "temple traditions and modern reference works",
            "caveats": [
                "There is no single agreed list. The 18, 51, 52, 64 and 108 enumerations disagree.",
                "Body-part attributions differ between recensions for many sites.",
                "No official website, darshan timing or transport detail has been invented.",
            ],
            "status": "tradition-recorded",
        },
        {
            "id": "editorial",
            "kind": "editorial",
            "title": "Editorial explanations, stories, glossary and guides",
            "provenance": "Authored for this application",
            "caveats": [SAMPLE_NOTE],
            "status": "awaiting-review",
        },
    ],
})

# ------------------------------------------------------------- knowledge ---
K = [
 dict(slug="who-is-durga", title="Who is Maa Durga?", titleHi="माँ दुर्गा कौन हैं?",
      tagline="The name, the word, and the many ways the Goddess is addressed.",
      story=("The Gods had been driven out of heaven. Mahishasura, the buffalo asura, had a boon "
             "that no man or animal could kill him, and he had used it to take everything. The "
             "Devi Mahatmya opens with the gods going from one to another and finding no answer, "
             "until their combined anger and radiance gathered into a single form. She was not "
             "summoned. She was what their refusal to give up looked like."),
      detail=[
        ("The word", "'Durga' is usually read as dush + gha: the one who removes what is difficult "
                     "to remove, or the fort that cannot be taken. Both readings are traditional "
                     "and both are used."),
        ("Shakti", "Shakti is capacity, energy, the power by which anything acts. In Shakta "
                   "thought Shakti is not an attribute the Goddess has; she is Shakti, and the "
                   "gods act through her."),
        ("Devi and Mahadevi", "'Devi' is the feminine of deva and is used of many goddesses. "
                              "'Mahadevi' — the great Goddess — is used when the intention is to "
                              "name the one behind all of them."),
        ("Jagadamba", "'Mother of the world'. A term of endearment rather than a theological "
                      "category, and used across registers from village worship to philosophy."),
        ("Chandika", "The name the Devi Mahatmya itself uses most often for its heroine — fierce, "
                     "and not softened by the narrative."),
      ],
      significance=("The Goddess in this tradition is not a consort who stands beside a god. She is "
                    "the condition of anything happening at all. That is why the Devi Mahatmya can "
                    "have Vishnu asleep at the start and the gods helpless throughout: the story is "
                    "about what remains when power runs out."),
      characters=["Mahishasura", "Indra and the devas", "Sage Markandeya", "King Suratha", "The merchant Samadhi"],
      places=["Markandeya's hermitage (the narrative's frame)", "The battlefield of the Madhyama Charitra"],
      source="Devi Mahatmya, ch. 1–3 (Markandeya Purana 81–83). Available in full in Scripture.",
      childVersion=("Durga means 'the one who gets you out of a really hard place'. When the gods "
                    "were beaten and had nothing left, she appeared — made out of all their light "
                    "put together."),
      reflection=["What would 'difficult to remove' mean in your own life right now?",
                  "The Devi Mahatmya has the gods helpless. Why do you think the story needs that?",
                  "What is the difference between asking for help and refusing to give up?"],
      related=["origin-of-adi-shakti", "durga-parvati-kali", "mahishasura-mardini"]),

 dict(slug="origin-of-adi-shakti", title="Adi Shakti: the origin of power",
      titleHi="आदि शक्ति: शक्ति का आदि स्रोत",
      tagline="Where the tradition says power itself comes from.",
      story=("At the end of a kalpa, Vishnu lay asleep on the causal ocean and the world was "
             "dissolved. Two asuras, Madhu and Kaitabha, rose from the wax in Vishnu's ear. Brahma "
             "was alone with a sleeping god and two demons, so he did the only thing available: he "
             "praised Yogamaya, and asked her to withdraw from Vishnu so that he would wake."),
      detail=[
        ("The first charitra", "Devi Mahatmya ch. 1 is the Madhu-Kaitabha episode. It is short, and "
                               "it does the theological work for everything that follows: the "
                               "Goddess is what makes even Vishnu able to act."),
        ("Yogamaya and Mahamaya", "The text names her Mahamaya — the great illusion — and says she "
                                  "deludes the world and, when pleased, grants understanding. Both "
                                  "functions are hers; the text does not choose one."),
        ("Adi Shakti", "'Adi' means first, original. Adi Shakti is the formulation in which the "
                       "Goddess precedes the gods rather than proceeding from them."),
        ("Three cycles", "The Saptashati is organised as three charitras presided over by Mahakali, "
                         "Mahalakshmi and Mahasaraswati, which later traditions read onto the three "
                         "gunas."),
      ],
      significance=("The structural point is that the text puts the Goddess before the gods. That is "
                    "the whole reason Shakta traditions exist as a distinct orientation and not "
                    "merely as goddess worship inside another system."),
      characters=["Vishnu (asleep)", "Brahma", "Madhu and Kaitabha", "Yogamaya / Mahamaya"],
      places=["The causal ocean at the end of a kalpa"],
      source="Devi Mahatmya, ch. 1 (Markandeya Purana 81). Full text in Scripture › Chapter 1.",
      childVersion=("Before the world began again, God was asleep and two monsters woke up. Brahma "
                    "couldn't fight them, so he sang to the Goddess and asked her to wake God up. "
                    "She did — which is the story's way of saying nothing works without her."),
      reflection=["Why might a text begin with the gods asleep?",
                  "The Goddess is called both deluding and liberating. Can one thing be both?",
                  "What does it mean that power has a source before the powerful?"],
      related=["who-is-durga", "mahishasura-mardini", "three-charitras"]),

 dict(slug="durga-parvati-kali", title="Durga, Parvati, Kali, Lakshmi, Saraswati",
      titleHi="दुर्गा, पार्वती, काली, लक्ष्मी, सरस्वती",
      tagline="How the tradition relates the great goddesses to one another.",
      story=("A child once asked whether Kali and Durga were the same person. A priest answered: "
             "they are the same fire. When it warms the house you call it one thing; when it burns "
             "the forest you call it another. The tradition has always been comfortable with several "
             "names for one reality and several realities for one name."),
      detail=[
        ("Parvati", "Daughter of the mountain; the goddess as Shiva's consort and as the mother "
                    "figure. Most of the Navadurga sequence is told through her."),
        ("Durga", "The warrior aspect, and also a name of its own goddess in some regional "
                  "traditions. In the Saptashati she is Chandika, who is not anyone's consort."),
        ("Kali", "Time and dissolution. In the Saptashati she arises from Chandika's brow as "
                 "Chamunda to kill Chanda and Munda (ch. 7)."),
        ("Lakshmi", "Prosperity and fortune. The Saptashati's own hymn says she dwells in the "
                    "houses of the virtuous and departs from others."),
        ("Saraswati", "Speech, learning and music. She presides over the third charitra as "
                      "Mahasaraswati."),
        ("How they relate", "Some traditions treat these as one goddess under five names; others "
                            "treat them as distinct goddesses who cooperate. Both positions have "
                            "scriptural support and the app does not adjudicate between them."),
      ],
      significance=("The practical consequence for a devotee is that the nine nights can be kept as "
                    "nine forms of one mother, or as nine distinct devotions, and both are "
                    "traditional. The choice belongs to the family and lineage, not to an app."),
      characters=["Parvati", "Durga / Chandika", "Kali / Chamunda", "Lakshmi", "Saraswati", "Shiva"],
      places=["Kailash", "The battlefields of the Saptashati"],
      source=("Devi Mahatmya ch. 1, 7, 11; the Devi Kavacham's nine-name verse (verses 3–5) gives "
              "the Navadurga list."),
      childVersion=("One goddess, many names — like one person who is a mother at home, a doctor at "
                    "work, and a daughter at her own mother's house. Same person, different job."),
      reflection=["Does it matter to you whether they are one or many?",
                  "Which name do you find yourself using, and why that one?",
                  "What is gained by keeping several names instead of settling on one?"],
      related=["who-is-durga", "navadurga-overview", "three-charitras"]),

 dict(slug="mahishasura-mardini", title="Mahishasura Mardini: the slaying of the buffalo demon",
      titleHi="महिषासुर मर्दिनी",
      tagline="The central battle of the Devi Mahatmya, and the festival's reason for being.",
      story=("Mahishasura had fought for ten thousand years until Brahma granted him a boon: no man "
             "and no animal could kill him. He did not think to ask about a woman, because it did "
             "not occur to him that it could matter. He took heaven, drove out the gods, and took "
             "the shape of a buffalo when he fought, because a buffalo is hard to kill."),
      detail=[
        ("Chapters 2 and 3", "Ch. 2 is the battle against his armies; ch. 3 is the duel with "
                             "Mahishasura himself. Together they are the Madhyama Charitra's core."),
        ("The shifting shape", "Mahishasura changes form — buffalo, lion, man, elephant — and the "
                               "text spends real space on it. The shifting is usually read as "
                               "evasion: a wrong that will not stay still long enough to be named."),
        ("The gods' powers", "Each deva gives her his weapon and his radiance. She is not armed by "
                             "one god; she is the combined capacity of all of them."),
        ("The killing", "She pins him with her foot, and when he emerges half-transformed she takes "
                        "his head with the trident. The text is unsentimental about it."),
        ("Chapter 4", "Afterwards the gods praise her — the Shakradi Stuti — and she answers that "
                      "she will return whenever the world is in trouble."),
      ],
      significance=("Vijayadashami marks this victory. The moral reading most traditions offer is "
                    "not 'the strong beat the weak' but 'a wrong that seemed unbeatable was beaten' "
                    "— and the reason it seemed unbeatable was that nobody considered the obvious "
                    "answer."),
      characters=["Mahishasura", "Durga / Chandika", "Indra and the devas", "Chikshura and Chamara "
                "(his generals)"],
      places=["The Vindhya mountains (in several traditions, the site of the battle)"],
      source="Devi Mahatmya ch. 2–4 (Markandeya Purana 82–84). Full text in Scripture.",
      childVersion=("A bully took a promise that no man or animal could beat him, so he thought he "
                    "was safe forever. He forgot to think about girls. The Goddess beat him, and "
                    "that is why we have a festival about winning."),
      reflection=["What was Mahishasura's actual mistake?",
                  "Why do you think the text makes him change shape so much?",
                  "The gods had to give up their own weapons to win. What does that cost?"],
      related=["three-charitras", "weapons-and-symbolism", "shumbha-nishumbha"]),

 dict(slug="shumbha-nishumbha", title="Shumbha and Nishumbha: the final charitra",
      titleHi="शुम्भ और निशुम्भ",
      tagline="The longest narrative in the Devi Mahatmya, and the one with the sharpest dialogue.",
      story=("Shumbha and Nishumbha were brothers who had earned the gods' defeat. Shumbha heard "
             "that a beautiful goddess lived in the mountains and sent messengers to bring her to "
             "him. She answered that she had taken a foolish vow: she would only marry whoever "
             "defeated her in battle. The messengers went back and reported this, and the "
             "conversation that follows is the most quoted passage in the text."),
      detail=[
        ("Chapter 5", "The dialogue with the messengers. The Goddess explains that she is not "
                      "arrogant, only truthful, and the messengers report her words back almost "
                      "verbatim."),
        ("Chapters 6–10", "Dhumralochana, then Chanda and Munda (from whom Chamunda arises), then "
                          "Raktabija — whose blood spawns a duplicate for every drop that falls, "
                          "solved by Kali drinking it before it lands — then Nishumbha, then "
                          "Shumbha."),
        ("Chapter 11", "The Narayani Stuti, the gods' hymn, and the Goddess's declarations about "
                       "her own nature and return."),
        ("Chapters 12–13", "The fruits of hearing the text, and the boons granted to Suratha and "
                           "Samadhi, which close the frame story opened in ch. 1."),
        ("'Ya Devi Sarvabhuteshu'", "The repeated hymn of chapter 5, addressed to the Goddess as "
                                    "present in all beings as Vishnu-maya, consciousness, "
                                    "intellect, sleep, hunger, shadow, power, thirst, forgiveness, "
                                    "kind, modesty, peace, faith, radiance, delight, mother and "
                                    "error. It is the most recited part of the text outside the "
                                    "kavacham."),
      ],
      significance=("The Raktabija episode is the one most often read philosophically: a wrong that "
                    "multiplies when you attack it in the ordinary way needs a different kind of "
                    "response. The text offers Kali's drinking of the blood as that response "
                    "without explaining it, which is why it keeps generating commentary."),
      characters=["Shumbha", "Nishumbha", "Chandika / Ambika", "Kali / Chamunda", "Raktabija",
                  "Dhumralochana", "Chanda and Munda"],
      places=["The Himalaya", "The battlefield of the Uttama Charitra"],
      source="Devi Mahatmya ch. 5–13 (Markandeya Purana 85–93). Full text in Scripture.",
      childVersion=("Two brothers sent a message to the Goddess saying she had to come with them. "
                    "She said no. They sent an army. She beat the army. Then they came themselves, "
                    "and she beat them too. The point is that 'no' was a complete answer."),
      reflection=["Why does the text spend so long on the messengers' conversation?",
                  "Raktabija multiplies when struck. What in your own life behaves that way?",
                  "The Goddess says she will return when needed. What does that promise ask of you?"],
      related=["mahishasura-mardini", "three-charitras", "weapons-and-symbolism"]),

 dict(slug="weapons-and-symbolism", title="Weapons, the lion, and what they mean",
      titleHi="अस्त्र-शस्त्र और सिंह का प्रतीक",
      tagline="Reading the iconography: trident, discus, conch, sword, bow, lotus, lion.",
      story=("Look at any picture of Durga and count her hands. There are never enough. The "
             "tradition is making a point about capacity: one pair of hands can hold a child or a "
             "sword, but not both, and the work of the world needs both at the same time."),
      detail=[
        ("Trident (trishula)", "The three gunas; also the three times. Held, not thrown — the point "
                               "is balance, not destruction."),
        ("Discus (chakra)", "Vishnu's weapon. Time and the returning cycle; what goes around."),
        ("Conch (shankha)", "The sounded origin. Announcement before action."),
        ("Sword (khadga)", "Discernment — the ability to cut one thing away from another."),
        ("Bow and arrow", "Focused intention at a distance; the will that reaches."),
        ("Lotus", "Detachment; also the world itself, held rather than renounced."),
        ("Mace (gada)", "Weight, consequence, the fact that actions land."),
        ("Abhaya and varada mudras", "Two hands almost always free for 'do not fear' and 'here is "
                                    "what you need'. This is the iconographic heart of the image."),
        ("Lion or tiger", "Fear and appetite, mounted rather than killed. Regional images vary "
                          "between lion and tiger and both are traditional."),
        ("Multiple arms", "Capacity. Some traditions read specific counts as directions or as the "
                          "weapons received from specific gods."),
      ],
      significance=("Read this way the image is not a portrait of violence. It is a diagram: many "
                    "capacities, held simultaneously, with two hands permanently reserved for "
                    "reassurance and giving."),
      characters=["Durga / Chandika", "The devas who give their weapons"],
      places=["Temple iconography across India; the Saptashati's battle descriptions"],
      source="Devi Mahatmya ch. 2 (the gathering of the gods' powers) and the dhyana verses.",
      childVersion=("She has many arms so she can hold a sword in one hand and give a hug with "
                    "another at the same time. The lion is fear — she rides it, which means she "
                    "didn't get rid of fear, she just learned to drive."),
      reflection=["Which weapon in the image speaks to you most, and why?",
                  "Two hands are always free for blessing. What would that look like in practice?",
                  "Why ride the lion instead of killing it?"],
      related=["mahishasura-mardini", "who-is-durga", "navadurga-overview"]),

 dict(slug="three-charitras", title="The three charitras and how the text is organised",
      titleHi="तीन चरित्र और ग्रन्थ की रचना",
      tagline="Prathama, Madhyama, Uttama — and why the Saptashati is read in three parts.",
      story=("A reciter will tell you the Saptashati is not read straight through. It is read in "
             "three charitras, on three days, with its own opening and closing rites. The "
             "structure is not an accident of length; it is how the text is meant to be used."),
      detail=[
        ("Prathama Charitra (ch. 1)", "Presided over by Mahakali. The Madhu-Kaitabha episode and "
                                      "the manifestation of Mahakali."),
        ("Madhyama Charitra (ch. 2–4)", "Presided over by Mahalakshmi. The Mahishasura narrative "
                                        "and the gods' hymn."),
        ("Uttama Charitra (ch. 5–13)", "Presided over by Mahasaraswati. The Shumbha-Nishumbha "
                                       "narrative, the great hymns, and the closing boons."),
        ("Guna reading", "Later tradition maps the three charitras onto tamas, rajas and sattva. "
                         "This is a commentary, not a statement in the text itself, and the app "
                         "labels it as such."),
        ("Recitation practice", "Sequences differ by lineage. Some read the whole text on one day; "
                                "most read one charitra per day over three days, or one chapter a "
                                "day over thirteen. The auxiliary texts (kavacham, argala, kilaka) "
                                "are placed differently by different traditions."),
      ],
      significance=("Understanding the charitra structure changes how the text reads. Chapter 4's "
                    "hymn is not an interruption; it is the hinge of the middle charitra. Chapter "
                    "11's Narayani Stuti is not an appendix; it is the theological answer to the "
                    "whole Uttama Charitra."),
      characters=["Mahakali", "Mahalakshmi", "Mahasaraswati"],
      places=["The text itself"],
      source="Devi Mahatmya, all 13 chapters. Chapter index in Scripture.",
      childVersion=("The book is in three parts, like a three-day story. Each part has its own "
                    "goddess watching over it."),
      reflection=["Why might a text be designed to be read in three sittings?",
                  "Which charitra would you start with, and why?",
                  "The guna mapping is commentary, not scripture. Does that change how you use it?"],
      related=["mahishasura-mardini", "shumbha-nishumbha", "origin-of-adi-shakti"]),

 dict(slug="navadurga-overview", title="The Navadurga: nine forms, one festival",
      titleHi="नवदुर्गा: नौ रूप, एक उत्सव",
      tagline="Why nine, where the list comes from, and how the days are assigned.",
      story=("Nine nights, nine forms. The list is old enough that it appears in the Devi Kavacham, "
             "which is recited before the Saptashati itself — so the names are not a later "
             "devotional addition but part of the recitation apparatus of the text."),
      detail=[
        ("The source of the list", "Devi Kavacham verses 3–5 name all nine in order and state that "
                                   "these are the navadurga declared by Brahma. This is imported "
                                   "and verified in the app's scripture library."),
        ("Day assignment", "Most calendars bind each form to a tithi: Pratipada to Shailaputri "
                           "through Navami to Siddhidatri. When a tithi spans two sunrises the "
                           "same form is kept on both days; when a tithi is skipped, one form has "
                           "no day. This app computes both cases and flags them."),
        ("Colours", "The nine-colour scheme (white, red, royal blue, yellow, green, grey, orange, "
                    "peacock green, pink and similar) is a devotional convention that differs "
                    "between regions. It is not in the scripture."),
        ("Offerings", "Flowers and bhog vary widely by region and family. Records here say 'commonly "
                      "offered', never 'prescribed'."),
        ("Chakra mapping", "Some traditions map the nine forms onto the chakras. This is a yogic "
                           "overlay, not a Puranic statement, and is labelled as such."),
      ],
      significance=("The nine-day sequence is a structured progression from groundedness "
                    "(Shailaputri) through discipline, courage, creativity, nurture, resolve and "
                    "fearlessness to purity and fulfilment. Whether or not a devotee reads it that "
                    "way, the sequence supports it."),
      characters=["The nine forms", "Sage Markandeya (who recites the kavacham)"],
      places=["Household shrines and temples across India and the diaspora"],
      source="Devi Kavacham verses 3–5; the Navadurga Stotram (traditional).",
      childVersion=("Nine nights, nine different faces of the same mother — like nine different "
                    "days of a long visit, each with its own mood."),
      reflection=["Which of the nine feels closest to where you are this year?",
                  "The sequence moves from groundedness to fulfilment. Where are you in it?",
                  "Colours and offerings vary. How does that affect how you keep the days?"],
      related=["mahishasura-mardini", "weapons-and-symbolism", "who-is-durga"]),

 dict(slug="shakta-traditions", title="Shakta traditions and regional worship",
      titleHi="शाक्त परम्पराएँ और क्षेत्रीय पूजा",
      tagline="Bengal, Gujarat, the South, the Himalaya — the same Goddess, different practice.",
      story=("Ask a Bengali pandit and a Gujarati priest what happens on Navami and you will get "
             "two different, equally valid answers. The tradition has never required uniformity, "
             "and this app is built on that assumption rather than in spite of it."),
      detail=[
        ("Bengal — Durga Puja", "Five days centred on Shashti to Dashami, with clay images made for "
                                "the occasion and immersed at the end. The Saptashati is recited "
                                "throughout. Kumari puja on Ashtami or Navami is common."),
        ("Gujarat — Garba and Dandiya", "Night-long circle dance around a garbo or an image of "
                                        "Amba. Fasting, nine colours, and a strong community "
                                        "dimension. Ambaji is the principal pilgrimage."),
        ("North India — Ram lila and Dussehra", "Navratri runs alongside the Rama narrative, and "
                                                "Vijayadashami marks both Ram's victory and "
                                                "Durga's."),
        ("South India — Golu / Bommala Kolu", "Stepped displays of dolls in homes, with songs and "
                                              "visiting. Ayudha puja and Saraswati puja fall in "
                                              "the same days."),
        ("Maharashtra — Ghatasthapana", "The kalash is central; Tulja Bhavani and Saptashrungi are "
                                        "the great regional seats."),
        ("Himalayan and tribal traditions", "Himachal, Uttarakhand and the Bastar region have "
                                            "distinct Devi cults. Bastar Dussehra is a "
                                            "ten-day royal ritual unlike anything in the plains."),
        ("Tantric lineages", "Kamakhya, Kashipur and the Sri Vidya traditions keep their own "
                             "calendars and their own recitation orders. Recitation sequences "
                             "differ by lineage and the app does not impose one."),
      ],
      significance=("Practically, this means the app must never say 'on day six you do X'. It can "
                    "say 'in this tradition, on day six, X is done'. Every festival page here is "
                    "written that way."),
      characters=[],
      places=["Bengal", "Gujarat", "Tamil Nadu", "Karnataka", "Maharashtra", "Himachal", "Uttarakhand",
              "Chhattisgarh (Bastar)", "Assam (Kamakhya)"],
      source=("Regional temple traditions and modern scholarship. Recorded as tradition, not as "
              "scripture."),
      childVersion=("Different parts of India celebrate the same goddess in different ways — "
                    "dancing in circles in Gujarat, dolls on steps in Tamil Nadu, big clay statues "
                    "in Bengal. All of them are right."),
      reflection=["What does your own family do that this page does not mention?",
                  "Which regional practice would you like to understand better?",
                  "Why is it valuable that the tradition is not uniform?"],
      related=["navadurga-overview", "who-is-durga", "shakti-peethas-origin"]),

 dict(slug="shakti-peethas-origin", title="Sati, Shiva and the origin of the Shakti Peethas",
      titleHi="सती, शिव और शक्तिपीठों की उत्पत्ति",
      tagline="The Daksha yajna, the tandava, and why there are sacred seats at all.",
      story=("Daksha held a great sacrifice and did not invite Shiva, because he did not approve of "
             "him. Sati went anyway, and was humiliated in front of the assembly. She could not "
             "bear it, and gave up her body in the fire of the sacrifice. Shiva's grief became a "
             "dance that threatened the world, and Vishnu cut the body apart with his discus so "
             "that the dance would stop. Where the pieces fell became sacred."),
      detail=[
        ("The narrative", "This is Puranic narrative, told in several Puranas with variations. It "
                          "is not part of the Devi Mahatmya."),
        ("The lists", "Different texts enumerate 18, 51, 52, 64 or 108 seats. There is no single "
                      "agreed list, and the body part attributed to a given site often differs "
                      "between recensions."),
        ("Historical layer", "Many Peetha temples are genuinely ancient and archaeologically "
                             "attested. The connection to the Sati narrative is a devotional "
                             "reading, not an archaeological finding, and the app keeps those two "
                             "claims separate."),
        ("Geography", "Traditional lists place seats in present-day India, Pakistan, Bangladesh, "
                      "Nepal, Sri Lanka and Tibet. Sacred geography does not follow modern "
                      "borders, and this app does not redraw them."),
        ("Dispute", "Several sites have competing claims, and some body-part attributions are "
                    "contested. The explorer preserves the disagreement and labels it."),
      ],
      significance=("The Peetha idea makes the land itself devotional: the Goddess is not only in "
                    "the image but distributed across a geography. For a pilgrim that turns a map "
                    "into a liturgy."),
      characters=["Sati", "Shiva", "Daksha", "Vishnu"],
      places=["The Daksha yajna site (traditionally Kankhal, near Haridwar)", "The Peethas themselves"],
      source=("Puranic narrative (Kalika Purana, Devi Bhagavata and others) and the tantric Peetha "
              "lists. Recorded as tradition; the historical layer is noted separately."),
      childVersion=("A queen was hurt very badly at a party her father held, and she died. Her "
                    "husband was so sad he danced and the world shook. Another god cut the body "
                    "into pieces so the dancing would stop, and every place a piece landed became "
                    "a holy place."),
      reflection=["Why do you think grief is the origin story of the sacred places?",
                  "The lists disagree. Does that weaken them or make them richer?",
                  "What would it mean to treat a map as a devotional text?"],
      related=["navadurga-overview", "shakta-traditions", "who-is-durga"]),
]

w("knowledge.json", {
    "collectionId": "maa-durga-knowledge",
    "title": "Maa Durga — Knowledge Library",
    "intro": ("Long-form explanations of the Goddess, her narratives and her traditions. Every "
              "topic separates what the scripture says, what a regional tradition holds, and what "
              "a commentator has added."),
    "editorialNote": SAMPLE_NOTE,
    "topics": K,
})

# ---------------------------------------------------------------- mantras ---
M = [
 dict(slug="navarna-mantra", title="Navarna Mantra (Navakshari)", deva="ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे",
      iast="oṃ aiṃ hrīṃ klīṃ cāmuṇḍāyai vicce", category="mantra",
      attribution="Shakta tantric tradition; the seed mantra of Chandika, central to Saptashati recitation.",
      meaning=("The nine-syllable mantra of Chandika. The first three syllables are bīja (seed) "
               "syllables and are not lexical words, so they are not translated word by word; "
               "cāmuṇḍāyai is 'to Chamunda' in the dative, and vicce is a bīja-like termination "
               "with no ordinary lexical meaning."),
      wordMeaning=[("ॐ oṃ", "the primordial syllable"),
                   ("ऐं aiṃ", "bīja of Saraswati / of speech"),
                   ("ह्रीं hrīṃ", "bīja of the Goddess as maya"),
                   ("क्लीं klīṃ", "bīja of desire and of Kama"),
                   ("चामुण्डायै cāmuṇḍāyai", "to Chamunda (dative)"),
                   ("विच्चे vicce", "bīja-like termination; not a lexical word")],
      pronunciation="om AIM hreem kleem cha-mun-DAI-yay vich-cheh",
      textStatus="verified-traditional",
      chapterRef=None,
      audio=None),
 dict(slug="om-namash-chandikayai", title="Namash Chandikayai", deva="ॐ नमश्चण्डिकायै",
      iast="oṃ namaścaṇḍikāyai", category="mantra",
      attribution="Devi Mahatmya; recited at the head of the text and before each chapter.",
      meaning="Salutation to Chandika. It appears in our imported source at the head of the "
              "kavacham, the argala, the kilaka and chapter 1.",
      wordMeaning=[("ॐ oṃ", "the primordial syllable"),
                   ("नमः namaḥ", "salutation, obeisance"),
                   ("चण्डिकायै caṇḍikāyai", "to Chandika (dative)")],
      pronunciation="om na-mash-chan-dee-KAI-yay",
      textStatus="verified", chapterRef=None, audio=None,
      sourceRef="Appears verbatim in the imported durga700 source."),
 dict(slug="ya-devi-sarvabhuteshu", title="Ya Devi Sarvabhuteshu", deva="या देवी सर्वभूतेषु …",
      iast="yā devī sarvabhūteṣu …", category="stotra",
      attribution="Devi Mahatmya, chapter 5. Recited as the Devi Sukta during the path.",
      meaning="The Goddess addressed as present in all beings under twenty-one aspects — as "
              "Vishnu-maya, consciousness, intellect, sleep, hunger, shadow, power, thirst, "
              "forgiveness, kind, modesty, peace, faith, radiance, delight, mother, and error. "
              "Each verse is followed by the refrain 'namastasyai namastasyai namastasyai namo "
              "namaḥ'.",
      wordMeaning=[("या yā", "who (feminine relative)"),
                   ("देवी devī", "the Goddess"),
                   ("सर्वभूतेषु sarvabhūteṣu", "in all beings (locative plural)"),
                   ("नमस्तस्यै namastasyai", "salutation to her")],
      pronunciation="yaa day-VEE sar-va-bhoo-TAY-shoo",
      textStatus="verified",
      chapterRef={"chapter": 5, "verses": "5.14–16 through 5.74–76", "count": 21},
      audio=None),
 dict(slug="devi-kavacham", title="Devi Kavacham", deva="देवी कवचम्", iast="devī kavacam",
      category="anga",
      attribution="Durga Saptashati auxiliary recitation; 60 verses in our imported edition.",
      meaning="The 'armour' hymn. It assigns the nine forms to the limbs (nyasa), names the "
              "protecting goddesses of the directions, and is recited first in the Navangam order.",
      wordMeaning=[("कवचम् kavacam", "armour, cuirass")],
      pronunciation="day-VEE ka-va-CHAM",
      textStatus="verified", chapterRef=None,
      fullTextRef="/scripture/angas/devi-kavacham", audio=None),
 dict(slug="argala-stotram", title="Argala Stotram", deva="अर्गल स्तोत्रम्", iast="argala stotram",
      category="anga",
      attribution="Durga Saptashati auxiliary recitation; 27 verses in our imported edition.",
      meaning="The 'bolt' hymn: a series of petitions ('give form, give victory, give fame, "
              "destroy my enemies') framed by Jaya tvam Devi Chamunde.",
      wordMeaning=[("अर्गल argala", "bolt, bar (of a door)")],
      pronunciation="ar-ga-la STOT-ram",
      textStatus="verified", chapterRef=None,
      fullTextRef="/scripture/angas/argala-stotram", audio=None),
 dict(slug="kilaka-stotram", title="Kilaka Stotram", deva="कीलक स्तोत्रम्", iast="kīlaka stotram",
      category="anga",
      attribution="Durga Saptashati auxiliary recitation; 16 verses in our imported edition.",
      meaning="The 'pin' hymn, recited to remove obstacles to the recitation itself.",
      wordMeaning=[("कीलक kīlaka", "pin, peg, wedge")],
      pronunciation="KEE-la-ka STOT-ram",
      textStatus="verified", chapterRef=None,
      fullTextRef="/scripture/angas/kilaka-stotram", audio=None),
 dict(slug="devi-suktam", title="Devi Suktam (Rig Veda 10.125)", deva="देवी सूक्तम्",
      iast="devī sūktam", category="anga",
      attribution="Rig Veda 10.125, the Vak Sukta; recited in the Devi path.",
      meaning="The seer Vak declares herself as the one who moves with the Rudras, the Vasus and "
              "the Adityas; who bears Soma, Pushan and Bhaga; who is queen, gatherer of wealth, "
              "and first among those worthy of sacrifice.",
      wordMeaning=[("अहं ahaṃ", "I"), ("रुद्रेभिः rudrebhiḥ", "with the Rudras"),
                   ("वसुभिः vasubhiḥ", "with the Vasus"), ("चरामि carāmi", "I move")],
      pronunciation="day-VEE SOOK-tam",
      textStatus="verified", chapterRef=None,
      fullTextRef="/scripture/angas/devi-suktam", audio=None),
 dict(slug="aparadha-kshamapana", title="Aparadha Kshamapana Stotram", deva="अपराधक्षमापन स्तोत्रम्",
      iast="aparādhakṣamāpana stotram", category="anga",
      attribution="Durga Saptashati auxiliary recitation; 9 verses in our imported edition.",
      meaning="The closing prayer asking forgiveness for errors of pronunciation, memory and "
              "attention in the recitation. Notably it asks that whatever was mis-syllabled be "
              "made whole by the Goddess's grace rather than by the reciter's skill.",
      wordMeaning=[("अपराध aparādha", "offence, error"), ("क्षमापन kṣamāpana", "asking forgiveness")],
      pronunciation="a-pa-raa-dha ksha-maa-PA-na STOT-ram",
      textStatus="verified", chapterRef=None,
      fullTextRef="/scripture/angas/aparadha-kshamapana", audio=None),
 dict(slug="chandika-dhyana", title="Chandika Dhyana", deva="श्रीचण्डिकाध्यानम्",
      iast="śrīcaṇḍikādhyānam", category="anga",
      attribution="Placed at the head of the text in our imported edition; two dhyana blocks.",
      meaning="Meditation verses describing the form of Chandika, followed by the alternative "
              "(athava) dhyana that summarises the whole text in one verse: she who destroyed "
              "Madhu and Kaitabha, who uprooted Mahisha, who churned Dhumralochana, who consumed "
              "Raktabija, who destroyed Shumbha and Nishumbha, and who is the giver of siddhis.",
      wordMeaning=[("ध्यानम् dhyānam", "meditation"), ("अथवा athavā", "alternatively")],
      pronunciation="shree chan-dee-KAA DHYAA-nam",
      textStatus="verified", chapterRef=None,
      fullTextRef="/scripture/angas/chandika-dhyana", audio=None),
 dict(slug="mahishasura-mardini-stotram", title="Mahishasura Mardini Stotram",
      deva="महिषासुरमर्दिनी स्तोत्रम्", iast="mahiṣāsuramardinī stotram", category="stotra",
      attribution="Traditionally attributed to Bana Bhatta; the attribution is traditional rather "
                  "than established.",
      meaning="A twelve-verse hymn in a fast, percussive metre addressed to the slayer of "
              "Mahishasura.",
      wordMeaning=[("महिष mahiṣa", "buffalo"), ("असुर asura", "demon"),
                   ("मर्दिनी mardinī", "she who crushes")],
      pronunciation="ma-hi-shaa-su-ra-mar-dee-NEE STOT-ram",
      textStatus="not-included",
      textStatusNote=("The full text is not reproduced here. It was not available from a source "
                      "this build could verify, and it will not be transcribed from memory. Add it "
                      "through the documented import process with a citable edition."),
      chapterRef=None, audio=None),
 dict(slug="durga-chalisa", title="Durga Chalisa", deva="दुर्गा चालीसा", iast="durgā calīsā",
      category="bhajan",
      attribution="Hindi devotional composition in the chalisa form; modern printed editions are "
                  "commonly associated with Gita Press and similar publishers.",
      meaning="A forty-verse Hindi devotional hymn to Durga.",
      wordMeaning=[("चालीसा calīsā", "of forty (verses)")],
      pronunciation="dur-gaa CHAA-lee-saa",
      textStatus="not-included",
      textStatusNote=("Not reproduced. Recent printed editions are under copyright, and the app "
                      "will not reproduce a copyrighted devotional text without permission. "
                      "Licence it, then add it through the import process."),
      chapterRef=None, audio=None),
]

w("mantras.json", {
    "collectionId": "mantra-library",
    "title": "Mantra, Stotra, Aarti and Bhajan Library",
    "intro": ("Devotional texts with their source and their verification status. Items marked "
              "'not included' are absent deliberately — they are either copyright-restricted or "
              "could not be sourced from a verifiable edition, and neither is a reason to "
              "transcribe from memory."),
    "editorialNote": SAMPLE_NOTE,
    "items": M,
})

# ---------------------------------------------------------------- stories ---
S = [
 dict(slug="sati-and-the-peethas", title="Sati and the Sacred Places",
      titleHi="सती और पवित्र स्थान", age="8+", minutes=2,
      short=("Long ago there was a queen called Sati. Her father, Daksha, held a huge fire "
             "ceremony and did not invite her husband Shiva, because he did not like him. Sati "
             "went anyway. At the ceremony her father insulted Shiva in front of everyone. Sati "
             "could not bear it, and she gave up her life in the fire. When Shiva heard, his "
             "sadness was so big that he began to dance, and the whole world shook. The other "
             "gods were frightened. Vishnu used his spinning disc to cut Sati's body into pieces "
             "so the dancing would stop. Every place a piece fell became a holy place. Those "
             "places are called Shakti Peethas, and people still visit them today."),
      long=("Sati was the daughter of Daksha Prajapati. She married Shiva against her father's "
            "wishes, because she saw in him what others did not: that his poverty was a choice "
            "and his stillness was not emptiness.\n\n"
            "Years later Daksha held a great yajna, a fire sacrifice, and invited every important "
            "being in the universe except Shiva. Sati argued that a daughter needs no invitation "
            "to her father's house, and she went.\n\n"
            "She was wrong. Daksha received everyone else with honour and mocked Shiva openly. "
            "Sati defended her husband, and was mocked too. At last she understood that staying "
            "would only add to the insult, and she entered the sacrificial fire and gave up her "
            "body.\n\n"
            "When Shiva learned what had happened, his grief took the form of the tandava, a dance "
            "of destruction that shook the three worlds. The gods could not stop him. Vishnu, to "
            "save the world, used his sudarshana chakra to cut the body Sati had carried into "
            "pieces, which fell across the land. Where they fell, the places became sacred — the "
            "Shakti Peethas.\n\n"
            "Shiva's dance slowed, and in time he was brought back. Later tradition says Sati was "
            "born again as Parvati, daughter of the mountain, and won Shiva again.\n\n"
            "Different texts list different numbers of Peethas — 18, 51, 52, 64 or 108 — and they "
            "do not agree about which part fell where. That disagreement is old and it is honest. "
            "The places are real; the list is a matter of tradition."),
      moral="Grief can become a sacred place. What we cannot bear does not have to be wasted.",
      sourceNote=("Puranic narrative (Kalika Purana, Devi Bhagavata and others). Not part of the "
                  "Devi Mahatmya. Regional versions differ in detail."),
      illustrationHints=["a great fire altar", "a dancing figure with the world shaking",
                         "a map with points of light"]),

 dict(slug="durga-and-mahishasura", title="Durga and Mahishasura",
      titleHi="दुर्गा और महिषासुर", age="7+", minutes=2,
      short=("There was a demon called Mahishasura who prayed for so long that the gods had to "
             "give him a wish. He asked that no man and no animal could ever kill him. He thought "
             "that made him safe forever. He took over heaven and threw the gods out. The gods "
             "were desperate. All their anger and all their light came together and became one "
             "being: a goddess riding a lion. Mahishasura laughed when he saw her. He did not "
             "laugh for long. She fought him, and when he changed shape to escape, she followed. "
             "At the end she pinned him down with her foot and killed him with her trident. That "
             "victory is why we celebrate Vijayadashami."),
      long=("Mahishasura was an asura who performed austerities for thousands of years. Brahma "
            "finally appeared and offered him a boon. Mahishasura asked for immortality, which "
            "even Brahma could not grant, so he settled for the next best thing: that neither a "
            "man nor an animal could kill him.\n\n"
            "He did not think to mention women. It did not occur to him that it could matter.\n\n"
            "With that protection he conquered the three worlds. Indra and the devas were driven "
            "out of heaven and wandered the earth like beggars. They went to Vishnu and to Shiva, "
            "and from all of them together a great light arose. The light took form, and every "
            "god gave her his own weapon: Shiva his trident, Vishnu his discus, Varuna his conch, "
            "Agni his spear, Vayu his bow. The mountain gave her a lion to ride.\n\n"
            "When Mahishasura's army saw her they attacked. The Devi Mahatmya describes the "
            "battle at length — the generals Chikshura and Chamara, the elephants, the showers of "
            "weapons. She destroyed the army.\n\n"
            "Then Mahishasura came himself, in the form of a great buffalo. He shook the earth "
            "with his horns and threw mountains. When she pressed him he changed shape — into a "
            "lion, then a man with a sword, then a great elephant — and each time she met him. At "
            "last she pinned him under her foot, and as he emerged half-transformed she took his "
            "head with the trident.\n\n"
            "The gods praised her, and she promised that whenever the world was in trouble she "
            "would return. That promise is the heart of the festival."),
      moral="A wrong that seems unbeatable is usually unbeatable only because nobody considered "
            "the obvious answer.",
      sourceNote="Devi Mahatmya, chapters 2–4 (Markandeya Purana 82–84). Available in full in "
                 "the Scripture section.",
      illustrationHints=["a demon in buffalo form", "a goddess on a lion with many arms",
                         "the gods offering their weapons"]),

 dict(slug="the-nine-forms", title="The Nine Forms of Maa Durga",
      titleHi="माँ दुर्गा के नौ रूप", age="6+", minutes=2,
      short=("Navratri means nine nights, and each night has its own form of the Goddess. First "
             "comes Shailaputri, the mountain's daughter, steady as a hill. Then Brahmacharini, "
             "who practises and practises. Then Chandraghanta, with a bell on her forehead that "
             "warns off harm. Then Kushmanda, whose smile was warm enough to make the world. "
             "Then Skandamata, holding her baby. Then Katyayani, who fights for what is fair. "
             "Then Kalaratri, who is dark and frightening and protects you anyway. Then "
             "Mahagauri, shining white after being washed clean. And last Siddhidatri, who gives "
             "the fruit of all the practice."),
      long=("Navratri is nine nights, and the tradition gives each night a form of the Goddess. "
            "The list is old: it appears in the Devi Kavacham, which is recited before the "
            "Saptashati itself.\n\n"
            "Day 1 — Shailaputri, daughter of the mountain. She rides a bull and carries a "
            "trident and a lotus. She is about being grounded.\n\n"
            "Day 2 — Brahmacharini, the one who practises. She is barefoot, with prayer beads and "
            "a water pot. She is about discipline.\n\n"
            "Day 3 — Chandraghanta, with a half-moon bell on her forehead. Its sound frightens "
            "away harm and comforts the seeker. She is about courage.\n\n"
            "Day 4 — Kushmanda, whose warmth made the cosmic egg. Eight arms, riding a lion. She "
            "is about creativity.\n\n"
            "Day 5 — Skandamata, holding the baby Skanda on her lap. She is about nurture.\n\n"
            "Day 6 — Katyayani, the warrior, born from a sage's prayers. She is about justice.\n\n"
            "Day 7 — Kalaratri, dark and fearsome, riding a donkey — but with two hands always "
            "open in blessing. She is about facing the dark.\n\n"
            "Day 8 — Mahagauri, radiant white after being washed in the Ganga. She is about "
            "renewal.\n\n"
            "Day 9 — Siddhidatri, who gives the fruit of the practice. She is about fulfilment.\n\n"
            "Read together the nine days make a journey: from being grounded, through discipline, "
            "courage, creativity, nurture, resolve and fearlessness, to purity and fulfilment."),
      moral="Growth has an order, and you cannot skip to the last step.",
      sourceNote="Devi Kavacham verses 3–5 (the nine names); the Navadurga Stotram (traditional). "
                 "Colours and offerings vary by region.",
      illustrationHints=["nine panels, one per form", "a lotus", "a bell", "a baby"]),

 dict(slug="raktabija", title="Raktabija and the Drop of Blood",
      titleHi="रक्तबीज और रक्त की बूँद", age="10+", minutes=2,
      short=("There was a demon called Raktabija. He had a strange power: every time a drop of his "
             "blood touched the ground, a new Raktabija stood up. The Goddess fought him and "
             "wounded him, and suddenly there were two of him. She wounded him again, and there "
             "were a hundred. The more she fought in the ordinary way, the worse it got. Then "
             "Kali came out of the Goddess's forehead. She stretched out her tongue over the "
             "battlefield and drank every drop of blood before it could land. With no drops "
             "falling, Raktabija could not multiply, and he was defeated. The story is about "
             "problems that get bigger when you attack them the ordinary way."),
      long=("In the Uttama Charitra of the Devi Mahatmya, the brothers Shumbha and Nishumbha send "
            "their best warriors against the Goddess one after another. Dhumralochana is destroyed "
            "by her mere 'hum'. Chanda and Munda are brought to her by Kali, who arises from "
            "Chandika's brow — and from that episode she is called Chamunda.\n\n"
            "Then comes Raktabija. His boon was that every drop of his blood that fell on the "
            "ground would produce a warrior identical to him.\n\n"
            "The battle goes badly in a specific way. The Goddess wounds him, and the army doubles. "
            "She wounds him harder, and it doubles again. The text describes the field filling "
            "with Raktabijas. Ordinary force is not merely insufficient; it is counterproductive.\n\n"
            "The solution is Kali. She spreads herself over the battlefield and catches every drop "
            "in her mouth before it reaches the earth. With the multiplication stopped, the "
            "original Raktabija can be destroyed.\n\n"
            "The episode is one of the most commented-on in the text. It is usually read as a "
            "statement about a class of problem — craving, anger, a wrong that reproduces itself — "
            "which cannot be cut down directly, because cutting it down is how it spreads. It "
            "needs to be met at the point where it would take root."),
      moral="Some problems grow when you attack them. They have to be met before they land.",
      sourceNote="Devi Mahatmya chapter 8 (Markandeya Purana 88). Available in full in Scripture.",
      illustrationHints=["a battlefield multiplying", "a vast dark figure", "drops of light"]),

 dict(slug="the-weapons-and-the-lion", title="Why She Has So Many Arms",
      titleHi="इतने हाथ क्यों?", age="6+", minutes=2,
      short=("If you look at a picture of Durga, you will notice she has many arms — sometimes "
             "eight, sometimes ten, sometimes more. It is not to look frightening. It is to show "
             "that she can hold many things at once. A sword in one hand, a lotus in another, a "
             "drum, a conch, a shield. And notice this: two of her hands are almost always free. "
             "One says 'do not be afraid'. The other says 'here is what you need'. And the lion? "
             "The lion is fear. She does not kill it. She rides it."),
      long=("Hindu images are not portraits. They are diagrams — they are trying to show you "
            "something that a normal body could not show.\n\n"
            "When Durga has eight or ten arms, the image is saying: this being can hold many "
            "things at the same time. A trident for balance. A discus for the turning of time. A "
            "conch to sound the beginning. A sword to cut one thing away from another. A bow to "
            "reach something far away. A lotus to hold the world without being dirtied by it.\n\n"
            "The weapons are not all hers originally. In the Devi Mahatmya, each god gives her "
            "his own weapon. So the image is also saying: she is what happens when everyone "
            "contributes what they are best at.\n\n"
            "Then look at her hands again. In almost every picture, two hands are doing something "
            "other than fighting. One is raised with the palm outward — that gesture is called "
            "abhaya mudra, and it means 'do not be afraid'. The other is turned down, open — "
            "varada mudra, 'I am giving'.\n\n"
            "So the whole picture says: enormous power, and two hands permanently reserved for "
            "reassurance and generosity.\n\n"
            "And the lion. In some regions it is a tiger. Either way it stands for fear and "
            "appetite. She does not kill it and she does not run from it. She rides it. That is "
            "the whole lesson in one image: you do not get rid of fear. You learn to drive."),
      moral="Strength is not having nothing to fear. It is having your fear underneath you "
            "instead of in front of you.",
      sourceNote="Iconographic reading, informed by the Devi Mahatmya ch. 2 (the gods' weapons). "
                 "Symbolic interpretations vary between traditions.",
      illustrationHints=["many arms holding different objects", "two open hands", "a lion"]),

 dict(slug="suratha-and-samadhi", title="The King, the Merchant, and the Goddess",
      titleHi="राजा, वैश्य और देवी", age="10+", minutes=2,
      short=("A king called Suratha lost his kingdom. His own ministers took it. A merchant "
             "called Samadhi lost his wealth. His own sons threw him out. Both of them ended up "
             "in the same forest, at the same hermitage. And both of them had the same problem: "
             "they still loved the people who had ruined them. The king kept worrying about "
             "whether his elephant was being fed. The merchant kept wondering if his sons were "
             "eating. They went to the sage Medhas and asked the obvious question: why do we "
             "still care about people who used us? His answer was the whole Devi Mahatmya — the "
             "story of the Goddess, who is also the power that makes us attached. At the end she "
             "gave each of them a boon."),
      long=("The Devi Mahatmya is told inside a frame story, and the frame is the reason the text "
            "exists.\n\n"
            "Sage Markandeya is speaking to his disciple. The story he tells begins with Suratha, "
            "a king who ruled well and was nevertheless defeated by his own ministers, stripped "
            "of his treasury, and driven out. Riding alone into the forest, he finds the "
            "hermitage of the sage Medhas.\n\n"
            "There he meets Samadhi, a wealthy merchant whose wife and sons threw him out once "
            "they had his money.\n\n"
            "Both men are miserable, but not in the simple way. Suratha knows his ministers are "
            "thieves and still cannot stop worrying about them. Samadhi knows his family used him "
            "and still aches for them. They ask Medhas the real question: why is our mind "
            "attached to people we know have harmed us? Is this our fault, or is something doing "
            "this to us?\n\n"
            "Medhas answers: this is Mahamaya, the Goddess herself, who deludes all beings — "
            "including Brahma and Vishnu. And then, to explain her, he tells the whole story of "
            "the Devi Mahatmya: Madhu and Kaitabha, Mahishasura, Shumbha and Nishumbha.\n\n"
            "At the end, in chapter 13, both men receive boons. Suratha asks for his kingdom back "
            "and for a greater one in the future. Samadhi asks for knowledge — for the removal of "
            "the very attachment that brought him there.\n\n"
            "The text gives both boons without ranking them. That is worth sitting with."),
      moral="Attachment is not a personal failing; it is a power in the world, and it can be "
            "understood.",
      sourceNote="Devi Mahatmya chapters 1 and 13 (Markandeya Purana 81 and 93). Available in "
                 "full in Scripture.",
      illustrationHints=["a forest hermitage", "a king and a merchant sitting together",
                         "a sage telling a story"]),
]

w("stories.json", {
    "collectionId": "stories",
    "title": "Stories for Children and Families",
    "intro": ("Retellings with a short version, a longer version, and a source note. Regional "
              "variants are named rather than flattened, and the source note says whether a story "
              "is scriptural, Puranic, or regional."),
    "editorialNote": SAMPLE_NOTE,
    "stories": S,
})

# --------------------------------------------------------------- temples ---
T = [
 dict(slug="kamakhya", name="Kamakhya Temple", city="Guwahati", region="Assam", country="India",
      lat=26.17, lon=-91.70, kind="shakti-peetha", festivals=["Ambubachi Mela", "Navratri"],
      note="Also listed in the Shakti Peetha Explorer. Included here so the temple directory and "
           "the Peetha list cross-reference correctly."),
 dict(slug="vaishno-devi", name="Shri Mata Vaishno Devi", city="Katra", region="Jammu and Kashmir",
      country="India", lat=33.03, lon=74.95, kind="major-devi-shrine",
      festivals=["Navratri (Chaitra and Sharad)"],
      note="One of the most visited Devi shrines in the world. Listed among the 51/52 Peethas by "
           "many modern lists but not by all classical enumerations."),
 dict(slug="chamundeshwari", name="Chamundeshwari Temple", city="Mysuru", region="Karnataka",
      country="India", lat=12.25, lon=76.65, kind="major-devi-shrine",
      festivals=["Mysuru Dasara"], note="Hilltop temple above Mysuru; central to Dasara."),
 dict(slug="meenakshi", name="Meenakshi Sundareswarar Temple", city="Madurai", region="Tamil Nadu",
      country="India", lat=9.92, lon=78.12, kind="major-devi-shrine",
      festivals=["Meenakshi Thirukalyanam (Chithirai)"],
      note="A great temple city where the Goddess is the primary deity."),
 dict(slug="kolhapur-mahalaxmi", name="Mahalaxmi Temple", city="Kolhapur", region="Maharashtra",
      country="India", lat=16.70, lon=74.24, kind="shakti-peetha",
      festivals=["Navratri", "Kiranotsav"], note="One of the 18 Maha Shakti Peethas in the "
      "Ashtadasha tradition."),
 dict(slug="tulja-bhavani", name="Tulja Bhavani Temple", city="Tuljapur", region="Maharashtra",
      country="India", lat=18.01, lon=76.07, kind="major-devi-shrine",
      festivals=["Chaitra and Ashwin Navratri"],
      note="Kuladevi of the Bhonsale dynasty."),
 dict(slug="saptashrungi", name="Saptashrungi Nivasini", city="Vani, Nashik", region="Maharashtra",
      country="India", lat=20.13, lon=74.05, kind="major-devi-shrine", festivals=["Navratri"],
      note="Cliff-face temple with 510 steps; associated with the Mahishasura narrative."),
 dict(slug="ambaji", name="Arasuri Ambaji Temple", city="Ambaji", region="Gujarat", country="India",
      lat=24.33, lon=72.44, kind="shakti-peetha", festivals=["Bhadarvi Purnima", "Navratri"],
      note="Aniconic yantra worship; one of Gujarat's largest pilgrimage centres."),
 dict(slug="mansa-devi", name="Mansa Devi Temple", city="Haridwar", region="Uttarakhand",
      country="India", lat=29.96, lon=78.17, kind="shakti-peetha", festivals=["Navratri"],
      note="Paired with Chandi Devi across the Ganga in Haridwar pilgrimage."),
 dict(slug="chandi-devi", name="Chandi Devi Temple", city="Haridwar", region="Uttarakhand",
      country="India", lat=29.95, lon=78.15, kind="major-devi-shrine", festivals=["Navratri"],
      note="On Neel Parvat, above the Ganga."),
 dict(slug="jwala-ji", name="Jwala Devi Temple", city="Jwalamukhi", region="Himachal Pradesh",
      country="India", lat=31.87, lon=76.32, kind="shakti-peetha", festivals=["Navratri melas"],
      note="Aniconic worship of nine natural flames."),
 dict(slug="chintpurni", name="Chintpurni Temple", city="Chintpurni", region="Himachal Pradesh",
      country="India", lat=31.53, lon=76.25, kind="shakti-peetha",
      festivals=["Chaitra and Ashwin Navratri"], note="One of Himachal's most visited Devi shrines."),
 dict(slug="kalighat", name="Kalighat Kali Temple", city="Kolkata", region="West Bengal",
      country="India", lat=22.52, lon=88.34, kind="shakti-peetha", festivals=["Kali Puja"],
      note="Gave Calcutta a plausible etymology."),
 dict(slug="dakshineswar", name="Dakshineswar Kali Temple", city="Dakshineswar, Kolkata",
      region="West Bengal", country="India", lat=22.65, lon=88.36, kind="major-devi-shrine",
      festivals=["Kali Puja", "Phalharini Kali puja"],
      note="Nineteenth-century temple associated with Ramakrishna Paramahamsa."),
 dict(slug="tarapith", name="Tarapith Temple", city="Tarapith, Birbhum", region="West Bengal",
      country="India", lat=24.00, lon=87.90, kind="shakti-peetha", festivals=["Navratri"],
      note="Associated with the saint Bamakhepa; adjacent to a cremation ground."),
 dict(slug="vimla-puri", name="Vimala Temple (inside Jagannath complex)", city="Puri",
      region="Odisha", country="India", lat=19.80, lon=85.82, kind="shakti-peetha",
      festivals=["Navratri", "Rath Yatra period"],
      note="A Shakta shrine inside a Vaishnava temple complex; mahaprasad is offered to Vimala "
           "first."),
 dict(slug="biraja", name="Biraja Temple", city="Jajpur", region="Odisha", country="India",
      lat=20.84, lon=86.32, kind="shakti-peetha", festivals=["Sharad Navratri"],
      note="Two-armed image with distinctive Odia iconography."),
 dict(slug="kanyakumari", name="Bhagavathy Amman Temple", city="Kanyakumari", region="Tamil Nadu",
      country="India", lat=8.08, lon=77.55, kind="major-devi-shrine",
      festivals=["Navratri", "Chaitra Purnima"], note="At the meeting of three seas."),
 dict(slug="kollur", name="Mookambika Temple", city="Kollur", region="Karnataka", country="India",
      lat=13.86, lon=74.98, kind="major-devi-shrine", festivals=["Navratri"],
      note="Swayambhu linga with a golden line, worshipped as Shiva-Shakti together."),
 dict(slug="horanadu", name="Annapoorneshwari Temple", city="Horanadu", region="Karnataka",
      country="India", lat=13.56, lon=75.53, kind="major-devi-shrine", festivals=["Navratri"],
      note="Known for free annaprasada to every visitor."),
 dict(slug="danteshwari", name="Danteshwari Temple", city="Dantewada", region="Chhattisgarh",
      country="India", lat=18.90, lon=81.35, kind="shakti-peetha", festivals=["Bastar Dussehra"],
      note="Bastar Dussehra is a distinctive seventy-five-day royal ritual cycle."),
 dict(slug="guhyeshwari", name="Guheshwari Temple", city="Kathmandu", region="Bagmati",
      country="Nepal", lat=27.71, lon=85.34, kind="shakti-peetha", festivals=["Navratri"],
      note="Beside the Pashupatinath complex on the Bagmati."),
 dict(slug="haleshwari-pashupati", name="Pashupatinath (Devi shrines)", city="Kathmandu",
      region="Bagmati", country="Nepal", lat=27.71, lon=85.35, kind="major-devi-shrine",
      festivals=["Navratri", "Shivaratri"],
      note="Included for pilgrims combining the Kathmandu Devi shrines in one circuit."),
 dict(slug="koneswaram", name="Koneswaram Temple", city="Trincomalee", region="Eastern Province",
      country="Sri Lanka", lat=8.58, lon=81.24, kind="shakti-peetha",
      festivals=["Koneswaram festival", "Navratri"],
      note="Named first in the Ashtadasha enumeration; largely rebuilt in the 20th century."),
 dict(slug="hinglaj", name="Hinglaj Mata Mandir", city="Hingol valley", region="Balochistan",
      country="Pakistan", lat=25.51, lon=65.52, kind="shakti-peetha", festivals=["Hinglaj Yatra"],
      note="Cave shrine in a national park; the annual yatra is organised by Pakistan's Hindu "
           "community. Access is difficult."),
 dict(slug="sharada-peeth", name="Sharada Peeth (ruins)", city="Neelum Valley",
      region="Azad Kashmir", country="Pakistan", lat=34.78, lon=74.20, kind="shakti-peetha",
      festivals=["—"], note="In a militarily sensitive border zone; physical access for pilgrims "
      "is restricted. Historically a major centre of Sharada script scholarship."),
 dict(slug="jeshoreshwari", name="Jeshoreshwari Kali Temple", city="Ishwaripur, Satkhira",
      region="Khulna", country="Bangladesh", lat=21.90, lon=89.15, kind="shakti-peetha",
      festivals=["Kali Puja"], note="A cross-border Bengali tradition."),
 dict(slug="dhakeshwari", name="Dhakeshwari Temple", city="Dhaka", region="Dhaka",
      country="Bangladesh", lat=23.72, lon=90.39, kind="major-devi-shrine",
      festivals=["Durga Puja"], note="The national temple of Bangladesh's Hindu community."),
]

w("temples.json", {
    "collectionId": "temples",
    "title": "Temple Directory and Pilgrimage Planner",
    "intro": ("Important Devi temples and pilgrimage destinations. A Shakti Peetha and a famous "
              "Devi temple are not the same thing: the `kind` field keeps them apart. No darshan "
              "timing, phone number or website has been invented — those fields are left empty "
              "until they can be filled from a current official source and stamped with a date."),
    "editorialNote": SAMPLE_NOTE,
    "lastVerified": None,
    "temples": [{
        **t,
        "id": "temple-" + t["slug"],
        "coordinates": {"lat": t.pop("lat"), "lon": t.pop("lon")},
        "coordinateNote": "Approximate centroid for map placement only.",
        "officialWebsite": None,
        "openingHours": None,
        "contact": None,
        "accessibility": None,
        "infoStatus": "unverified",
        "infoNote": ("Visitor details are intentionally empty. Fill from an official temple source "
                     "and record the date; do not estimate."),
        "sampleContent": True,
    } for t in T],
})

# -------------------------------------------------------------- festivals ---
w("festivals.json", {
    "collectionId": "festivals",
    "title": "Navratri and the Devi Calendar",
    "intro": ("The major Devi observances. Dates are computed for your selected location by the "
              "app's panchang engine, never hard-coded."),
    "editorialNote": SAMPLE_NOTE,
    "observances": [
        dict(slug="sharad-navratri", name="Sharad (Shardiya) Navratri",
             kind="sharad", months="Ashwin shukla paksha (September–October)",
             summary="The principal nine-night observance, ending in Vijayadashami. The Saptashati "
                     "is recited in full across the nine days in most traditions.",
             practices=["Ghatasthapana on day 1", "Daily Navadurga worship",
                        "Saptashati path (one charitra per day, or one chapter per day)",
                        "Fasting in many regions", "Kanya/Kumari puja on Ashtami or Navami",
                        "Havan on Navami in many traditions"]),
        dict(slug="chaitra-navratri", name="Chaitra Navratri", kind="chaitra",
             months="Chaitra shukla paksha (March–April)",
             summary="The spring Navratri. In Maharashtra and Andhra/Telangana/Karnataka its first "
                     "day is Gudi Padwa / Ugadi, the new year.",
             practices=["Ghatasthapana", "Navadurga worship", "New-year observances on day 1",
                        "Ram Navami falls on the ninth day"]),
        dict(slug="gupt-navratri", name="Gupt Navratri", kind="gupt",
             months="Magha and Ashadha shukla paksha (January–February and June–July)",
             summary="The 'hidden' Navratris, observed particularly by tantric and sadhaka "
                     "traditions and less publicly marked. Magha Gupt Navratri and Ashadha Gupt "
                     "Navratri are reckoned separately.",
             practices=["Private sadhana", "Mantra japa", "Less public ritual"]),
        dict(slug="vijayadashami", name="Vijayadashami / Dussehra", kind="dashami",
             months="Ashwin shukla Dashami",
             summary="The tenth day. Marks Durga's victory over Mahishasura and, in the Rama "
                     "tradition, Rama's victory over Ravana. Ayudha puja and Vidyarambham are "
                     "common in the south.",
             practices=["Shami puja", "Ayudha puja", "Vidyarambham", "Ramlila conclusion",
                        "Visarjan in Bengal"]),
        dict(slug="durga-puja-bengal", name="Bengali Durga Puja", kind="regional",
             months="Ashwin; Shashti to Dashami",
             summary="The largest public festival of Bengal. Clay images made for the occasion, "
                     "pandal visiting, and immersion on Dashami.",
             practices=["Bodhon on Shashti", "Pushpanjali", "Kumari puja", "Sandhi puja",
                        "Visarjan"]),
        dict(slug="garba-dandiya", name="Gujarat: Garba and Dandiya", kind="regional",
             months="Ashwin Navratri",
             summary="Nine nights of circle dance around the garbo or the image of Amba, with "
                     "fasting and the nine-colour convention.",
             practices=["Garba", "Dandiya Raas", "Fasting", "Ambaji pilgrimage"]),
        dict(slug="golu", name="South India: Golu / Bommala Kolu", kind="regional",
             months="Ashwin Navratri",
             summary="Stepped displays of dolls in homes, with songs, visiting and exchange of "
                     "gifts. Ayudha puja and Saraswati puja fall within the same days.",
             practices=["Kolu display", "Sundara Kanda / Devi parayana", "Ayudha puja",
                        "Vidyarambham on Dashami"]),
        dict(slug="kanya-puja", name="Kanya / Kumari Puja", kind="observance",
             months="Ashtami or Navami",
             summary="Young girls are worshipped as forms of the Goddess. The practice and its "
                     "details vary considerably by region and family.",
             practices=["Washing of feet", "Offering of food and gifts", "Nine girls for nine "
                        "forms in many traditions"]),
        dict(slug="ashtami-havan", name="Durga Ashtami and Maha Navami", kind="observance",
             months="Ashtami and Navami",
             summary="The ritual peak of the nine days in most north Indian traditions. Havan is "
                     "performed on Navami in many families; sandhi puja marks the Ashtami-Navami "
                     "junction in Bengal.",
             practices=["Havan / homa", "Kumari puja", "Sandhi puja (Bengal)", "Fasting breaking"]),
    ],
})

# ------------------------------------------------------------------ puja ---
w("puja.json", {
    "collectionId": "puja",
    "title": "Puja Guides",
    "intro": ("Practical guidance written to be usable without pretending to be authoritative. "
              "Every page states that ritual differs by family, region and sampradaya, and no "
              "muhurat is hard-coded — timings are computed for your location."),
    "editorialNote": SAMPLE_NOTE,
    "guides": [
        dict(slug="ghatasthapana", title="Ghatasthapana / Kalash Sthapana",
             summary="The installation of the kalash that opens Navratri.",
             sections=[
                 dict(heading="What it is",
                      body="Ghatasthapana is the installation of a kalash (a pot, usually copper "
                           "or clay) filled with water, topped with mango or ashoka leaves and a "
                           "coconut, on a bed of soil in which barley or wheat is sown. It marks "
                           "the Goddess's arrival in the home and the beginning of the nine days."),
                 dict(heading="Why it matters",
                      body="The pot stands for the womb and for the cosmos; the sown grain is the "
                           "promise that the worship has taken root. The sprouted grain is "
                           "traditionally read at the end of the nine days, and is distributed as "
                           "prasad on Vijayadashami in many families."),
                 dict(heading="Materials (commonly used)",
                      body="Copper or clay pot · clean water · mango or ashoka leaves · coconut · "
                           "soil or sand · barley or wheat grain · red cloth · kalava (sacred "
                           "thread) · roli, akshat, flowers · a small idol or image of the "
                           "Goddess · ghee lamp. Substitutions are normal and traditional; use "
                           "what your family uses."),
                 dict(heading="Sequence (a widely followed form)",
                      body="1. Choose the place — clean, stable, and not where people walk over it. "
                           "A northeast corner is common.\n"
                           "2. Spread a layer of soil in a shallow plate and sow the barley.\n"
                           "3. Fill the kalash with water; add a betel nut, a coin and a little "
                           "rice in many traditions.\n"
                           "4. Arrange the leaves around the neck and set the coconut on top, "
                           "wrapped in red cloth.\n"
                           "5. Tie the kalava around the neck.\n"
                           "6. Place the image of the Goddess beside it.\n"
                           "7. Light the lamp, offer flowers and rice, and say your family's "
                           "invocation or the Navarna mantra.\n"
                           "8. Resolve (sankalpa) to keep the nine days.\n\n"
                           "Your family's sequence may differ. Follow it."),
                 dict(heading="Timing",
                      body="Ghatasthapana is performed on Pratipada, the first tithi of the shukla "
                           "paksha. This app computes that date for your selected city. Muhurat "
                           "windows (such as the first third of the day, or Abhijit) differ by "
                           "tradition and by the panchang you follow — use your family priest's "
                           "or your local panchang's determination rather than an app's guess. "
                           "This app deliberately does not print a universal muhurat."),
                 dict(heading="Safety",
                      body="A ghee or oil lamp left burning unattended is a genuine fire risk. "
                           "Keep it on a non-combustible plate, away from cloth, curtains and "
                           "reach of children and pets. If nobody is in the room, extinguish it — "
                           "the worship does not require an unattended flame. Keep camphor and "
                           "incense away from anything flammable, and ventilate the room."),
                 dict(heading="Links",
                      body="For an authoritative muhurat, consult your family priest, your local "
                           "temple, or a published panchang for your city. This app's calendar "
                           "shows the computed tithi and Navratri day, and states its method."),
             ]),
        dict(slug="daily-puja", title="A simple daily puja for the nine days",
             summary="A short form for households that are not doing a full ritual.",
             sections=[
                 dict(heading="A five-minute form",
                      body="Wash your hands. Light a lamp. Offer water and a flower. Say the "
                           "Navadurga name for the day and its dhyana shloka if you know it, or "
                           "simply the Navarna mantra nine times. Sit quietly for a minute. "
                           "Finish with whatever your family says. That is a complete puja."),
                 dict(heading="A longer form",
                      body="Add the Devi Kavacham, or one chapter of the Saptashati per day. Add "
                           "an aarti. Add a reading from the Stories section for any children "
                           "present."),
                 dict(heading="What is actually required",
                      body="Attention. Everything else is traditional and valuable but not "
                           "obligatory, and no one is disqualified by not having the right pot."),
             ]),
        dict(slug="fasting", title="Fasting and daily observances",
             summary="General information, with an explicit health warning.",
             sections=[
                 dict(heading="A necessary note first",
                      body="Fasting is a choice, not a requirement, and it is not a measure of "
                           "devotion. People who are pregnant, breastfeeding, diabetic, on "
                           "medication, underweight, elderly, or under eighteen, and anyone with "
                           "a medical condition, should not fast without speaking to a doctor. "
                           "Children should not fast. If fasting makes you unwell, stop. No "
                           "tradition is served by that."),
                 dict(heading="Commonly observed forms",
                      body="Practices range from a full nirjala fast (no food or water) to eating "
                           "once a day to eating normally while avoiding onion, garlic, grain and "
                           "alcohol. Most people do something in the middle. Regional practice "
                           "varies widely."),
                 dict(heading="Foods commonly used",
                      body="Sabudana (tapioca) · kuttu (buckwheat) · singhara (water chestnut "
                           "flour) · sama rice (barnyard millet) · potatoes · rock salt instead "
                           "of sea salt · milk, curd, paneer · fruits · dry fruits · makhana."),
                 dict(heading="Hydration",
                      body="If you are fasting, drink water. Dehydration causes headaches, "
                           "dizziness and fainting, and none of that is a spiritual achievement. "
                           "Buttermilk, coconut water and fruit help."),
                 dict(heading="Breaking the fast",
                      body="Break gently — fruit, milk, or a small cooked meal rather than a large "
                           "fried one. Traditionally the fast is broken after the day's puja."),
             ]),
        dict(slug="ashtami-navami", title="Durga Ashtami, Maha Navami and Vijayadashami",
             summary="The ritual peak of the nine days.",
             sections=[
                 dict(heading="Durga Ashtami",
                      body="The eighth tithi. In many north Indian traditions the fast is kept "
                           "strictly through this day. Kumari/Kanya puja is commonly performed "
                           "on Ashtami or Navami. In Bengal the Ashtami-Navami junction is marked "
                           "by sandhi puja, which recalls the moment Chamunda arose."),
                 dict(heading="Maha Navami",
                      body="The ninth tithi. Havan is performed in many families, with the "
                           "Saptashati recited during it. In some traditions the havan concludes "
                           "the Saptashati path begun on day one."),
                 dict(heading="Vijayadashami",
                      body="The tenth day, on shukla Dashami. It marks Durga's victory over "
                           "Mahishasura and, in the Rama tradition, Rama's victory over Ravana. "
                           "Ayudha puja (honouring tools, instruments and vehicles) and Vidyarambham "
                           "(beginning a child's learning) are common in the south. In Bengal the "
                           "images are immersed."),
                 dict(heading="Regional differences are not variations on a theme",
                      body="A Bengali, a Gujarati, a Tamil and a Marathi family will do genuinely "
                           "different things on these three days, and each practice is complete "
                           "in itself. This app describes several rather than declaring one "
                           "correct."),
             ]),
    ],
})

# --------------------------------------------------------------- glossary ---
G = [
 ("Abhaya mudra", "अभय मुद्रा", "The gesture of the raised open palm meaning 'do not fear'."),
 ("Ardhanarishvara", "अर्धनारीश्वर", "The half-female form of Shiva; tradition says Shiva attained "
  "it through the Goddess's grace."),
 ("Argala", "अर्गल", "A bolt or bar; the name of the auxiliary hymn recited with the Saptashati."),
 ("Ayanamsha", "अयनांश", "The offset between tropical and sidereal zodiacs. Traditions differ in "
  "which is used, which is why panchangs can disagree."),
 ("Bhoga", "भोग", "Food offered to the deity and later distributed as prasad."),
 ("Bija", "बीज", "A seed syllable in a mantra, such as aim, hrim, klim. Not lexical words."),
 ("Chandi", "चण्डी", "The name the Devi Mahatmya uses most often for its Goddess."),
 ("Chandi Path", "चण्डी पाठ", "Recitation of the Durga Saptashati."),
 ("Charitra", "चरित्र", "A narrative cycle. The Saptashati has three."),
 ("Damaru", "डमरु", "A small hourglass drum, associated with Shiva and with Mahagauri."),
 ("Dhyana", "ध्यान", "Meditation; also the descriptive verse recited before visualising a deity."),
 ("Garba", "गरबा", "The Gujarati circle dance performed through the Navratri nights."),
 ("Ghatasthapana", "घटस्थापना", "The installation of the kalash that opens Navratri."),
 ("Guna", "गुण", "One of the three qualities — sattva, rajas, tamas — that compose prakriti."),
 ("Kalash", "कलश", "The ritual pot installed on the first day of Navratri."),
 ("Kavacha", "कवच", "Armour; the protective hymn recited first in the Navangam sequence."),
 ("Kilaka", "कीलक", "A pin or wedge; the auxiliary hymn recited to remove obstacles to recitation."),
 ("Kumari puja", "कुमारी पूजा", "Worship of young girls as forms of the Goddess, on Ashtami or "
  "Navami in many traditions."),
 ("Mahamaya", "महामाया", "The great illusion; a name of the Goddess in the Devi Mahatmya."),
 ("Muhurat", "मुहूर्त", "An auspicious time window. Location-specific, never universal."),
 ("Nakshatra", "नक्षत्र", "One of the 27 lunar mansions."),
 ("Navanga", "नवाङ्ग", "The nine-part recitation sequence of the Saptashati used in many traditions."),
 ("Navarna mantra", "नवार्ण मन्त्र", "The nine-syllable mantra of Chandika."),
 ("Nyasa", "न्यास", "Ritual placement of mantra syllables on the body."),
 ("Paksha", "पक्ष", "A lunar fortnight: shukla (waxing) or krishna (waning)."),
 ("Panchang", "पञ्चाङ्ग", "The five-limb Hindu calendar: tithi, vara, nakshatra, yoga, karana."),
 ("Parayana", "पारायण", "Continuous recitation of a text."),
 ("Pinda", "पिण्ड", "In the Vaishno Devi cave, the natural rock formations worshipped as the "
  "Goddess."),
 ("Prasad", "प्रसाद", "Food offered to the deity and then shared."),
 ("Sandhi puja", "सन्धि पूजा", "The Bengali rite at the junction of Ashtami and Navami."),
 ("Sankalpa", "सङ्कल्प", "The formal statement of intention made at the start of a rite."),
 ("Shakti", "शक्ति", "Power, capacity, energy. In Shakta thought, the Goddess herself."),
 ("Shakti Peetha", "शक्तिपीठ", "A sacred seat associated with a part of Sati's body. Lists differ."),
 ("Stotra", "स्तोत्र", "A hymn of praise."),
 ("Tithi", "तिथि", "A lunar day, one twelfth of the Sun-Moon elongation cycle."),
 ("Trayanga", "त्रयङ्ग", "The three-part recitation method, one charitra per day."),
 ("Trishula", "त्रिशूल", "The trident; represents the three gunas."),
 ("Upanayana of the text", "—", "—"),
 ("Varada mudra", "वरद मुद्रा", "The gesture of the downward open palm meaning 'giving'."),
 ("Vrat", "व्रत", "A vow, often involving fasting."),
 ("Yantra", "यन्त्र", "A geometric diagram used in worship; Ambaji worships one aniconically."),
 ("Yogamaya", "योगमाया", "The Goddess as the power of yoga and of illusion, named in ch. 1."),
]

w("glossary.json", {
    "collectionId": "glossary",
    "title": "Glossary",
    "intro": "Sanskrit and Hindi terms with plain explanations.",
    "editorialNote": SAMPLE_NOTE,
    "terms": [{"id": f"term-{i}", "english": e, "devanagari": d, "definition": df}
              for i, (e, d, df) in enumerate(sorted(G), 1) if df != "—"],
})

# ------------------------------------------------------------------- quiz ---
w("quiz.json", {
    "collectionId": "quiz",
    "title": "Quizzes and Flashcards",
    "intro": ("Self-checks. Progress here measures reading, not merit — nothing in this app "
              "implies that spiritual worth can be scored."),
    "editorialNote": SAMPLE_NOTE,
    "quizzes": [
        {"id": "quiz-navadurga", "title": "Navadurga quiz", "topic": "The nine forms",
         "questions": [
           {"q": "Which form is worshipped on the first day of Navratri?",
            "options": ["Shailaputri", "Brahmacharini", "Chandraghanta", "Kushmanda"],
            "answer": 0, "why": "Pratipada is Shailaputri, daughter of the mountain."},
           {"q": "Which form carries a japa mala and a kamandalu?",
            "options": ["Skandamata", "Brahmacharini", "Siddhidatri", "Mahagauri"],
            "answer": 1, "why": "The beads and water pot are the equipment of a student of the "
                               "spirit — Brahmacharini."},
           {"q": "Which form holds the infant Skanda on her lap?",
            "options": ["Katyayani", "Kalaratri", "Skandamata", "Kushmanda"],
            "answer": 2, "why": "Skandamata, mother of Skanda."},
           {"q": "Which of the nine is dark-complexioned and rides a donkey?",
            "options": ["Chandraghanta", "Kalaratri", "Mahagauri", "Katyayani"],
            "answer": 1, "why": "Kalaratri, on the seventh day."},
           {"q": "Where does the list of nine names appear?",
            "options": ["The Rig Veda", "The Devi Kavacham, verses 3–5",
                       "The Bhagavad Gita", "The Valmiki Ramayana"],
            "answer": 1, "why": "Devi Kavacham verses 3–5 name all nine and state they were "
                               "declared by Brahma."},
           {"q": "Which form is associated with the cosmic egg and creative warmth?",
            "options": ["Kushmanda", "Shailaputri", "Siddhidatri", "Chandraghanta"],
            "answer": 0, "why": "Kushmanda, on the fourth day."},
         ]},
        {"id": "quiz-saptashati", "title": "Durga Saptashati quiz", "topic": "The thirteen chapters",
         "questions": [
           {"q": "How many chapters does the Durga Saptashati have?",
            "options": ["9", "11", "13", "18"], "answer": 2,
            "why": "Thirteen, in three charitras."},
           {"q": "Which chapter is the Madhu-Kaitabha narrative?",
            "options": ["1", "2", "5", "8"], "answer": 0,
            "why": "Chapter 1, the whole of the Prathama Charitra."},
           {"q": "In which chapter does Kali arise to kill Chanda and Munda?",
            "options": ["3", "6", "7", "10"], "answer": 2,
            "why": "Chapter 7. From that episode she is called Chamunda."},
           {"q": "Which chapter contains the Raktabija episode?",
            "options": ["7", "8", "9", "11"], "answer": 1,
            "why": "Chapter 8, raktabIjavadhaH."},
           {"q": "The 'Ya Devi Sarvabhuteshu' hymn appears in which chapter?",
            "options": ["4", "5", "11", "12"], "answer": 1,
            "why": "Chapter 5, in the dialogue with the messengers."},
           {"q": "Which chapter is the Narayani Stuti?",
            "options": ["10", "11", "12", "13"], "answer": 1,
            "why": "Chapter 11."},
           {"q": "What is the traditional verse count of the text?",
            "options": ["579", "656", "700", "1000"], "answer": 2,
            "why": "700, as the source's own colophon states. Our import reconciles to exactly 700."},
           {"q": "Who receives boons in the final chapter?",
            "options": ["Indra and Agni", "Suratha and Samadhi", "Markandeya and his disciple",
                       "Shiva and Brahma"], "answer": 1,
            "why": "Chapter 13 closes the frame story with boons to the king and the merchant."},
         ]},
        {"id": "quiz-peethas", "title": "Shakti Peetha quiz", "topic": "The sacred seats",
         "questions": [
           {"q": "According to tradition, how do the Shakti Peethas come to exist?",
            "options": ["They were built by kings", "Parts of Sati's body fell at those places",
                       "They mark sites of great battles", "They are places the Goddess chose "
                       "in a dream"],
            "answer": 1, "why": "The Daksha-yajna narrative. It is Puranic, not part of the Devi "
                               "Mahatmya."},
           {"q": "How many Shakti Peethas are there?",
            "options": ["51, always", "52, always",
                       "It depends on the list — 18, 51, 52, 64 and 108 are all attested",
                       "There is no traditional number"],
            "answer": 2, "why": "The enumerations disagree, and the disagreement is old."},
           {"q": "Which of these is in Nepal?",
            "options": ["Kamakhya", "Guheshwari", "Kalighat", "Tarapith"],
            "answer": 1, "why": "Guheshwari, beside Pashupatinath in Kathmandu."},
           {"q": "Kamakhya is on which hill?",
            "options": ["Nilachal", "Girnar", "Arasur", "Trikuta"],
            "answer": 0, "why": "Nilachal hill, Guwahati."},
           {"q": "What is worshipped at Jwala Devi?",
            "options": ["A stone image", "A copper mask", "Natural flames from the rock",
                       "A silver yantra"],
            "answer": 2, "why": "The sanctum has no image; the flames are the object of worship."},
           {"q": "Is every famous Devi temple a Shakti Peetha?",
            "options": ["Yes", "No — the two categories are different and should not be conflated",
                       "Only in South India", "Only if it is older than 1000 years"],
            "answer": 1, "why": "Meenakshi, Chamundeshwari and Dhakeshwari are great Devi temples "
                               "and are not universally enumerated as Peethas."},
         ]},
    ],
})

# -------------------------------------------------------------- locations ---
w("locations.json", {
    "collectionId": "locations",
    "title": "Calendar locations",
    "intro": ("Locations available for panchang calculation. Coordinates and UTC offsets are "
              "approximate and are used only to place sunrise and to convert times. Add your own "
              "through Settings if your city is not here."),
    "locations": [
        {"id": "delhi", "city": "New Delhi", "region": "Delhi", "country": "India",
         "lat": 28.6139, "lon": 77.2090, "utcOffsetHours": 5.5, "timezone": "Asia/Kolkata"},
        {"id": "mumbai", "city": "Mumbai", "region": "Maharashtra", "country": "India",
         "lat": 19.0760, "lon": 72.8777, "utcOffsetHours": 5.5, "timezone": "Asia/Kolkata"},
        {"id": "kolkata", "city": "Kolkata", "region": "West Bengal", "country": "India",
         "lat": 22.5726, "lon": 88.3639, "utcOffsetHours": 5.5, "timezone": "Asia/Kolkata"},
        {"id": "chennai", "city": "Chennai", "region": "Tamil Nadu", "country": "India",
         "lat": 13.0827, "lon": 80.2707, "utcOffsetHours": 5.5, "timezone": "Asia/Kolkata"},
        {"id": "bengaluru", "city": "Bengaluru", "region": "Karnataka", "country": "India",
         "lat": 12.9716, "lon": 77.5946, "utcOffsetHours": 5.5, "timezone": "Asia/Kolkata"},
        {"id": "hyderabad", "city": "Hyderabad", "region": "Telangana", "country": "India",
         "lat": 17.3850, "lon": 78.4867, "utcOffsetHours": 5.5, "timezone": "Asia/Kolkata"},
        {"id": "ahmedabad", "city": "Ahmedabad", "region": "Gujarat", "country": "India",
         "lat": 23.0225, "lon": 72.5714, "utcOffsetHours": 5.5, "timezone": "Asia/Kolkata"},
        {"id": "varanasi", "city": "Varanasi", "region": "Uttar Pradesh", "country": "India",
         "lat": 25.3176, "lon": 82.9739, "utcOffsetHours": 5.5, "timezone": "Asia/Kolkata"},
        {"id": "guwahati", "city": "Guwahati", "region": "Assam", "country": "India",
         "lat": 26.1445, "lon": 91.7362, "utcOffsetHours": 5.5, "timezone": "Asia/Kolkata"},
        {"id": "jammu", "city": "Jammu", "region": "Jammu and Kashmir", "country": "India",
         "lat": 32.7266, "lon": 74.8570, "utcOffsetHours": 5.5, "timezone": "Asia/Kolkata"},
        {"id": "kathmandu", "city": "Kathmandu", "region": "Bagmati", "country": "Nepal",
         "lat": 27.7172, "lon": 85.3240, "utcOffsetHours": 5.75, "timezone": "Asia/Kathmandu"},
        {"id": "dhaka", "city": "Dhaka", "region": "Dhaka", "country": "Bangladesh",
         "lat": 23.8103, "lon": 90.4125, "utcOffsetHours": 6, "timezone": "Asia/Dhaka"},
        {"id": "colombo", "city": "Colombo", "region": "Western", "country": "Sri Lanka",
         "lat": 6.9271, "lon": 79.8612, "utcOffsetHours": 5.5, "timezone": "Asia/Colombo"},
        {"id": "karachi", "city": "Karachi", "region": "Sindh", "country": "Pakistan",
         "lat": 24.8607, "lon": 67.0011, "utcOffsetHours": 5, "timezone": "Asia/Karachi"},
        {"id": "london", "city": "London", "region": "England", "country": "United Kingdom",
         "lat": 51.5072, "lon": -0.1276, "utcOffsetHours": 0, "timezone": "Europe/London",
         "note": "Fixed offset shown; the UK observes DST. Times are converted with the IANA "
                 "timezone, which handles it."},
        {"id": "newyork", "city": "New York", "region": "New York", "country": "United States",
         "lat": 40.7128, "lon": -74.0060, "utcOffsetHours": -5, "timezone": "America/New_York",
         "note": "Fixed offset shown; DST is handled through the IANA timezone."},
        {"id": "singapore", "city": "Singapore", "region": "—", "country": "Singapore",
         "lat": 1.3521, "lon": 103.8198, "utcOffsetHours": 8, "timezone": "Asia/Singapore"},
        {"id": "sydney", "city": "Sydney", "region": "New South Wales", "country": "Australia",
         "lat": -33.8688, "lon": 151.2093, "utcOffsetHours": 10, "timezone": "Australia/Sydney",
         "note": "Fixed offset shown; DST is handled through the IANA timezone."},
    ],
})

print("\ndone")
