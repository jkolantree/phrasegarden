import type { CompileResult } from "../domain";

export interface PromptDraft {
  readonly canonicalText: string;
  readonly editedText: string;
  readonly modified: boolean;
}

export function createPromptDraft(result: CompileResult): PromptDraft {
  return {
    canonicalText: result.canonicalPrompt,
    editedText: result.canonicalPrompt,
    modified: false,
  };
}

export function activePromptText(draft: PromptDraft): string {
  return draft.modified ? draft.editedText : draft.canonicalText;
}

export function promptDownloadBytes(draft: PromptDraft): ArrayBuffer {
  const encoded = new TextEncoder().encode(activePromptText(draft));
  const bytes = new Uint8Array(new ArrayBuffer(encoded.byteLength));
  bytes.set(encoded);
  return bytes.buffer;
}

export function promptDownloadName(result: CompileResult): string {
  const { homeProfile, targetProfile, recipe } = result.provenance;
  return [
    "phrasegarden",
    homeProfile.id,
    targetProfile.id,
    recipe.id,
    result.provenance.compilerVersion,
  ].join("-") + ".txt";
}
