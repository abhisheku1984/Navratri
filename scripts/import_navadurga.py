# -*- coding: utf-8 -*-
"""Emit src/content/navadurga.json.

The dhyana shloka for each of the nine forms is *parsed out of* the sourced
file scripts/sources/navadurga-stotram-sangrah.md rather than retyped here, so
the Devanagari cannot drift from its citation.
"""
import json, os, re, unicodedata

SRC = "scripts/sources/navadurga-stotram-sangrah.md"
raw = open(SRC, encoding="utf-8").read()

# split on the "शैलपुत्री –" style headings
parts = re.split(r"\n([शबचकसमसि][\u0900-\u097F]+)\s*–\s*\n", raw)
blocks = {}
for i in range(1, len(parts), 2):
    name = parts[i].strip()
    body = parts[i + 1]
    verses = []
    for chunk in re.findall(r"([\u0900-\u097F\s॥०-९।ऽ']+॥\s*[०-९]+\s*॥)", body):
        verses.append(" ".join(chunk.split()))
    blocks[name] = "\n".join(verses)

print("parsed forms from source:", list(blocks.keys()))

FORMS = [
 dict(day=1, slug="shailaputri", deva="शैलपुत्री", hindi="माँ शैलपुत्री",
      iast="Śailaputrī", meaning="Daughter of the mountain",
      key="शैलपुत्री",
      origin=("Tradition holds that after Sati gave up her body at Daksha's sacrifice she was born "
              "again as Parvati, daughter of Himavat, king of the mountains. As the mountain's "
              "daughter she is Shailaputri. Her worship opens the Navadurga sequence and looks "
              "backwards to the Sati narrative that also explains the origin of the Shakti Peethas."),
      iconography=("Two arms. She rides a bull (Nandi) and carries a trident in the right hand and a "
                   "lotus in the left. A half-moon adorns her crown. She is shown calm and "
                   "unhurried rather than martial."),
      symbolism=[("Trident (trishula)", "The three gunas — sattva, rajas, tamas — held in balance, not destroyed."),
                 ("Lotus", "Detachment: rooted in mud, untouched by it."),
                 ("Bull / Nandi", "Steadiness and dharma; the vehicle links her to Shiva."),
                 ("Half-moon", "Cycles of waxing and waning; time held lightly.")],
      colour="White / red (varies by region)",
      colourNote=("White is common in northern calendars; some Bengali and Gujarati traditions "
                  "assign a different colour to day one. The colour list is a devotional "
                  "convention, not a scriptural rule."),
      flower="Jasmine and white lotus (commonly offered)",
      bhog="Pure ghee and milk preparations (commonly offered)",
      qualities=["Groundedness", "Patience", "Beginnings", "Rooted strength"],
      chakra="Muladhara (root) — in traditions that map the nine forms onto the chakras",
      planet="Moon (in traditions that assign one)",
      scriptureRef=("The nine names are given in the Devi Kavacham, verses 3–5, which is part of the "
                    "Saptashati's auxiliary recitation. See Scripture › Angas › Devi Kavacham."),
      kavachamVerse="3",
      familyStory=("Long ago, a queen of the mountains was given a daughter. The girl grew up strong "
                   "and steady, like the hills themselves. When the time came she chose Shiva, who "
                   "had nothing but ashes and a bull for company, because she saw that his quietness "
                   "was not emptiness but depth. On the first day of Navratri we remember her: "
                   "strength does not have to shout."),
      routine=[("Minute 1", "Sit quietly. Say the name: Shailaputri — daughter of the mountain."),
               ("Minute 2", "Recite the dhyana shloka once, slowly."),
               ("Minute 3", "Recall one thing you are grateful to be grounded in."),
               ("Minute 4", "Offer a flower or a little water if you have one."),
               ("Minute 5", "Sit still and breathe. End with 'Jai Mata Di'.")]),

 dict(day=2, slug="brahmacharini", deva="ब्रह्मचारिणी", hindi="माँ ब्रह्मचारिणी",
      iast="Brahmacāriṇī", meaning="She who practises austerity; the ascetic",
      key="ब्रह्मचारिणी",
      origin=("Parvati undertook years of severe tapasya to win Shiva, eating nothing but bilva "
              "leaves and at last nothing at all. The form that remembers that discipline is "
              "Brahmacharini — barefoot, unmarried, absorbed."),
      iconography=("Two arms. She walks barefoot. In her hands are a japa mala (prayer beads) and a "
                   "kamandalu (water pot) — the whole equipment of a student of the spirit."),
      symbolism=[("Japa mala", "Repetition as a discipline of attention."),
                 ("Kamandalu", "Simplicity; the minimum needed to live and learn."),
                 ("Bare feet", "Directness; nothing between the seeker and the ground."),
                 ("Unmarried form", "Wholeness that is not defined by relationship.")],
      colour="Green (varies by region)",
      colourNote="Colour assignments for the nine days differ between regional calendars.",
      flower="White flowers and bilva leaves (commonly offered)",
      bhog="Sugar and fruit (commonly offered)",
      qualities=["Discipline", "Focus", "Simplicity", "Perseverance"],
      chakra="Svadhisthana (sacral) — in traditions that map the nine forms onto the chakras",
      planet="Mars (in traditions that assign one)",
      scriptureRef="Devi Kavacham, verse 3 (name list).",
      kavachamVerse="3",
      familyStory=("Parvati wanted to learn. She practiced every day, even when it was hard, and even "
                   "when no one was watching. She did not want a prize; she wanted to become someone "
                   "who could be trusted with something great. On the second day we remember that "
                   "practising a little, every day, is a kind of worship too."),
      routine=[("Minute 1", "Name the form: Brahmacharini — the one who practises."),
               ("Minute 2", "Recite the dhyana shloka once."),
               ("Minute 3", "Choose one small thing to give up today (a snack, a scroll, a complaint)."),
               ("Minute 4", "Say the Navarna mantra nine times, or any mantra you know."),
               ("Minute 5", "Sit quietly. End with 'Jai Mata Di'.")]),

 dict(day=3, slug="chandraghanta", deva="चन्द्रघण्टा", hindi="माँ चन्द्रघण्टा",
      iast="Candraghaṇṭā", meaning="She whose bell is the half-moon",
      key="चन्द्रघण्टा",
      origin=("When Parvati prepared to meet Shiva she took a fierce form to match the intensity of "
              "the meeting. On her forehead she placed a half-moon shaped like a bell — ghanta — "
              "whose sound terrifies those who would do harm and reassures those who seek shelter."),
      iconography=("Ten arms. She rides a lion or tiger. Weapons fill most of her hands; two are "
                   "raised in blessing and protection. A crescent bell sits on her brow."),
      symbolism=[("Crescent bell", "Sound as a boundary: warning to harm, welcome to the seeker."),
                 ("Ten arms", "Capacity — the ability to hold many things at once without dropping any."),
                 ("Lion / tiger", "Fear mastered and put to work, not fear denied."),
                 ("Blessing hands", "Power that ends in generosity.")],
      colour="Grey / yellow (varies by region)",
      colourNote="Colour assignments differ between regional calendars.",
      flower="Yellow and orange flowers (commonly offered)",
      bhog="Milk and rice kheer (commonly offered)",
      qualities=["Courage", "Alertness", "Readiness", "Fearlessness"],
      chakra="Manipura (solar plexus) — in traditions that map the nine forms onto the chakras",
      planet="Venus (in traditions that assign one)",
      scriptureRef="Devi Kavacham, verse 3 (name list).",
      kavachamVerse="3",
      familyStory=("Parvati put a little bell on her forehead. Its sound was loud enough to warn away "
                   "anything that meant harm, but gentle enough that a child could sleep through it. "
                   "Courage, she taught, is not the absence of fear. It is hearing the bell, staying "
                   "awake, and staying kind."),
      routine=[("Minute 1", "Name the form: Chandraghanta — the bell of the moon."),
               ("Minute 2", "Recite the dhyana shloka once."),
               ("Minute 3", "Name one fear out loud. Say it plainly, without shame."),
               ("Minute 4", "Say the mantra nine times."),
               ("Minute 5", "Breathe slowly and end with 'Jai Mata Di'.")]),

 dict(day=4, slug="kushmanda", deva="कूष्माण्डा", hindi="माँ कूष्माण्डा",
      iast="Kūṣmāṇḍā", meaning="She whose warmth made the cosmic egg",
      key="कूष्माण्डा",
      origin=("Before there was light there was darkness, and in that darkness the Goddess smiled. "
              "Tradition says that smile was the first warmth, and that from it the universe came "
              "into being. Kushmanda is that creative warmth, and she is said to live in the heart "
              "of the sun."),
      iconography=("Eight arms — hence the folk reading 'Ku-ushma-anda', the one of the eightfold "
                   "cosmic egg. She rides a lion. She holds a kamandalu, bow, arrow, lotus, "
                   "amrita vessel, discus and mace, and a rosary that grants every siddhi."),
      symbolism=[("Eight arms", "The directions; completeness of creative capacity."),
                 ("Amrita vessel", "Life sustained, not merely created."),
                 ("Rosary of siddhis", "That practice, not luck, yields ability."),
                 ("Lion", "Creative energy that is not timid.")],
      colour="Orange (varies by region)",
      colourNote="Colour assignments differ between regional calendars.",
      flower="Malati / jasmine (commonly offered)",
      bhog="Malpua (commonly offered)",
      qualities=["Creativity", "Warmth", "Vitality", "Generosity"],
      chakra="Anahata (heart) — in traditions that map the nine forms onto the chakras",
      planet="Sun (in traditions that assign one)",
      scriptureRef="Devi Kavacham, verse 3 (name list, given as Kushmanda).",
      kavachamVerse="3",
      familyStory=("Before anything existed, there was dark. Then the Goddess smiled — and the smile "
                   "was warm, and the warmth became light, and the light became everything. On the "
                   "fourth day we remember that the world began with warmth, and that a warm face is "
                   "a small act of creation."),
      routine=[("Minute 1", "Name the form: Kushmanda — the warmth that made the world."),
               ("Minute 2", "Recite the dhyana shloka once."),
               ("Minute 3", "Think of one thing you made — a meal, a drawing, a kind sentence."),
               ("Minute 4", "Say the mantra nine times."),
               ("Minute 5", "Sit in the warmth. End with 'Jai Mata Di'.")]),

 dict(day=5, slug="skandamata", deva="स्कन्दमाता", hindi="माँ स्कन्दमाता",
      iast="Skandamātā", meaning="Mother of Skanda (Kartikeya)",
      key="स्कन्दमाता",
      origin=("The Gods needed a commander. From Shiva and Parvati was born Skanda, also called "
              "Kartikeya, who led the armies of the devas. The Goddess as his mother is "
              "Skandamata — power expressed as nurture."),
      iconography=("Four arms. She sits on a lotus (padmasana) and holds the infant Skanda on her "
                   "lap. Two hands grant blessing; the lotus she holds is in bloom."),
      symbolism=[("Infant Skanda", "Strength that is carried before it is used."),
                 ("Lotus seat", "Holding the world without being stained by it."),
                 ("Two blessing hands", "Protection offered before it is asked for."),
                 ("Mother-and-child", "The Goddess as nurturer, not only as warrior.")],
      colour="White (varies by region)",
      colourNote="Colour assignments differ between regional calendars.",
      flower="White lotus (commonly offered)",
      bhog="Bananas (commonly offered)",
      qualities=["Nurture", "Protection", "Tenderness", "Teaching"],
      chakra="Vishuddha (throat) — in traditions that map the nine forms onto the chakras",
      planet="Mercury (in traditions that assign one)",
      scriptureRef="Devi Kavacham, verse 4 (name list).",
      kavachamVerse="4",
      familyStory=("The Goddess had a son called Skanda, who grew up to lead the armies of the gods. "
                   "But before he was a general he was a baby, and she held him. On the fifth day we "
                   "remember that every strong person was once carried by someone, and that carrying "
                   "is also a kind of strength."),
      routine=[("Minute 1", "Name the form: Skandamata — mother of Skanda."),
               ("Minute 2", "Recite the dhyana shloka once."),
               ("Minute 3", "Remember someone who carried you. Say their name."),
               ("Minute 4", "Say the mantra nine times."),
               ("Minute 5", "Sit quietly. End with 'Jai Mata Di'.")]),

 dict(day=6, slug="katyayani", deva="कात्यायनी", hindi="माँ कात्यायनी",
      iast="Kātyāyanī", meaning="Daughter of the sage Katyayana",
      key="कात्यायनी",
      origin=("The sage Katyayana performed long austerities asking that the Goddess be born in his "
              "house. She consented, and was born as his daughter Katyayani. The gopis of Vraja are "
              "said to have worshipped this same form to win Krishna. She is the warrior aspect "
              "closest to the Mahishasura narrative."),
      iconography=("Many arms, mounted on a lion. She carries weapons and raises a hand of blessing. "
                   "In temple iconography she is among the most martial of the nine."),
      symbolism=[("Sword / weapons", "Justice; the willingness to act."),
                 ("Lion mount", "Righteous anger, disciplined."),
                 ("Lotus in one hand", "The purpose of the fight is peace."),
                 ("Born of a sage's tapasya", "That devotion can invite the divine to appear.")],
      colour="Red (varies by region)",
      colourNote="Colour assignments differ between regional calendars.",
      flower="Red hibiscus (commonly offered)",
      bhog="Honey (commonly offered)",
      qualities=["Justice", "Resolve", "Righteous anger", "Victory"],
      chakra="Ajna (third eye) — in traditions that map the nine forms onto the chakras",
      planet="Jupiter (in traditions that assign one)",
      scriptureRef="Devi Kavacham, verse 4 (name list). See also Durga Saptashati ch. 2–3.",
      kavachamVerse="4",
      familyStory=("A wise old man called Katyayana prayed and prayed that the Goddess would be born "
                   "in his house. She said yes. She came as a daughter, and she grew up to fight a "
                   "buffalo demon who thought he could not be beaten. On the sixth day we remember "
                   "that the world is changed by people who decide that something wrong will not "
                   "stay wrong."),
      routine=[("Minute 1", "Name the form: Katyayani — daughter of the sage Katyayana."),
               ("Minute 2", "Recite the dhyana shloka once."),
               ("Minute 3", "Name one unfair thing you have seen. Do not fix it yet; just see it."),
               ("Minute 4", "Say the mantra nine times."),
               ("Minute 5", "Sit quietly. End with 'Jai Mata Di'.")]),

 dict(day=7, slug="kalaratri", deva="कालरात्रि", hindi="माँ कालरात्रि",
      iast="Kālarātri", meaning="The dark night; she who ends time's terror",
      key="कालरात्री",
      origin=("In the battle against the asuras the Goddess became dark and terrible, and in that "
              "form she destroyed what could not be reached by gentleness. Kalaratri is the darkest "
              "of the nine and, paradoxically, the one whose devotees are said to fear nothing."),
      iconography=("Dark-complexioned, one braid of hair, riding a donkey. She has a lolling tongue, "
                   "a garland of lightning, and iron ornaments. Her right hands bless and dispel "
                   "fear even while her left hands wield."),
      symbolism=[("Darkness", "Not evil but the unknown; the night that hides and also shelters."),
                 ("Donkey mount", "The unglamorous vehicle; power without display."),
                 ("Blessing right hands", "The terror is not the point; protection is."),
                 ("Single braid", "Renunciation of adornment.")],
      colour="Blue / black (varies by region)",
      colourNote=("Kalaratri is the form whose colour and ritual treatment vary most between "
                  "traditions. Some families avoid red offerings on this day; others do not. Follow "
                  "your own family practice."),
      flower="Blue or violet flowers; some traditions offer night-blooming flowers",
      bhog="Jaggery (gur) — commonly offered, with practice varying by family",
      qualities=["Fearlessness", "Facing the dark", "Transformation", "Dissolution of ego"],
      chakra="Sahasrara (crown) — in traditions that map the nine forms onto the chakras",
      planet="Saturn (in traditions that assign one)",
      scriptureRef="Devi Kavacham, verse 4 (name list). Cf. Saptashati ch. 7 (Chamunda).",
      kavachamVerse="4",
      familyStory=("There is a form of the Goddess who is dark, and many people are frightened of "
                   "her. But look closely at her hands: two of them are always open, giving and "
                   "protecting. On the seventh day we remember that the dark is not the enemy. The "
                   "enemy is refusing to look."),
      routine=[("Minute 1", "Name the form: Kalaratri — the dark night who protects."),
               ("Minute 2", "Recite the dhyana shloka once."),
               ("Minute 3", "Sit in the dark for a moment, or close your eyes. Breathe."),
               ("Minute 4", "Say the mantra nine times."),
               ("Minute 5", "Say 'Jai Mata Di' and open your eyes.")]),

 dict(day=8, slug="mahagauri", deva="महागौरी", hindi="माँ महागौरी",
      iast="Mahāgaurī", meaning="The exceedingly fair one",
      key="महागौरी",
      origin=("Parvati's tapasya left her covered in dust and ash. Shiva cleansed her in the Ganga, "
              "and she became radiant white. Mahagauri is that restoration — the form that appears "
              "after the work is done and the grime is washed away."),
      iconography=("Four arms, riding a bull. She holds a trident and a damaru; her other hands "
                   "bless and protect. She is depicted in white, calm and luminous."),
      symbolism=[("White", "Purity recovered, not purity never lost."),
                 ("Damaru drum", "Rhythm; the heartbeat of practice."),
                 ("Bull mount", "Calm strength, domesticated without being tamed."),
                 ("Trident", "Balance of the three gunas, still held.")],
      colour="Pink (varies by region)",
      colourNote="Colour assignments differ between regional calendars.",
      flower="White and pink flowers; jasmine (commonly offered)",
      bhog="Coconut (commonly offered)",
      qualities=["Purity", "Calm", "Renewal", "Compassion"],
      chakra="Varies by tradition",
      planet="Varies by tradition",
      scriptureRef="Devi Kavacham, verse 4–5 (name list).",
      kavachamVerse="4",
      familyStory=("After years of hard work in the forest, Parvati was covered in dust. Shiva bathed "
                   "her in the river and she shone white and bright again. On the eighth day we "
                   "remember that you can always be cleaned up. Nothing is too dirty to wash."),
      routine=[("Minute 1", "Name the form: Mahagauri — the radiant one."),
               ("Minute 2", "Recite the dhyana shloka once."),
               ("Minute 3", "Wash your hands slowly. Let it be a small ritual."),
               ("Minute 4", "Say the mantra nine times."),
               ("Minute 5", "Sit quietly. End with 'Jai Mata Di'.")]),

 dict(day=9, slug="siddhidatri", deva="सिद्धिदात्री", hindi="माँ सिद्धिदात्री",
      iast="Siddhidātrī", meaning="Giver of accomplishments",
      key="सिद्धिदात्री",
      origin=("The last of the nine is the one who gives the fruit of the practice. Siddha, gandharva, "
              "yaksha, asura and deva alike are said to serve her. Tradition says that Shiva himself "
              "attained the form of Ardhanarishvara through her grace."),
      iconography=("Four arms, seated on a lotus (in some traditions riding a lion). She holds a "
                   "lotus, a mace, a conch and a discus."),
      symbolism=[("Lotus", "Attainment that remains unstained."),
                 ("Conch", "The sounded truth; announcement."),
                 ("Discus and mace", "That accomplishment still requires discipline."),
                 ("Seated calm", "Arrival is not frantic.")],
      colour="Sky blue / purple (varies by region)",
      colourNote="Colour assignments differ between regional calendars.",
      flower="Blue and white flowers (commonly offered)",
      bhog="Sesame seeds (til) and jaggery (commonly offered)",
      qualities=["Fulfilment", "Wisdom", "Grace", "Completion"],
      chakra="Varies by tradition",
      planet="Varies by tradition",
      scriptureRef="Devi Kavacham, verse 5 (name list). Cf. Saptashati ch. 12 (the Goddess's boons).",
      kavachamVerse="5",
      familyStory=("On the ninth day the Goddess gives what the practice was for. Not magic — "
                   "ripeness. Like fruit that has had exactly enough sun. On the last day of "
                   "Navratri we do not ask for more; we say thank you for what has already grown."),
      routine=[("Minute 1", "Name the form: Siddhidatri — giver of the fruit."),
               ("Minute 2", "Recite the dhyana shloka once."),
               ("Minute 3", "List three things that have ripened in your life this year."),
               ("Minute 4", "Say the mantra nine times."),
               ("Minute 5", "Sit in gratitude. End with 'Jai Mata Di'.")]),
]

