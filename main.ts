// The Funniest Office Joke, Judged Head to Head — make.fun entry (program/v1).
// The entry is exactly one joke, one sentence, 99 characters:
// "The all-hands was called to announce there would be fewer meetings,
// and it ran twenty minutes over."
// Why this one: the cure is the disease. A meeting called to announce
// fewer meetings runs over — the announcement itself becomes the offence.
// The setup is a universal office moment (the all-hands) and the payoff is
// a concrete, visible detail (twenty minutes over) printed in the text, so
// the turn lands on first read with no inference step. One sentence, ASCII
// only, no trailing newline.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const JOKE =
  "The all-hands was called to announce there would be fewer meetings, and it ran twenty minutes over.";

// Gate (kit RULES.txt): /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only whitespace. This joke is 99 characters, one line.
const size = [...JOKE].length;
if (size < 1 || size > 200) {
  throw new Error(`entry is ${size} characters; the gate needs 1 to 200`);
}
if (JOKE.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
if (JOKE !== JOKE.trim() || JOKE.includes("\n") || JOKE.includes("\r")) {
  throw new Error("entry must be a single line with no surrounding whitespace");
}
// ASCII only, per the header: the gate reads bytes, and a non-ASCII
// character would change the byte count the grader sees.
if (/[^\x00-\x7F]/.test(JOKE)) {
  throw new Error("entry must be ASCII only");
}
// Exactly one sentence, punchline last: one terminator, and it ends the joke.
const stops = [...JOKE].filter((c) => c === "." || c === "!" || c === "?");
if (stops.length !== 1 || !JOKE.endsWith(stops[0])) {
  throw new Error("entry must be exactly one sentence, punchline last");
}

// The harness points MAKEFUN_OUTPUT_DIR at the writable /output; write
// there when it is set, and to /output directly as well, so the gate finds
// the file either way. No trailing newline: the file is the joke, byte for
// byte.
const dirs = [process.env.MAKEFUN_OUTPUT_DIR, "/output"].filter(
  (d): d is string => typeof d === "string" && d.length > 0,
);
const landed: string[] = [];
for (const dir of dirs) {
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "entry.txt"), JOKE, "utf8");
    landed.push(dir);
  } catch {
    // One target may be read-only in some sandboxes; the other still lands.
  }
}
if (landed.length === 0) {
  throw new Error("could not write entry.txt to any output directory");
}

// Read back what landed and prove it is the joke, byte for byte — a silent
// partial write must fail loudly here, never at the grader's gate.
const written = readFileSync(join(landed[0], "entry.txt"), "utf8");
if (written !== JOKE) {
  throw new Error("entry.txt does not contain exactly the chosen joke");
}

console.log(JOKE);
