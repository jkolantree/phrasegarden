import { readFileSync } from "node:fs";

import AxeBuilder from "@axe-core/playwright";
import {
  expect,
  test,
  type Page,
  type Request,
} from "@playwright/test";

async function expectNoAxeViolations(page: Page, label: string): Promise<void> {
  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations,
    `${label}: ${result.violations
      .map((violation) => `${violation.id}(${violation.nodes.length})`)
      .join(", ")}`,
  ).toEqual([]);
}

function normalizeClipboardText(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

function requestAudit(page: Page): {
  readonly requests: Request[];
  readonly webSockets: string[];
} {
  const requests: Request[] = [];
  const webSockets: string[] = [];
  page.on("request", (request) => requests.push(request));
  page.on("websocket", (socket) => webSockets.push(socket.url()));
  return { requests, webSockets };
}

async function openBuilder(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: "Adjust optional settings" })
    .click();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Adjust how the prompt should work",
    }),
  ).toBeFocused();
}

async function generate(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: /^(Create my prompt|Update prompt)$/ })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Your prompt is ready" }),
  ).toBeFocused();
}

test("direct creation and the unchanged optional-settings path compile identical bytes", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create my prompt" }).click();
  const direct = {
    prompt: await page.getByTestId("canonical-prompt").textContent(),
    summary: await page.getByTestId("behavior-summary").textContent(),
    support: await page.getByTestId("support-status").textContent(),
    notices: await page.getByTestId("limitations").textContent(),
    provenance: await page.locator(".provenance").textContent(),
  };

  await page.getByRole("button", { name: "Start another prompt" }).click();
  await openBuilder(page);
  const advanced = page.locator(
    "main.builder-page details.advanced-settings",
  );
  await expect(advanced).not.toHaveAttribute("open", "");
  await advanced.locator("summary").click();
  await expect(advanced).toHaveAttribute("open", "");
  await advanced.locator("summary").click();
  await expect(advanced).not.toHaveAttribute("open", "");
  await generate(page);

  expect({
    prompt: await page.getByTestId("canonical-prompt").textContent(),
    summary: await page.getByTestId("behavior-summary").textContent(),
    support: await page.getByTestId("support-status").textContent(),
    notices: await page.getByTestId("limitations").textContent(),
    provenance: await page.locator(".provenance").textContent(),
  }).toEqual(direct);
  await expect(page.getByTestId("prompt-handoff")).toContainText(
    "Paste the prompt first.",
  );
  await expect(page.getByTestId("destination-privacy")).toContainText(
    "the other tool's privacy policy applies",
  );
  await expect(page.getByTestId("destination-privacy")).toContainText(
    "the text you enter there",
  );
});