# The nine names as given in the Devi Kavacham (verified from our own import).
kav = json.load(open("src/content/scripture/angas/devi-kavacham.json", encoding="utf-8"))
name_verses = {v["n"]: v["devanagari"] for v in kav["verses"] if v["n"] in (3, 4, 5)}

docs = []
missing = []
for f in FORMS:
    dh = blocks.get(f["key"])
    if not dh:
        missing.append(f["key"])
    docs.append({
        "id": f"navadurga-{f['slug']}",
        "slug": f["slug"],
        "day": f["day"],
        "nameDevanagari": f["deva"],
        "nameHindi": f["hindi"],
        "nameTransliterated": f["iast"],
        "meaning": f["meaning"],
        "originStory": f["origin"],
        "iconography": f["iconography"],
        "symbolism": [{"attribute": a, "meaning": m} for a, m in f["symbolism"]],
        "dhyanaVerse": {
            "devanagari": dh,
            "status": "imported" if dh else "awaiting-verification",
            "source": "Navadurga Stotram (traditional), as printed in Parayan Grantham",
            "sourceFile": "scripts/sources/navadurga-stotram-sangrah.md",
            "note": ("Transcribed from the cited compilation, not from a critical edition. "
                     "Recitation practice and wording differ between lineages."),
        },
        "kavachamNameVerse": {
            "verse": int(f["kavachamVerse"]),
            "devanagari": name_verses.get(int(f["kavachamVerse"])),
            "source": "Devi Kavacham (Durga Saptashati auxiliary recitation), verse " + f["kavachamVerse"],
        },
        "navarnaMantra": {
            "devanagari": "ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे",
            "transliteration": "oṃ aiṃ hrīṃ klīṃ cāmuṇḍāyai vicce",
            "meaning": "The nine-syllable (Navarna) mantra of Chandika, used across the Shakta "
                       "traditions as the seed of the Saptashati recitation.",
            "note": "Widely attested across traditions; bīja syllables are not translated word by "
                    "word because they are not lexical words.",
        },
        "colour": f["colour"],
        "colourNote": f["colourNote"],
        "offering": {"flower": f["flower"], "bhog": f["bhog"],
                     "note": "Offerings vary by region, family and sampradaya. These are commonly "
                             "reported, not prescribed."},
        "qualities": f["qualities"],
        "chakra": f["chakra"],
        "planet": f["planet"],
        "scriptureRef": f["scriptureRef"],
        "familyStory": f["familyStory"],
        "fiveMinuteRoutine": [{"step": s, "text": t} for s, t in f["routine"]],
        "regionalVariationNote": (
            "Colours, offerings, the vehicle shown, the number of arms and the ritual sequence all "
            "vary between regions and lineages. This profile records the most widely attested "
            "version and flags variation rather than flattening it."),
        "sampleContent": True,
    })

if missing:
    print("WARNING: dhyana verse not parsed for:", missing)

out = {
    "collectionId": "navadurga",
    "title": "Navadurga — The Nine Forms",
    "intro": ("Nine forms of the Goddess, worshipped across the nine days of Navratri. The nine names "
              "come from the Devi Kavacham, verses 3–5, which is imported and verified in this app's "
              "scripture library. The dhyana verses come from the traditional Navadurga Stotram as "
              "printed in Parayan Grantham. Colours, offerings and iconographic detail vary between "
              "regional traditions and are flagged as such rather than presented as fixed."),
    "forms": docs,
}
open("src/content/navadurga.json", "w", encoding="utf-8").write(
    json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print("forms written:", len(docs), "| with dhyana:", sum(1 for d in docs if d["dhyanaVerse"]["devanagari"]))
