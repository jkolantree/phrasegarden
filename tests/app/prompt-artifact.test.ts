import { describe, expect, it } from "vitest";

import {
  activePromptText,
  promptDownloadBytes,
  type PromptDraft,
} from "../../src/app/prompt-artifact";

describe("prompt artifact boundaries", () => {
  const canonicalText = "# Portable prompt\n\n日本語\n";

  it("preserves the canonical LF text as the copy candidate", () => {
    const draft: PromptDraft = {
      canonicalText,
      editedText: canonicalText,
      modified: false,
    };

    expect(activePromptText(draft)).toBe(canonicalText);
    expect(activePromptText(draft)).not.toContain("\r");
  });

  it("encodes the active prompt as exact UTF-8 download bytes", () => {
    const draft: PromptDraft = {
      canonicalText,
      editedText: `${canonicalText}Local edit\n`,
      modified: false,
    };

    expect(new Uint8Array(promptDownloadBytes(draft))).toEqual(
      new TextEncoder().encode(canonicalText),
    );
  });

  it("uses an explicitly modified local copy without claiming canonicality", () => {
    const editedText = `${canonicalText}Local edit\n`;
    const draft: PromptDraft = {
      canonicalText,
      editedText,
      modified: true,
    };

    expect(activePromptText(draft)).toBe(editedText);
    expect(new Uint8Array(promptDownloadBytes(draft))).toEqual(
      new TextEncoder().encode(editedText),
    );
  });
});