test("one Advanced settings disclosure exposes the exact modality field map", async ({
  page,
}) => {
  await page.goto("/");
  await openBuilder(page);

  const advanced = page.locator(
    "main.builder-page details.advanced-settings",
  );
  const advancedSummary = advanced.locator("summary");
  await expect(
    page.locator("main.builder-page details.safeguards"),
  ).toHaveCount(1);
  await expect(advancedSummary).toHaveText("Advanced settings");
  await expect(advanced).not.toHaveAttribute("open", "");

  await expect(page.getByLabel("Relationship")).toBeVisible();
  await expect(page.getByLabel("Tone and formality")).toBeVisible();
  await expect(page.getByLabel("How much detail")).toBeVisible();
  await expect(page.getByLabel("Relative status")).toBeHidden();
  await expect(page.getByLabel("If wording is unclear")).toBeHidden();
  await expect(page.getByLabel("Titles and honorifics")).toBeHidden();
  await expect(
    page.getByLabel("Names with an unknown reading"),
  ).toBeHidden();
  await expect(page.getByLabel("What the tool receives from you")).toHaveCount(
    0,
  );

  await advancedSummary.click();
  await expect(page.getByLabel("Relative status")).toHaveValue("unspecified");
  await expect(page.getByLabel("If wording is unclear")).toHaveValue(
    "ask-if-blocking",
  );
  await expect(page.getByLabel("Titles and honorifics")).toHaveValue(
    "preserve-marked-title",
  );
  await expect(
    page.getByLabel("Names with an unknown reading"),
  ).toHaveValue("preserve-and-ask");
  await page.screenshot({
    path: "artifacts/screenshots/builder-advanced-written-desktop.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "Written advanced settings");
  await advancedSummary.click();

  await page
    .getByRole("radio", { name: /Live Voice Coach/ })
    .check();
  await expect(page.getByLabel("When to correct me")).toBeVisible();
  await expect(page.getByLabel("What to correct first")).toBeVisible();
  await expect(page.getByLabel("Pronunciation help")).toBeVisible();
  await expect(page.getByLabel("Explanation detail")).toBeVisible();
  await expect(page.getByLabel("Speaking pace")).toBeVisible();
  await expect(page.getByLabel("Relative status")).toBeHidden();
  await expect(page.getByLabel("What the tool receives from you")).toBeHidden();

  await advancedSummary.click();
  await expect(page.getByLabel("Relative status")).toBeVisible();
  await expect(page.getByLabel("If wording is unclear")).toBeVisible();
  await expect(page.getByLabel("Titles and honorifics")).toBeVisible();
  await expect(
    page.getByLabel("Names with an unknown reading"),
  ).toBeVisible();
  await expect(page.getByLabel("What the tool receives from you")).toHaveValue(
    "unknown",
  );
  await expect(page.getByLabel("How the tool responds")).toHaveValue("unknown");
  await expect(page.getByLabel("Can it detect interruptions?")).toHaveValue(
    "unknown",
  );
  await expect(page.getByLabel("Can it detect silence?")).toHaveValue(
    "unknown",
  );
  await expect(page.getByLabel("Can it change speaking speed?")).toHaveValue(
    "unknown",
  );
  await expectNoAxeViolations(page, "Voice advanced settings");
  await page.setViewportSize({ width: 320, height: 900 });
  const voiceDimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(voiceDimensions.scroll).toBeLessThanOrEqual(
    voiceDimensions.client + 1,
  );
  await page.screenshot({
    path: "artifacts/screenshots/builder-advanced-voice-mobile-320.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  await advancedSummary.click();

  await page.getByRole("radio", { name: /^Interpreter/ }).check();
  await expect(page.getByLabel("How much to interpret at once")).toBeVisible();
  await expect(page.getByLabel("If a turn is too unclear")).toBeVisible();
  await expect(page.getByLabel("Relative status")).toBeHidden();
  await expect(page.getByLabel("If wording is unclear")).toHaveCount(0);
  await expect(
    page.getByLabel("Names with an unknown reading"),
  ).toHaveCount(0);
  await expect(page.getByLabel("What the tool receives from you")).toHaveCount(
    0,
  );
  await expect(
    page.getByText("What your language tool can do", { exact: true }),
  ).toHaveCount(0);

  await advancedSummary.click();
  await expect(page.getByLabel("Relative status")).toBeVisible();
  await expect(page.getByLabel("Titles and honorifics")).toBeVisible();
  await expect(page.getByLabel("If wording is unclear")).toHaveCount(0);
  await expect(
    page.getByLabel("Names with an unknown reading"),
  ).toHaveCount(0);
  await expectNoAxeViolations(page, "Interpreter advanced settings");
});

test("internal navigation preserves an edited prompt and replacement requires confirmation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create my prompt" }).click();
  await page.getByRole("button", { name: "Edit this copy" }).click();
  const textarea = page.getByRole("textbox", { name: "Your edited copy" });
  const edited = `${await textarea.inputValue()}\nDO NOT DISCARD THIS EDIT`;
  await textarea.fill(edited);
  await expect(page.getByText("Edited on this device")).toBeVisible();

  await page.getByRole("button", { name: "Start another prompt" }).click();
  await expect(
    page.getByRole("button", { name: "Return to current prompt" }),
  ).toBeVisible();

  await page.goBack();
  await expect(textarea).toHaveValue(edited);
  await page.goForward();
  await page.getByRole("button", { name: "Create my prompt" }).click();
  await expect(page.getByTestId("replace-prompt-confirmation")).toContainText(
    "Replace your edited copy?",
  );

  await page.getByRole("button", { name: "Keep edited copy" }).click();
  await expect(textarea).toHaveValue(edited);

  await page.getByRole("button", { name: "Start another prompt" }).click();
  await page.getByRole("button", { name: "Create my prompt" }).click();
  await page
    .getByRole("button", { name: "Replace and create prompt" })
    .click();
  await expect(page.getByTestId("canonical-prompt")).not.toContainText(
    "DO NOT DISCARD THIS EDIT",
  );
});

test("refresh raises the browser's native leave warning for an edited prompt", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create my prompt" }).click();
  await page.getByRole("button", { name: "Edit this copy" }).click();
  const textarea = page.getByRole("textbox", { name: "Your edited copy" });
  await textarea.fill(`${await textarea.inputValue()}\nKEEP ON REFRESH`);

  const dialogPromise = page.waitForEvent("dialog");
  const reloadPromise = page
    .reload({ waitUntil: "domcontentloaded" })
    .catch(() => null);
  const dialog = await dialogPromise;
  expect(dialog.type()).toBe("beforeunload");
  await dialog.accept();
  await reloadPromise;

  await expect(
    page.getByRole("heading", { level: 1, name: /Make a better translation prompt/ }),
  ).toBeVisible();
  await expect(page.getByTestId("canonical-prompt")).toHaveCount(0);
});

