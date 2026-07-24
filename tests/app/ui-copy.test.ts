import { describe, expect, it } from "vitest";

import {
  AMBIGUITY_STRATEGIES,
  ASSISTANT_OUTPUT_CAPABILITIES,
  HIERARCHIES,
  PRONUNCIATION_MODES,
  REGISTER_LEVELS,
  RELATIONSHIPS,
  SIGNAL_CAPABILITIES,
  TEACHING_DEPTHS,
  TITLE_HANDLING_STRATEGIES,
  UNKNOWN_NAME_STRATEGIES,
  USER_EVIDENCE_CAPABILITIES,
  VOICE_CORRECTION_FOCI,
  VOICE_CORRECTION_TIMINGS,
  VOICE_PACES,
  WRITTEN_OUTPUT_DETAILS,
} from "../../src/domain";
import { OPTION_LABELS_EN } from "../../src/locales";

const EXPOSED_OPTION_VALUES = [
  ...RELATIONSHIPS,
  ...HIERARCHIES,
  "preserve",
  ...REGISTER_LEVELS,
  ...WRITTEN_OUTPUT_DETAILS,
  ...VOICE_CORRECTION_TIMINGS,
  ...VOICE_CORRECTION_FOCI,
  ...PRONUNCIATION_MODES,
  ...TEACHING_DEPTHS,
  ...VOICE_PACES,
  ...AMBIGUITY_STRATEGIES,
  ...TITLE_HANDLING_STRATEGIES,
  ...UNKNOWN_NAME_STRATEGIES,
  ...USER_EVIDENCE_CAPABILITIES,
  ...ASSISTANT_OUTPUT_CAPABILITIES,
  ...SIGNAL_CAPABILITIES,
] as const;

describe("plain-language UI copy", () => {
  it("gives every exposed configuration value an intentional English label", () => {
    const missing = [...new Set(EXPOSED_OPTION_VALUES)].filter((value) => {
      const label = OPTION_LABELS_EN[value];
      return label === undefined || label.trim().length === 0;
    });
    expect(missing).toEqual([]);
  });
});
