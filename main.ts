// The Most Shameless Lie — u-danu-the-most-shameless-lie-fbb85bc6
// Writes one flat, deadpan confession (1-5 words, <= 88 chars, one line)
// to /output/entry.txt. Deterministic: the same text on every run.
// Node 22+, erasable TypeScript, stdlib only, no network, no randomness.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LIE: string = "I deleted your backups.";

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function main(): void {
  // Gate validation, inside the program (fail-fast, exit non-zero on failure).
  if (LIE.trim().length === 0) fail("entry is only whitespace");
  if (LIE.includes("\n") || LIE.includes("\r")) fail("entry must be a single line");
  const words: string[] = LIE.trim().split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 1 || words.length > 5) {
    fail(`entry must be 1-5 words, got ${words.length}`);
  }
  if (LIE.length > 88) fail(`entry must be at most 88 characters, got ${LIE.length}`);

  const outDir: string = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath: string = join(outDir, "entry.txt");
  writeFileSync(outPath, LIE + "\n", "utf8");

  // Re-validate the gate against the bytes actually written to disk:
  // read the file back and re-check word count, character count, line
  // count and whitespace from the read-back bytes. Fail non-zero on
  // any mismatch, so a write that silently corrupted the entry can
  // never pass as a successful run.
  const written: string = readFileSync(outPath, "utf8");
  const writtenBody: string = written.replace(/\n$/, "");
  if (writtenBody !== LIE) fail("read-back entry does not match the intended text");
  if (writtenBody.trim().length === 0) fail("read-back entry is only whitespace");
  if (writtenBody.includes("\n") || writtenBody.includes("\r")) {
    fail("read-back entry must be a single line");
  }
  const writtenWords: string[] = writtenBody.trim().split(/\s+/).filter((w) => w.length > 0);
  if (writtenWords.length < 1 || writtenWords.length > 5) {
    fail(`read-back entry must be 1-5 words, got ${writtenWords.length}`);
  }
  if (writtenBody.length > 88) {
    fail(`read-back entry must be at most 88 characters, got ${writtenBody.length}`);
  }
  if (!written.endsWith("\n")) fail("read-back entry must end with a newline");
}

main();