test("copy and download failures remain visible with a manual fallback", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create my prompt" }).click();

  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
  });
  await page.getByTestId("copy-prompt").click();
  await expect(page.getByTestId("handoff-feedback")).toHaveText(
    "Copy was not available. Select the visible prompt text and copy it manually.",
  );

  await page.evaluate(() => {
    URL.createObjectURL = () => {
      throw new Error("synthetic download failure");
    };
  });
  await page.getByTestId("download-prompt").click();
  await expect(page.getByTestId("handoff-feedback")).toHaveText(
    "Download could not start. Select the visible prompt text and copy it manually.",
  );
});

test("a fully loaded session creates, copies, and downloads while offline", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4173",
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await context.setOffline(true);
  try {
    await page.getByRole("button", { name: "Create my prompt" }).click();
    const canonical = await page.getByTestId("canonical-prompt").textContent();

    await page.getByTestId("copy-prompt").click();
    expect(
      normalizeClipboardText(
        await page.evaluate(() => navigator.clipboard.readText()),
      ),
    ).toBe(canonical);

    const downloadEvent = page.waitForEvent("download");
    await page.getByTestId("download-prompt").click();
    const download = await downloadEvent;
    expect(readFileSync((await download.path())!, "utf8")).toBe(canonical);
  } finally {
    await context.setOffline(false);
  }
});

test("Interpreter stays one-way, exact, local, and accessible across Preview and Generic", async ({
  context,
  page,
}) => {
  const audit = requestAudit(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4173",
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const written = page.getByRole("radio", { name: /Written Translator/ });
  await written.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: /^Interpreter/ })).toBeChecked();
  await expect(page.getByText("Translate from", { exact: true })).toBeVisible();
  await expect(page.getByText("Translate into", { exact: true })).toBeVisible();
  await expect(page.getByText(/One direction at a time/)).toBeVisible();
  const homeActionBox = await page
    .getByRole("button", { name: "Create my prompt" })
    .boundingBox();
  expect(homeActionBox).not.toBeNull();
  expect(homeActionBox!.y + homeActionBox!.height).toBeLessThanOrEqual(
    page.viewportSize()!.height,
  );
  await page.screenshot({
    path: "artifacts/screenshots/home-interpreter-desktop.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "Interpreter home");

  await context.setOffline(true);
  let direct: string | null = null;
  try {
    await page.getByRole("button", { name: "Create my prompt" }).click();
    direct = await page.getByTestId("canonical-prompt").textContent();
    expect(direct).toContain("portable one-way Interpreter");
    expect(direct).toContain("For English→Japanese");
    expect(direct).not.toContain("For Japanese→English");
    expect(direct).toContain(
      "Do not claim to identify a speaker, hear unprovided tone, detect silence or interruption, or infer where a turn ends.",
    );
    await expect(page.getByTestId("prompt-handoff")).toContainText(
      "one complete home-language turn or message at a time",
    );
    await expect(page.getByTestId("prompt-handoff")).toContainText(
      "swap the languages and make another prompt for the reverse direction",
    );
    await expect(page.getByTestId("destination-privacy")).toContainText(
      "any participant's text, transcript, or audio while interpreting",
    );
    await expect(page.getByTestId("behavior-summary")).toContainText(
      "Translates the turn instead of answering it as advice",
    );
    await expect(page.getByTestId("behavior-summary")).toContainText(
      "does not guess who is speaking or where a turn ends",
    );

    await page.getByTestId("copy-prompt").click();
    expect(
      normalizeClipboardText(
        await page.evaluate(() => navigator.clipboard.readText()),
      ),
    ).toBe(direct);
    const downloadEvent = page.waitForEvent("download");
    await page.getByTestId("download-prompt").click();
    const download = await downloadEvent;
    expect(readFileSync((await download.path())!, "utf8")).toBe(direct);
  } finally {
    await context.setOffline(false);
  }
  await page.screenshot({
    path: "artifacts/screenshots/review-interpreter-desktop.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "Interpreter review");

  await page.getByRole("button", { name: "Start another prompt" }).click();
  await openBuilder(page);
  await expect(page.getByLabel("How much to interpret at once")).toHaveValue(
    "consecutive",
  );
  await expect(page.getByLabel("If a turn is too unclear")).toHaveValue(
    "ask-if-blocking",
  );
  await expect(page.getByLabel("How much detail")).toHaveCount(0);
  await expect(page.getByLabel("When to correct me")).toHaveCount(0);
  await expect(page.getByLabel("Pronunciation help")).toHaveCount(0);
  await expect(page.getByLabel("If wording is unclear")).toHaveCount(0);
  await expect(
    page.getByLabel("Names with an unknown reading"),
  ).toHaveCount(0);
  await expect(
    page.getByText("What your language tool can do", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByLabel("Relative status")).toBeHidden();
  await page.getByText("Advanced settings", { exact: true }).click();
  await expect(page.getByLabel("Relative status")).toBeVisible();
  await expect(page.getByLabel("Titles and honorifics")).toBeVisible();
  await page.screenshot({
    path: "artifacts/screenshots/builder-interpreter-desktop.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "Interpreter builder");

  await generate(page);
  expect(await page.getByTestId("canonical-prompt").textContent()).toBe(direct);

  await page
    .getByRole("button", { name: "Adjust optional settings" })
    .click();
  await page
    .getByLabel("How much to interpret at once")
    .selectOption("short-relay");
  await page
    .getByLabel("If a turn is too unclear")
    .selectOption("mark-uncertainty");
  await expect(page.getByTestId("behavior-summary")).toContainText(
    "Does not ask a question",
  );
  await generate(page);
  const marked = await page.getByTestId("canonical-prompt").textContent();
  expect(marked).toContain("Do not ask a clarification.");
  expect(marked).not.toContain("Ask at most one concise clarification");
  expect(marked).not.toContain("ask or note it according to");
  expect(marked).not.toContain("mark or ask according to");
  await expect(page.getByTestId("prompt-handoff")).toContainText(
    "one short, complete home-language chunk at a time",
  );
  await expect(page.getByTestId("prompt-handoff")).not.toContainText(
    "one complete home-language turn or message at a time",
  );

  await page
    .getByRole("button", { name: "Adjust optional settings" })
    .click();
  await page.getByRole("button", { name: "Swap languages" }).click();
  await generate(page);
  const reverse = await page.getByTestId("canonical-prompt").textContent();
  expect(reverse).toContain("For Japanese→English");
  expect(reverse).not.toContain("For English→Japanese");

  await page
    .getByRole("button", { name: "Adjust optional settings" })
    .click();
  await page.getByLabel("Target language").selectOption("id");
  await expect(page.getByTestId("support-status")).toContainText("Generic");
  await generate(page);
  const generic = await page.getByTestId("canonical-prompt").textContent();
  expect(generic).toContain("Support tier: Generic");
  expect(generic).not.toContain("## 6. Exact pair guidance");
  expect(generic).not.toContain("ordinary Japanese omission");

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await page.getByRole("radio", { name: /^Interpreter/ }).check();
  await expect(page.locator(".mobile-quick-start")).toContainText(
    "Interpreter",
  );
  const mobileQuickAction = page.getByRole("button", {
    name: "Create with these choices",
  });
  const mobileQuickActionBox = await mobileQuickAction.boundingBox();
  expect(mobileQuickActionBox).not.toBeNull();
  expect(
    mobileQuickActionBox!.y + mobileQuickActionBox!.height,
  ).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.screenshot({
    path: "artifacts/screenshots/home-interpreter-mobile-320.png",
    fullPage: true,
  });
  await openBuilder(page);
  await page.getByText("Advanced settings", { exact: true }).click();
  await expect(page.getByLabel("Relative status")).toBeVisible();
  let dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  await page.screenshot({
    path: "artifacts/screenshots/builder-interpreter-mobile-320.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "mobile Interpreter builder");
  await generate(page);
  dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  await page.screenshot({
    path: "artifacts/screenshots/review-interpreter-mobile-320.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "mobile Interpreter review");

  const remoteRequests = audit.requests.filter(
    (request) => new URL(request.url()).origin !== "http://127.0.0.1:4173",
  );
  const runtimeNetwork = audit.requests.filter((request) =>
    ["fetch", "xhr", "eventsource"].includes(request.resourceType()),
  );
  expect(remoteRequests.map((request) => request.url())).toEqual([]);
  expect(runtimeNetwork.map((request) => request.url())).toEqual([]);
  expect(audit.webSockets).toEqual([]);
});

test("primary Preview, swap, Voice, and Generic journeys stay local", async ({
  context,
  page,
}) => {
  const audit = requestAudit(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4173",
  });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Make a better translation prompt/ }),
  ).toBeVisible();
  await expect(
    page.getByText("Session only · not saved"),
  ).toBeVisible();
  await expect(page.getByTestId("support-status")).toContainText("Preview");
  await expect(
    page.getByText(/Settings, prompts, and edits disappear/),
  ).toBeVisible();
  const homeActionBox = await page
    .getByRole("button", { name: "Create my prompt" })
    .boundingBox();
  expect(homeActionBox).not.toBeNull();
  expect(homeActionBox!.y + homeActionBox!.height).toBeLessThanOrEqual(
    page.viewportSize()!.height,
  );
  await expect(
    page.getByText("Reviewed instructions compile deterministically."),
  ).toHaveCount(0);
  expect(
    await page
      .getByLabel("Home language")
      .locator("option[value='ja']")
      .evaluate((option) => (option as HTMLOptionElement).disabled),
  ).toBe(true);
  expect(
    await page
      .getByLabel("Target language")
      .locator("option[value='en']")
      .evaluate((option) => (option as HTMLOptionElement).disabled),
  ).toBe(true);
  await page.screenshot({
    path: "artifacts/screenshots/home-desktop.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "homepage");

  await openBuilder(page);
  await page.getByLabel("Relationship").selectOption("friends");
  await page.getByLabel("Tone and formality").selectOption("polite");
  await expect(page.getByTestId("behavior-summary")).toContainText(
    "Uses more polite language",
  );
  await page.screenshot({
    path: "artifacts/screenshots/builder-written-desktop.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "written builder");

  await generate(page);
  await expect(page.getByTestId("support-status")).toContainText("Preview");
  await expect(page.getByTestId("support-status")).toContainText(
    "Independent language review is not complete",
  );
  await expect(page.getByTestId("limitations")).toContainText(
    "Spelling alone is not enough to know how an unfamiliar Japanese name is pronounced.",
  );
  const copyActionBox = await page.getByTestId("copy-prompt").boundingBox();
  expect(copyActionBox).not.toBeNull();
  expect(copyActionBox!.y + copyActionBox!.height).toBeLessThanOrEqual(
    page.viewportSize()!.height,
  );
  await expect(
    page.getByText("This Preview guidance has not completed independent language review."),
  ).toHaveCount(0);
  const canonical = await page.getByTestId("canonical-prompt").textContent();
  expect(canonical).toContain("For English→Japanese");
  expect(canonical).toContain("support `preview`");
  await page.screenshot({
    path: "artifacts/screenshots/review-written-desktop.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "written review");

  await page.getByTestId("copy-prompt").click();
  await expect(page.getByTestId("handoff-feedback")).toHaveText(
    "Your prompt was copied.",
  );
  expect(
    normalizeClipboardText(
      await page.evaluate(() => navigator.clipboard.readText()),
    ),
  ).toBe(canonical);
  const canonicalDownload = page.waitForEvent("download");
  await page.getByTestId("download-prompt").click();
  await expect(page.getByTestId("handoff-feedback")).toHaveText(
    "Your text-file download started.",
  );
  const downloaded = await canonicalDownload;
  const downloadedPath = await downloaded.path();
  expect(downloadedPath).not.toBeNull();
  expect(readFileSync(downloadedPath!, "utf8")).toBe(canonical);

  await page.getByText("Technical details and versions").click();
  await expect(page.getByText("en-ja-preview@1.0.0-preview.1")).toBeVisible();

  await page
    .getByRole("button", { name: "Adjust optional settings" })
    .click();
  await page.getByRole("button", { name: "Swap languages" }).click();
  await generate(page);
  await expect(page.getByTestId("canonical-prompt")).toContainText(
    "For Japanese→English",
  );

  await page
    .getByRole("button", { name: "Adjust optional settings" })
    .click();
  await page.getByRole("button", { name: "Swap languages" }).click();
  await page
    .getByRole("radio", { name: /Live Voice Coach/ })
    .check();
  await expect(page.getByLabel("When to correct me")).toBeVisible();
  await expect(page.getByLabel("Pronunciation help")).toBeVisible();
  await expect(page.getByTestId("behavior-summary")).toContainText(
    "Balances meaning and tone with grammar and natural wording.",
  );
  await page.getByLabel("What to correct first").selectOption("form-detail");
  await expect(page.getByTestId("behavior-summary")).toContainText(
    "After protecting meaning and tone, focuses on grammar and wording details.",
  );
  await expect(
    page.getByLabel("What the tool receives from you"),
  ).toBeHidden();
  await page.getByText("Advanced settings", { exact: true }).click();
  await expect(
    page.getByLabel("What the tool receives from you"),
  ).toHaveValue("unknown");
  await generate(page);
  await expect(page.getByTestId("canonical-prompt")).toContainText(
    "Live Voice Coach",
  );
  await expect(page.getByTestId("canonical-prompt")).toContainText(
    "interrupt, wait, repeat, and slower",
  );
  await expect(page.getByTestId("limitations")).toContainText(
    "It is not known whether your language tool provides audio.",
  );
  await expect(page.getByTestId("destination-privacy")).toContainText(
    "any audio, transcripts, or text it receives during practice",
  );
  await expectNoAxeViolations(page, "Voice prompt review");

  await page
    .getByRole("button", { name: "Adjust optional settings" })
    .click();
  await page.getByRole("radio", { name: /Written Translator/ }).check();
  await page
    .getByLabel("Target language")
    .selectOption("id");
  await expect(page.getByTestId("support-status")).toContainText("Generic");
  await expect(page.getByTestId("support-status")).toContainText(
    "Uses PhraseGarden's general meaning-and-tone rules",
  );
  await generate(page);
  await expect(page.getByTestId("limitations")).toHaveCount(0);
  const generic = await page.getByTestId("canonical-prompt").textContent();
  expect(generic).toContain("Support tier: Generic");
  expect(generic).not.toContain("## 6. Exact pair guidance");
  expect(generic).not.toContain("ordinary Japanese omission");
  await page.getByText("Technical details and versions").click();
  await expect(
    page.locator(".provenance").getByText("none", { exact: true }),
  ).toBeVisible();

  const remoteRequests = audit.requests.filter(
    (request) => new URL(request.url()).origin !== "http://127.0.0.1:4173",
  );
  const runtimeNetwork = audit.requests.filter((request) =>
    ["fetch", "xhr", "eventsource"].includes(request.resourceType()),
  );
  expect(remoteRequests.map((request) => request.url())).toEqual([]);
  expect(runtimeNetwork.map((request) => request.url())).toEqual([]);
  expect(audit.webSockets).toEqual([]);
});

test("expanded languages stay understandable, exact, and accessible", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4173",
  });
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".hero-copy")).toContainText(
    "PhraseGarden makes instructions you copy into another AI chat or language tool",
  );
  await expect(page.locator(".hero-copy")).toContainText(
    "Put the words you want translated there—not here",
  );
  await expect(
    page.getByRole("radio", { name: /Written Translator/ }).locator(".."),
  ).toContainText("Make instructions for translating text");
  await expect(
    page.getByRole("radio", { name: /Live Voice Coach/ }).locator(".."),
  ).toContainText("Audio depends on the other tool");

  const expectedOptionValues = [
    "zh-Hant-TW",
    "en",
    "fr",
    "de",
    "he",
    "id",
    "it",
    "ja",
    "tlh",
    "pt",
    "es",
    "yi",
  ];
  for (const label of ["Home language", "Target language"] as const) {
    const select = page.getByLabel(label);
    expect(await select.locator("option").evaluateAll((options) =>
      options.map((option) => (option as HTMLOptionElement).value),
    )).toEqual(expectedOptionValues);
    const optionText = await select.locator("option").allTextContents();
    expect(optionText).toContain("French — ⁨français⁩");
    expect(optionText).toContain("German — ⁨Deutsch⁩");
    expect(optionText).toContain("Portuguese — ⁨português⁩");
    expect(optionText).toContain("Hebrew — ⁨עברית⁩");
    expect(optionText).toContain("Yiddish — ⁨ייִדיש⁩");
    expect(optionText.join(" ")).not.toMatch(/\((?:en|ja|fr|de|pt|es|it)\)/);
    await expect(select.locator("option[dir='auto']")).toHaveCount(12);
  }

  await expect(page.getByText("Translate from", { exact: true })).toBeVisible();
  await expect(page.getByText("Translate into", { exact: true })).toBeVisible();
  await page.getByLabel("Target language").selectOption("fr");
  await expect(page.locator(".sr-only[role='status']")).toHaveText(
    "Direction changed to English to French. Support level: Generic. General guidance only.",
  );
  await expect(page.getByTestId("support-status")).toContainText(
    "This exact language direction has no pair-specific guidance or independent language review",
  );
  await expect(page.locator(".target-rail bdi[lang='fr'][dir='ltr']")).toHaveText(
    "français",
  );
  const desktopAction = await page
    .getByRole("button", { name: "Create my prompt" })
    .boundingBox();
  expect(desktopAction).not.toBeNull();
  expect(desktopAction!.y + desktopAction!.height).toBeLessThanOrEqual(720);
  await page.screenshot({
    path: "artifacts/screenshots/home-generic-desktop.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "Generic language homepage");

  await page.setViewportSize({ width: 320, height: 900 });
  const homeOverflow = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(homeOverflow.scroll).toBeLessThanOrEqual(homeOverflow.client + 1);
  await page.screenshot({
    path: "artifacts/screenshots/home-generic-mobile-320.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByRole("button", { name: "Create my prompt" }).click();
  await expect(page.getByTestId("review-direction")).toContainText(
    "English",
  );
  await expect(page.getByTestId("review-direction")).toContainText(
    "French (français)",
  );
  await expect(page.getByTestId("review-direction")).toContainText(
    "Written Translator",
  );
  const genericPrompt = await page.getByTestId("canonical-prompt").textContent();
  expect(genericPrompt).toContain("Support tier: Generic");
  expect(genericPrompt).not.toContain("## 6. Exact pair guidance");
  expect(genericPrompt).not.toContain("ordinary Japanese omission");
  await page.getByTestId("copy-prompt").click();
  expect(normalizeClipboardText(await page.evaluate(() => navigator.clipboard.readText())))
    .toBe(genericPrompt);
  const frenchDownload = page.waitForEvent("download");
  await page.getByTestId("download-prompt").click();
  expect(readFileSync((await (await frenchDownload).path())!, "utf8")).toBe(
    genericPrompt,
  );
  await page.screenshot({
    path: "artifacts/screenshots/review-generic-desktop.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "Generic language desktop review");
  await page.setViewportSize({ width: 320, height: 900 });
  const reviewOverflow = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(reviewOverflow.scroll).toBeLessThanOrEqual(reviewOverflow.client + 1);
  await page.screenshot({
    path: "artifacts/screenshots/review-generic-mobile-320.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "Generic language review");

  await page.getByRole("button", { name: "Start another prompt" }).click();
  await page.getByLabel("Home language").selectOption("de");
  await page.getByLabel("Target language").selectOption("it");
  await expect(page.locator(".sr-only[role='status']")).toHaveText(
    "Direction changed to German to Italian. Support level: Generic. General guidance only.",
  );
  await page.getByRole("button", { name: "Swap languages" }).click();
  await expect(page.locator(".sr-only[role='status']")).toHaveText(
    "Direction changed to Italian to German. Support level: Generic. General guidance only.",
  );
  await page.getByRole("button", { name: "Create my prompt" }).click();
  await expect(
    page.getByTestId("review-direction").locator("span[lang='en'][dir='ltr']").first(),
  ).toHaveText("Italian");
  await expect(
    page.getByTestId("review-direction").locator("bdi[lang='de'][dir='ltr']"),
  ).toHaveText("Deutsch");

  await page.getByRole("button", { name: "Start another prompt" }).click();
  await page.getByLabel("Home language").selectOption("en");
  await page.getByLabel("Target language").selectOption("pt");
  await page.getByRole("button", { name: "Create my prompt" }).click();
  const portuguesePrompt = await page.getByTestId("canonical-prompt").textContent();
  expect(portuguesePrompt).toContain("pt@1.0.0");
  expect(portuguesePrompt).not.toMatch(/Brazil|Portugal|pt-BR|pt-PT/i);

  await page.getByRole("button", { name: "Start another prompt" }).click();
  await page.getByLabel("Target language").selectOption("es");
  await expect(page.locator(".target-rail bdi[lang='es'][dir='ltr']")).toHaveText(
    "español",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("radio", { name: /Live Voice Coach/ }).check();
  await expect(page.getByText("Explain in", { exact: true })).toBeVisible();
  await expect(page.getByText("Practice in", { exact: true })).toBeVisible();
});

test("edited copy is explicit, IME-safe, downloadable, and regenerates only after confirmation", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4173",
  });
  await page.goto("/");
  await openBuilder(page);
  await generate(page);

  await page.getByRole("button", { name: "Edit this copy" }).click();
  const textarea = page.getByRole("textbox", {
    name: "Your edited copy",
  });
  await expect(textarea).toBeVisible();
  await expect(page.getByText("Edited on this device")).toHaveCount(0);

  await textarea.evaluate((element) => {
    const input = element as HTMLTextAreaElement;
    input.dispatchEvent(
      new CompositionEvent("compositionstart", {
        bubbles: true,
        data: "日本語",
      }),
    );
    input.value += "\nLocal IME note: 日本語";
    input.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: "日本語",
        inputType: "insertCompositionText",
        isComposing: true,
      }),
    );
  });
  await expect(page.getByText("Edited on this device")).toHaveCount(0);
  await textarea.evaluate((element) => {
    const input = element as HTMLTextAreaElement;
    input.dispatchEvent(
      new CompositionEvent("compositionend", {
        bubbles: true,
        data: "日本語",
      }),
    );
    input.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: "日本語",
        inputType: "insertText",
        isComposing: false,
      }),
    );
  });
  await expect(page.getByText("Edited on this device")).toBeVisible();
  await expect(
    page.getByText(
      "Edited on this device · this copy no longer matches the generated original",
    ),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Modified locally · not byte-identical to compiler output",
    ),
  ).toHaveCount(0);
  const edited = await textarea.inputValue();
  expect(edited).toContain("Local IME note: 日本語");

  await page.getByTestId("copy-prompt").click();
  await expect(page.getByTestId("handoff-feedback")).toHaveText(
    "Your edited prompt was copied.",
  );
  expect(
    normalizeClipboardText(
      await page.evaluate(() => navigator.clipboard.readText()),
    ),
  ).toBe(edited);
  const downloadEvent = page.waitForEvent("download");
  await page.getByTestId("download-prompt").click();
  await expect(page.getByTestId("handoff-feedback")).toHaveText(
    "Your edited text-file download started.",
  );
  const download = await downloadEvent;
  const path = await download.path();
  expect(readFileSync(path!, "utf8")).toBe(edited);

  await page
    .getByRole("button", { name: "Restore generated original" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Discard your edits?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep my edits" }).click();
  await expect(textarea).toHaveValue(edited);

  await page
    .getByRole("button", { name: "Restore generated original" })
    .click();
  await page
    .getByRole("button", { name: "Discard edits and restore" })
    .click();
  await expect(page.getByTestId("canonical-prompt")).toBeVisible();
  await expect(page.getByText("Edited on this device")).toHaveCount(0);
  await expectNoAxeViolations(page, "regenerated canonical review");
});

test("keyboard path, focus order, narrow reflow, bidi labels, and reduced motion remain usable", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4173",
  });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await page.screenshot({
    path: "artifacts/screenshots/home-mobile-320.png",
    fullPage: true,
  });
  const mobileQuickAction = page.getByRole("button", {
    name: "Create with these choices",
  });
  const mobileQuickActionBox = await mobileQuickAction.boundingBox();
  expect(mobileQuickActionBox).not.toBeNull();
  expect(
    mobileQuickActionBox!.y + mobileQuickActionBox!.height,
  ).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { level: 1, name: /Make a better translation prompt/ }),
  ).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(mobileQuickAction).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Home language")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Swap languages" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Target language")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("radio", { name: /Written Translator/ }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Create my prompt" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Adjust optional settings" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Adjust how the prompt should work",
    }),
  ).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Home language")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Swap languages" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Target language")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("radio", { name: /Written Translator/ }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Relationship")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Tone and formality")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("How much detail")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByText("Advanced settings", { exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Relative status")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("If wording is unclear")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Titles and honorifics")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByLabel("Names with an unknown reading"),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Back to languages and tool" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Create my prompt" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { level: 1, name: "Your prompt is ready" }),
  ).toBeFocused();

  const overflow = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1);
  await page.screenshot({
    path: "artifacts/screenshots/review-mobile-320.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "mobile review");

  const keyboardCanonical = await page
    .getByTestId("canonical-prompt")
    .textContent();
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("copy-prompt")).toBeFocused();
  await page.keyboard.press("Enter");
  expect(
    normalizeClipboardText(
      await page.evaluate(() => navigator.clipboard.readText()),
    ),
  ).toBe(keyboardCanonical);
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("download-prompt")).toBeFocused();
  const keyboardDownload = page.waitForEvent("download");
  await page.keyboard.press("Enter");
  const keyboardDownloaded = await keyboardDownload;
  expect(readFileSync((await keyboardDownloaded.path())!, "utf8")).toBe(
    keyboardCanonical,
  );
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("canonical-prompt")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Edit this copy" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("textbox", { name: "Your edited copy" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Start another prompt" }).click();
  await page.getByLabel("Home language").selectOption("he");
  const rtlLabel = page.locator(".home-rail bdi[lang='he'][dir='rtl']");
  await expect(rtlLabel).toContainText("עברית");
  const labelBox = await rtlLabel.boundingBox();
  expect(labelBox).not.toBeNull();
  expect(labelBox!.x + labelBox!.width).toBeLessThanOrEqual(320);

  await page.emulateMedia({ reducedMotion: "reduce" });
  const transitionDuration = await page
    .getByRole("button", { name: "Create my prompt" })
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(transitionDuration).not.toContain("0.14s");
});

test("200% and 400% equivalent layout widths do not create page overflow", async ({
  page,
}) => {
  for (const [width, label] of [
    [640, "200-percent-equivalent"],
    [320, "400-percent-equivalent"],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.getByLabel("Home language").selectOption("zh-Hant-TW");
    await openBuilder(page);
    await page.getByText("Advanced settings", { exact: true }).click();
    const dimensions = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(
      dimensions.scroll,
      `${label}: ${dimensions.scroll} > ${dimensions.client}`,
    ).toBeLessThanOrEqual(dimensions.client + 1);
  }
});
