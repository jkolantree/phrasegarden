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

async function browserLocationAndStorage(page: Page): Promise<{
  readonly search: string;
  readonly hash: string;
  readonly local: readonly (readonly [string, string | null])[];
  readonly session: readonly (readonly [string, string | null])[];
}> {
  return page.evaluate(() => {
    const entries = (storage: Storage) =>
      Array.from({ length: storage.length }, (_, index) => storage.key(index))
        .filter((key): key is string => key !== null)
        .sort()
        .map((key) => [key, storage.getItem(key)] as const);
    return {
      search: globalThis.location.search,
      hash: globalThis.location.hash,
      local: entries(globalThis.localStorage),
      session: entries(globalThis.sessionStorage),
    };
  });
}

async function expectLocalPresentationChange(
  page: Page,
  audit: ReturnType<typeof requestAudit>,
  change: () => Promise<void>,
): Promise<void> {
  const requestsBefore = audit.requests.length;
  const webSocketsBefore = audit.webSockets.length;
  const browserStateBefore = await browserLocationAndStorage(page);
  await change();
  expect(audit.requests).toHaveLength(requestsBefore);
  expect(audit.webSockets).toHaveLength(webSocketsBefore);
  expect(await browserLocationAndStorage(page)).toEqual(browserStateBefore);
}

async function expectNarrowLanguageEntry(
  page: Page,
  makeButtonName: string,
  label: string,
): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(
    dimensions.scroll,
    `${label}: ${dimensions.scroll} > ${dimensions.client}`,
  ).toBeLessThanOrEqual(dimensions.client + 1);

  const entryActions = page
    .getByTestId("language-entry")
    .getByRole("button");
  await expect(entryActions).toHaveCount(2);
  for (let index = 0; index < 2; index += 1) {
    const box = await entryActions.nth(index).boundingBox();
    expect(box, `${label}: language action ${index + 1}`).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  }

  const makeButton = page.getByRole("button", {
    name: makeButtonName,
    exact: true,
  });
  await expect(makeButton).toBeVisible();
  const makeButtonBox = await makeButton.boundingBox();
  expect(makeButtonBox, `${label}: primary action`).not.toBeNull();
  expect(makeButtonBox!.y + makeButtonBox!.height).toBeLessThanOrEqual(900);
}

async function expectReviewDirection(
  page: Page,
  home: string,
  target: string,
  tool: string,
): Promise<void> {
  const segments = page
    .getByTestId("review-direction")
    .locator(":scope > span");
  await expect(segments.nth(0)).toHaveText(home);
  await expect(segments.nth(3)).toHaveText(target);
  await expect(segments.nth(6)).toHaveText(tool);
}

async function openBuilder(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: "Adjust tone or context" })
    .first()
    .click();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Adjust tone and context",
    }),
  ).toBeFocused();
}

async function openHomeChoices(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: "Change languages or task" })
    .first()
    .click();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Choose languages and task",
    }),
  ).toBeFocused();
}

async function generate(page: Page): Promise<void> {
  await page
    .getByRole("button", {
      name: /^(Make my instructions|Update instructions)$/,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Your instructions are ready",
    }),
  ).toBeFocused();
}

test("language entry applies untouched presets, then preserves settings and prompt bytes", async ({
  context,
  page,
}) => {
  const audit = requestAudit(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4173",
  });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByTestId("canonical-prompt")).toHaveCount(0);
  await expect(page.getByTestId("interface-copy-review")).toHaveCount(0);
  await expect(page.locator(".home-start-card h2")).toContainText("English");
  await expect(page.locator(".home-start-card h2")).toContainText("Japanese");
  await expect(page.locator(".ready-tool")).toHaveText("Translate writing");
  await expectNarrowLanguageEntry(
    page,
    "Make my instructions",
    "English language entry",
  );
  await expectNoAxeViolations(page, "English language entry");

  await expectLocalPresentationChange(page, audit, async () => {
    await page
      .getByRole("button", {
        name: "Start in Japanese with Japanese to English written translation.",
      })
      .click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  });
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByTestId("canonical-prompt")).toHaveCount(0);
  await expect(page.locator(".home-start-card h2")).toContainText("日本語");
  await expect(page.locator(".home-start-card h2")).toContainText("英語");
  await expect(page.locator(".ready-tool")).toHaveText("文章を翻訳");
  await expect(page.getByTestId("interface-copy-review")).toContainText(
    "日本語表示について",
  );
  await expect(page.getByTestId("interface-copy-review")).toContainText(
    "資格を確認した日本語話者によるレビューがまだ完了していません",
  );
  await expect(page.getByTestId("interface-copy-review")).toContainText(
    "上の英語表示ボタンで英語に戻せます",
  );
  await expect(page.locator(".sr-only[role='status']")).toContainText(
    "日本語表示は試用版",
  );
  await expect(
    page.getByRole("button", {
      name: "日本語で始めます。日本語から英語への文章翻訳を選びます。",
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await expectNarrowLanguageEntry(page, "指示文を作る", "Japanese language entry");
  await expectNoAxeViolations(page, "Japanese language entry");

  await page.getByRole("button", { name: "言語や用途を変更" }).click();
  await expect(page.getByLabel("元の文章の言語")).toHaveValue("ja");
  await expect(page.getByLabel("翻訳先の言語")).toHaveValue("en");
  await expect(
    page.getByRole("radio", { name: /文章を翻訳/ }),
  ).toBeChecked();

  await expectLocalPresentationChange(page, audit, async () => {
    await page
      .getByRole("button", {
        name: "英語で始めます。英語から日本語への文章翻訳を選びます。",
      })
      .click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
  await expect(page.locator(".home-start-card h2")).toContainText("English");
  await expect(page.locator(".home-start-card h2")).toContainText("Japanese");
  await expect(page.locator(".ready-tool")).toHaveText("Translate writing");

  await page
    .getByRole("button", { name: "Change languages or task" })
    .click();
  await expect(page.getByLabel("Text is in")).toHaveValue("en");
  await expect(page.getByLabel("Translate to")).toHaveValue("ja");
  await expect(
    page.getByRole("radio", { name: /Translate writing/ }),
  ).toBeChecked();

  await page
    .getByRole("button", { name: "Adjust tone or context" })
    .click();
  await page.getByLabel("Relationship").selectOption("friends");
  await expect(page.getByTestId("language-entry")).toContainText(
    "Page language",
  );

  await expectLocalPresentationChange(page, audit, async () => {
    await page
      .getByRole("button", {
        name: "Show PhraseGarden in Japanese. Translation settings and instructions will not change.",
      })
      .click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  });
  await expect(page.locator(".builder-setup h2")).toContainText("英語");
  await expect(page.locator(".builder-setup h2")).toContainText("日本語");
  await expect(page.getByLabel("関係")).toHaveValue("friends");
  await expect(page.getByTestId("canonical-prompt")).toHaveCount(0);
  await expect(page.getByTestId("interface-copy-review")).toBeVisible();

  await page.getByRole("button", { name: "指示文を作る" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "指示文ができました" }),
  ).toBeFocused();
  const canonical = await page.getByTestId("canonical-prompt").textContent();
  expect(canonical).toContain("For English→Japanese");
  await expectReviewDirection(page, "英語", "日本語", "文章を翻訳");
  await expect(page.getByText("指示文 · 英語", { exact: true })).toBeVisible();
  await expect(page.getByTestId("canonical-prompt")).toHaveAttribute(
    "lang",
    "en",
  );
  await expect(page.getByTestId("canonical-prompt")).toHaveAttribute(
    "dir",
    "ltr",
  );
  await expect(page.locator(".support-badge")).toHaveAttribute("lang", "en");
  await expect(page.locator(".support-badge")).toHaveAttribute("dir", "ltr");
  await expect(page.getByTestId("interface-copy-review")).toBeVisible();
  await expect(page.getByTestId("support-status")).not.toContainText(
    "日本語表示について",
  );

  await page.getByRole("button", { name: "この指示文を編集" }).click();
  const japaneseEditor = page.getByRole("textbox", { name: "編集したコピー" });
  await expect(japaneseEditor).toHaveValue(canonical!);
  await expect(japaneseEditor).toHaveAttribute("lang", "en");
  await expect(japaneseEditor).toHaveAttribute("dir", "ltr");
  const edited = `${canonical!}User-added exact byte marker.\n`;
  await japaneseEditor.fill(edited);
  await expect(japaneseEditor).toHaveValue(edited);

  await expectLocalPresentationChange(page, audit, async () => {
    await page
      .getByRole("button", {
        name: "PhraseGardenを英語で表示します。翻訳設定と指示文は変わりません。",
      })
      .click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
  const englishLocaleAction = page.getByRole("button", {
    name: "Show PhraseGarden in English. Translation settings and instructions will not change.",
  });
  await expect(englishLocaleAction).toBeFocused();
  await expect(page.getByTestId("interface-copy-review")).toHaveCount(0);
  const englishEditor = page.getByRole("textbox", { name: "Your edited copy" });
  await expect(englishEditor).toHaveValue(edited);
  await expect(page.getByTestId("canonical-prompt")).toHaveCount(0);
  await expectReviewDirection(
    page,
    "English",
    "Japanese (日本語)",
    "Translate writing",
  );
  await expect(page.getByTestId("replace-prompt-confirmation")).toHaveCount(0);
  await page.getByTestId("copy-prompt").click();
  expect(
    normalizeClipboardText(
      await page.evaluate(() => navigator.clipboard.readText()),
    ),
  ).toBe(edited);
  const downloadEvent = page.waitForEvent("download");
  await page.getByTestId("download-prompt").click();
  const download = await downloadEvent;
  expect(readFileSync((await download.path())!, "utf8")).toBe(edited);

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Make my instructions" }).click();
  const freshGenerated = await page
    .getByTestId("canonical-prompt")
    .textContent();
  await expectLocalPresentationChange(page, audit, async () => {
    await page
      .getByRole("button", {
        name: "Show PhraseGarden in Japanese. Translation settings and instructions will not change.",
      })
      .click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  });
  await expect(page.getByTestId("canonical-prompt")).toHaveText(
    freshGenerated!,
  );
  await expect(page.getByTestId("interface-copy-review")).toBeVisible();
  await expectReviewDirection(page, "英語", "日本語", "文章を翻訳");
  await expect(page.getByTestId("replace-prompt-confirmation")).toHaveCount(0);
});

test("direct creation and the unchanged optional-settings path compile identical bytes", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 320, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    if (viewport.width === 320) {
      await openHomeChoices(page);
      await page.getByRole("button", { name: "Use current choices" }).click();
      await expect(
        page.getByRole("heading", {
          level: 2,
          name: /Ready to start: English to Japanese/,
        }),
      ).toBeFocused();
    }
    const fastPath = page.getByRole("button", {
      name: "Make my instructions",
    });
    await expect(fastPath).toHaveCount(1);
    await expect(fastPath).toBeVisible();
    const fastPathBox = await fastPath.boundingBox();
    expect(fastPathBox).not.toBeNull();
    expect(fastPathBox!.y + fastPathBox!.height).toBeLessThanOrEqual(
      viewport.height,
    );
  }

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page.getByRole("button", { name: "Make my instructions" }).click();
  const direct = {
    prompt: await page.getByTestId("canonical-prompt").textContent(),
    summary: await page.getByTestId("behavior-summary").textContent(),
    support: await page.getByTestId("support-status").textContent(),
    notices: await page.getByTestId("limitations").textContent(),
    provenance: await page.locator(".provenance").textContent(),
  };

  await page.getByRole("button", { name: "Start another set" }).first().click();
  await openBuilder(page);
  await expect(page.getByLabel("Relationship")).toBeVisible();
  await expect(page.getByLabel("Tone and formality")).toBeVisible();
  await expect(page.getByLabel("How much detail")).toBeVisible();
  await expect(page.getByLabel("Text is in")).toHaveCount(0);
  await expect(
    page.getByRole("radio", { name: /Translate writing/ }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Change languages or task" }).first(),
  ).toBeVisible();
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
    "Paste the instructions first.",
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

  await openHomeChoices(page);
  await page
    .getByRole("radio", { name: /Practice speaking/ })
    .check();
  await expect(page.locator("#home-language")).toHaveAccessibleName(
    /^Explain in\b/,
  );
  await expect(page.locator("#target-language")).toHaveAccessibleName(
    /^Practice in\b/,
  );
  await openBuilder(page);
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

  await openHomeChoices(page);
  await page
    .getByRole("radio", { name: /^Translate a conversation/ })
    .check();
  await expect(page.getByLabel("Turn is in")).toBeVisible();
  await expect(page.getByLabel("Translate to")).toBeVisible();
  await openBuilder(page);
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
  await page.getByRole("button", { name: "Make my instructions" }).click();
  await page
    .getByRole("button", { name: "Edit these instructions" })
    .click();
  const textarea = page.getByRole("textbox", { name: "Your edited copy" });
  const edited = `${await textarea.inputValue()}\nDO NOT DISCARD THIS EDIT`;
  await textarea.fill(edited);
  await expect(page.getByText("Edited on this device")).toBeVisible();

  await page.getByRole("button", { name: "Start another set" }).first().click();
  await expect(
    page.getByRole("button", { name: "Return to current instructions" }),
  ).toBeVisible();

  await page.goBack();
  await expect(textarea).toHaveValue(edited);
  await page.goForward();
  await page.getByRole("button", { name: "Make my instructions" }).click();
  await expect(page.getByTestId("replace-prompt-confirmation")).toContainText(
    "Replace your edited copy?",
  );

  await page.getByRole("button", { name: "Keep edited copy" }).click();
  await expect(textarea).toHaveValue(edited);

  await page.getByRole("button", { name: "Start another set" }).first().click();
  await page.getByRole("button", { name: "Make my instructions" }).click();
  await page
    .getByRole("button", { name: "Replace and make instructions" })
    .click();
  await expect(page.getByTestId("canonical-prompt")).not.toContainText(
    "DO NOT DISCARD THIS EDIT",
  );
});

test("refresh raises the browser's native leave warning for an edited prompt", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Make my instructions" }).click();
  await page
    .getByRole("button", { name: "Edit these instructions" })
    .click();
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
    page.getByRole("heading", {
      level: 1,
      name: /Keep your meaning when AI translates/,
    }),
  ).toBeVisible();
  await expect(page.getByTestId("canonical-prompt")).toHaveCount(0);
});

test("copy and download failures remain visible with a manual fallback", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Make my instructions" }).click();

  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
  });
  await page.getByTestId("copy-prompt").click();
  await expect(page.getByTestId("handoff-feedback")).toHaveText(
    "Copy was not available. Select the visible instruction text and copy it manually.",
  );

  await page.evaluate(() => {
    URL.createObjectURL = () => {
      throw new Error("synthetic download failure");
    };
  });
  await page.getByTestId("download-prompt").click();
  await expect(page.getByTestId("handoff-feedback")).toHaveText(
    "Download could not start. Select the visible instruction text and copy it manually.",
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
    await page.getByRole("button", { name: "Make my instructions" }).click();
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

  await openHomeChoices(page);
  const written = page.getByRole("radio", { name: /Translate writing/ });
  await written.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("radio", { name: /^Translate a conversation/ }),
  ).toBeChecked();
  await expect(page.getByText("Translate from", { exact: true })).toBeVisible();
  await expect(page.getByText("Translate into", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Turn is in")).toBeVisible();
  await expect(page.getByLabel("Translate to")).toBeVisible();
  await expect(page.getByText(/One direction at a time/)).toBeVisible();
  await page.screenshot({
    path: "artifacts/screenshots/home-interpreter-desktop.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "Interpreter home");

  await context.setOffline(true);
  let direct: string | null = null;
  try {
    await page.getByRole("button", { name: "Make my instructions" }).click();
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
      "swap the languages and make another set of instructions for the reverse direction",
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

  await page.getByRole("button", { name: "Start another set" }).first().click();
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
    .getByRole("button", { name: "Adjust tone or context" })
    .first()
    .click();
  await page
    .getByLabel("How much to interpret at once")
    .selectOption("short-relay");
  await page
    .getByLabel("If a turn is too unclear")
    .selectOption("mark-uncertainty");
  await page
    .getByText("See exactly what PhraseGarden will protect", { exact: true })
    .click();
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
    .getByRole("button", { name: "Adjust tone or context" })
    .first()
    .click();
  await openHomeChoices(page);
  await page.getByRole("button", { name: "Swap languages" }).click();
  await generate(page);
  const reverse = await page.getByTestId("canonical-prompt").textContent();
  expect(reverse).toContain("For Japanese→English");
  expect(reverse).not.toContain("For English→Japanese");

  await page
    .getByRole("button", { name: "Adjust tone or context" })
    .first()
    .click();
  await openHomeChoices(page);
  await page.getByLabel("Translate to").selectOption("id");
  await expect(page.getByTestId("support-status")).toContainText("Generic");
  await generate(page);
  const generic = await page.getByTestId("canonical-prompt").textContent();
  expect(generic).toContain("Support tier: Generic");
  expect(generic).not.toContain("## 6. Exact pair guidance");
  expect(generic).not.toContain("ordinary Japanese omission");

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await openHomeChoices(page);
  await page
    .getByRole("radio", { name: /^Translate a conversation/ })
    .check();
  await expect(page.locator(".home-weave")).toContainText(
    "Translate a conversation",
  );
  await expect(
    page.getByRole("button", { name: "Make my instructions" }),
  ).toHaveCount(1);
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
    page.getByRole("heading", {
      level: 1,
      name: /Keep your meaning when AI translates/,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Session only · not saved"),
  ).toBeVisible();
  await expect(page.getByTestId("support-status")).toContainText("Preview");
  await expect(
    page.getByText(/Settings, instructions, and edits disappear/),
  ).toBeVisible();
  const homeActionBox = await page
    .getByRole("button", { name: "Make my instructions" })
    .boundingBox();
  expect(homeActionBox).not.toBeNull();
  expect(homeActionBox!.y + homeActionBox!.height).toBeLessThanOrEqual(
    page.viewportSize()!.height,
  );
  await expect(
    page.getByText("Reviewed instructions compile deterministically."),
  ).toHaveCount(0);
  await openHomeChoices(page);
  expect(
    await page
      .getByLabel("Text is in")
      .locator("option[value='ja']")
      .evaluate((option) => (option as HTMLOptionElement).disabled),
  ).toBe(true);
  expect(
    await page
      .getByLabel("Translate to")
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
  await page
    .getByText("See exactly what PhraseGarden will protect", { exact: true })
    .click();
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
    "External language review: incomplete.",
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
  const canonicalRegion = await page.getByTestId("canonical-prompt").evaluate(
    (element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      text: element.textContent,
    }),
  );
  expect(canonicalRegion.text).toBe(canonical);
  expect(canonicalRegion.scrollHeight).toBeGreaterThan(
    canonicalRegion.clientHeight,
  );
  await page.screenshot({
    path: "artifacts/screenshots/review-written-desktop.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "written review");

  await page.setViewportSize({ width: 320, height: 900 });
  await expect(page.getByText("Ready to use", { exact: true })).toBeVisible();
  await expect(page.getByText("Next step", { exact: true })).toBeVisible();
  const supportBox = await page.getByTestId("support-status").boundingBox();
  const limitationBox = await page.getByTestId("limitations").boundingBox();
  const mobileCopyBox = await page.getByTestId("copy-prompt").boundingBox();
  expect(supportBox).not.toBeNull();
  expect(limitationBox).not.toBeNull();
  expect(mobileCopyBox).not.toBeNull();
  expect(supportBox!.y + supportBox!.height).toBeLessThanOrEqual(
    mobileCopyBox!.y,
  );
  expect(limitationBox!.y + limitationBox!.height).toBeLessThanOrEqual(
    mobileCopyBox!.y,
  );
  expect(mobileCopyBox!.y + mobileCopyBox!.height).toBeLessThanOrEqual(800);
  for (const name of ["Adjust tone or context", "Start another set"]) {
    const actionBox = await page
      .getByRole("button", { name })
      .first()
      .boundingBox();
    expect(actionBox).not.toBeNull();
    expect(actionBox!.height).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({
    path: "artifacts/screenshots/review-written-mobile-320.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "written review mobile copy-first handoff");
  await page.setViewportSize({ width: 1280, height: 720 });

  await page.getByTestId("copy-prompt").click();
  await expect(page.getByTestId("handoff-feedback")).toHaveText(
    "Your instructions were copied.",
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
    .getByRole("button", { name: "Adjust tone or context" })
    .first()
    .click();
  await openHomeChoices(page);
  await page.getByRole("button", { name: "Swap languages" }).click();
  await generate(page);
  await expect(page.getByTestId("canonical-prompt")).toContainText(
    "For Japanese→English",
  );

  await page
    .getByRole("button", { name: "Adjust tone or context" })
    .first()
    .click();
  await openHomeChoices(page);
  await page.getByRole("button", { name: "Swap languages" }).click();
  await page
    .getByRole("radio", { name: /Practice speaking/ })
    .check();
  await expect(page.locator("#home-language")).toHaveAccessibleName(
    /^Explain in\b/,
  );
  await expect(page.locator("#target-language")).toHaveAccessibleName(
    /^Practice in\b/,
  );
  await openBuilder(page);
  await expect(page.getByLabel("When to correct me")).toBeVisible();
  await expect(page.getByLabel("Pronunciation help")).toBeVisible();
  await page
    .getByText("See exactly what PhraseGarden will protect", { exact: true })
    .click();
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
    .getByRole("button", { name: "Adjust tone or context" })
    .first()
    .click();
  await openHomeChoices(page);
  await page.getByRole("radio", { name: /Translate writing/ }).check();
  await page
    .getByLabel("Translate to")
    .selectOption("id");
  await expect(page.getByTestId("support-status")).toContainText("Generic");
  await expect(page.getByTestId("support-status")).toContainText(
    "No pair-specific guidance or independent language review",
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
    "PhraseGarden makes reusable instructions for another AI chat or language tool",
  );
  await expect(page.locator(".hero-copy")).toContainText(
    "Your text never comes here",
  );
  await openHomeChoices(page);
  await expect(
    page.getByRole("radio", { name: /Translate writing/ }).locator(".."),
  ).toContainText("messages, emails, documents");
  await expect(
    page.getByRole("radio", { name: /Practice speaking/ }).locator(".."),
  ).toContainText("AI tool with voice features");

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
  for (const label of ["Text is in", "Translate to"] as const) {
    const select = page.getByLabel(label);
    expect(await select.locator("option").evaluateAll((options) =>
      options.map((option) => (option as HTMLOptionElement).value),
    )).toEqual(expectedOptionValues);
    const optionText = await select.locator("option").allTextContents();
    expect(optionText).toContain("French — ⁨français⁩");
    expect(optionText).toContain("German — ⁨Deutsch⁩");
    expect(optionText).toContain(
      "Portuguese (region not specified) — ⁨português⁩",
    );
    expect(optionText).toContain("Hebrew — ⁨עברית⁩");
    expect(optionText).toContain("Yiddish — ⁨ייִדיש⁩");
    expect(optionText.join(" ")).not.toMatch(/\((?:en|ja|fr|de|pt|es|it)\)/);
    await expect(select.locator("option[dir='auto']")).toHaveCount(12);
  }

  await expect(page.getByText("Translate from", { exact: true })).toBeVisible();
  await expect(page.getByText("Translate into", { exact: true })).toBeVisible();
  await page.getByLabel("Translate to").selectOption("fr");
  await expect(page.locator(".sr-only[role='status']")).toHaveText(
    "Direction changed to English to French. Support level: Generic. General guidance only.",
  );
  await expect(page.getByTestId("support-status")).toContainText(
    "No pair-specific guidance or independent language review for this exact direction",
  );
  await expect(page.locator(".target-rail bdi[lang='fr'][dir='ltr']")).toHaveText(
    "français",
  );
  await page.getByRole("button", { name: "Use current choices" }).click();
  const desktopAction = await page
    .getByRole("button", { name: "Make my instructions" })
    .boundingBox();
  expect(desktopAction).not.toBeNull();
  const desktopActionBottom = desktopAction!.y + desktopAction!.height;
  expect(desktopActionBottom).toBeLessThanOrEqual(
    page.viewportSize()!.height,
  );
  expect(
    page.viewportSize()!.height - desktopActionBottom,
  ).toBeGreaterThanOrEqual(24);
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
  await page.getByRole("button", { name: "Make my instructions" }).click();
  await expect(page.getByTestId("review-direction")).toContainText(
    "English",
  );
  await expect(page.getByTestId("review-direction")).toContainText(
    "French (français)",
  );
  await expect(page.getByTestId("review-direction")).toContainText(
    "Translate writing",
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

  await page.getByRole("button", { name: "Start another set" }).first().click();
  await openHomeChoices(page);
  await page.getByLabel("Text is in").selectOption("de");
  await page.getByLabel("Translate to").selectOption("it");
  await expect(page.locator(".sr-only[role='status']")).toHaveText(
    "Direction changed to German to Italian. Support level: Generic. General guidance only.",
  );
  await page.getByRole("button", { name: "Swap languages" }).click();
  await expect(page.locator(".sr-only[role='status']")).toHaveText(
    "Direction changed to Italian to German. Support level: Generic. General guidance only.",
  );
  await page.getByRole("button", { name: "Make my instructions" }).click();
  await expect(
    page.getByTestId("review-direction").locator("span[lang='en'][dir='ltr']").first(),
  ).toHaveText("Italian");
  await expect(
    page.getByTestId("review-direction").locator("bdi[lang='de'][dir='ltr']"),
  ).toHaveText("Deutsch");

  await page.getByRole("button", { name: "Start another set" }).first().click();
  await openHomeChoices(page);
  await page.getByLabel("Text is in").selectOption("en");
  await page.getByLabel("Translate to").selectOption("pt");
  await expect(page.getByLabel("Translate to")).toHaveValue("pt");
  await page.getByRole("button", { name: "Make my instructions" }).click();
  await expect(page.getByTestId("review-direction")).toContainText(
    "Portuguese (region not specified)",
  );
  const portuguesePrompt = await page.getByTestId("canonical-prompt").textContent();
  expect(portuguesePrompt).toContain("pt@1.0.0");
  expect(portuguesePrompt).not.toMatch(/Brazil|Portugal|pt-BR|pt-PT/i);

  await page.getByRole("button", { name: "Start another set" }).first().click();
  await openHomeChoices(page);
  await page.getByLabel("Translate to").selectOption("es");
  await expect(page.locator(".target-rail bdi[lang='es'][dir='ltr']")).toHaveText(
    "español",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("radio", { name: /Practice speaking/ }).check();
  await expect(
    page.getByText("Explain in", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Practice in", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator("#home-language")).toHaveAccessibleName(
    /^Explain in\b/,
  );
  await expect(page.locator("#target-language")).toHaveAccessibleName(
    /^Practice in\b/,
  );
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

  await page
    .getByRole("button", { name: "Edit these instructions" })
    .click();
  const textarea = page.getByRole("textbox", {
    name: "Your edited copy",
  });
  await expect(textarea).toBeVisible();
  await expect(textarea).toBeFocused();
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
    "Your edited instructions were copied.",
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
    .getByRole("button", { name: "Restore generated instructions" })
    .click();
  await expect(
    page.getByRole("alertdialog", { name: "Discard your edits?" }),
  ).toBeVisible();
  const keepEdits = page.getByRole("button", { name: "Keep my edits" });
  await expect(keepEdits).toBeFocused();
  await keepEdits.click();
  await expect(textarea).toHaveValue(edited);
  await expect(
    page.getByRole("button", { name: "Restore generated instructions" }),
  ).toBeFocused();

  await page
    .getByRole("button", { name: "Restore generated instructions" })
    .click();
  await expect(keepEdits).toBeFocused();
  await page
    .getByRole("button", { name: "Discard edits and restore" })
    .click();
  await expect(page.getByTestId("canonical-prompt")).toBeVisible();
  await expect(page.getByTestId("canonical-prompt")).toBeFocused();
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
    name: "Make my instructions",
  });
  await expect(mobileQuickAction).toHaveCount(1);
  const mobileQuickActionBox = await mobileQuickAction.boundingBox();
  expect(mobileQuickActionBox).not.toBeNull();
  expect(
    mobileQuickActionBox!.y + mobileQuickActionBox!.height,
  ).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "PhraseGarden home" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", {
      name: "Start in English with English to Japanese written translation.",
    }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", {
      name: "Start in Japanese with Japanese to English written translation.",
    }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Keep your meaning when AI translates/,
    }),
  ).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(mobileQuickAction).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Adjust tone or context" }).first(),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Adjust tone and context",
    }),
  ).toBeFocused();
  await expect(page.getByLabel("Text is in")).toHaveCount(0);
  await expect(
    page.getByRole("radio", { name: /Translate writing/ }),
  ).toHaveCount(0);
  await expect(page.getByLabel("Relationship")).toBeVisible();
  await expect(page.getByLabel("Tone and formality")).toBeVisible();
  await expect(page.getByLabel("How much detail")).toBeVisible();
  const closedBuilderDimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(closedBuilderDimensions.scroll).toBeLessThanOrEqual(
    closedBuilderDimensions.client + 1,
  );
  await page.screenshot({
    path: "artifacts/screenshots/builder-written-mobile-320-closed.png",
    fullPage: true,
  });

  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Change languages or task" }).first(),
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
    page.getByRole("button", { name: "Change languages or task" }).last(),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Make my instructions" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Your instructions are ready",
    }),
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
  await expect(
    page.getByRole("button", { name: "Adjust tone or context" }).first(),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Start another set" }).first(),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByText("Step-by-step", { exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("canonical-prompt")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Edit these instructions" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("textbox", { name: "Your edited copy" }),
  ).toBeFocused();

  await page.getByRole("button", { name: "Start another set" }).first().click();
  await openHomeChoices(page);
  await page.getByLabel("Text is in").selectOption("he");
  const rtlLabel = page.locator(".home-rail bdi[lang='he'][dir='rtl']");
  await expect(rtlLabel).toContainText("עברית");
  const labelBox = await rtlLabel.boundingBox();
  expect(labelBox).not.toBeNull();
  expect(labelBox!.x + labelBox!.width).toBeLessThanOrEqual(320);

  await page.emulateMedia({ reducedMotion: "reduce" });
  const transitionDuration = await page
    .getByRole("button", { name: "Make my instructions" })
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(transitionDuration).not.toContain("0.14s");
});

test("role and name queries expose named guidance, handoff, and instruction regions", async ({
  page,
}) => {
  const supportRegion = page.getByRole("region", {
    name: /Guidance: Built in\s+Preview/,
  });

  await page.goto("/");
  await expect(supportRegion).toHaveCount(1);
  await openBuilder(page);
  await expect(supportRegion).toHaveCount(1);
  await generate(page);

  await expect(supportRegion).toHaveCount(1);
  await expect(
    page.getByRole("region", { name: "Known limitations" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Copy, then paste elsewhere" }),
  ).toBeVisible();
  const promptDocument = page.getByRole("document", {
    name: "Complete generated instructions",
  });
  await expect(promptDocument).toBeVisible();
  await expect(promptDocument).toHaveAccessibleName(
    "Complete generated instructions",
  );

  const reviewOrder = await page
    .locator(
      "[data-testid='support-status'], [data-testid='limitations'], [data-testid='prompt-handoff'], [data-testid='canonical-prompt']",
    )
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-testid")),
    );
  expect(reviewOrder).toEqual([
    "support-status",
    "limitations",
    "prompt-handoff",
    "canonical-prompt",
  ]);
  await expectNoAxeViolations(page, "named accessibility regions");
});

test("forced colors preserves focus, selection, truth, actions, and narrow reflow", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  expect(
    await page.evaluate(() => matchMedia("(forced-colors: active)").matches),
  ).toBe(true);

  const currentLanguage = page.getByRole("button", {
    name: "Start in English with English to Japanese written translation.",
  });
  await expect(currentLanguage).toHaveAttribute("aria-pressed", "true");
  const fastPath = page.getByRole("button", { name: "Make my instructions" });
  await fastPath.focus();
  const selectedUnfocusedStyle = await currentLanguage.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      borderWidth: Number.parseFloat(style.borderTopWidth),
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
    };
  });
  expect(selectedUnfocusedStyle.borderWidth).toBeGreaterThanOrEqual(2);
  expect(selectedUnfocusedStyle.outlineStyle).toBe("none");
  await currentLanguage.focus();
  const currentLanguageStyle = await currentLanguage.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
    };
  });
  expect(currentLanguageStyle.outlineStyle).not.toBe("none");
  expect(currentLanguageStyle.outlineWidth).toBeGreaterThanOrEqual(2);
  expect(currentLanguageStyle.outlineStyle).not.toBe(
    selectedUnfocusedStyle.outlineStyle,
  );

  await fastPath.focus();
  const focusStyle = await fastPath.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
    };
  });
  expect(focusStyle.outlineStyle).not.toBe("none");
  expect(focusStyle.outlineWidth).toBeGreaterThanOrEqual(2);

  await openHomeChoices(page);
  const selectedTask = page.getByRole("radio", { name: /Translate writing/ });
  await expect(selectedTask).toBeChecked();
  const selectedStyle = await selectedTask.evaluate((element) => {
    const label = element.closest("label");
    if (label === null) throw new Error("selected task label is missing");
    const style = getComputedStyle(label);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
    };
  });
  expect(selectedStyle.outlineStyle).not.toBe("none");
  expect(selectedStyle.outlineWidth).toBeGreaterThanOrEqual(2);

  await page.getByRole("button", { name: "Use current choices" }).click();
  await generate(page);
  await expect(page.getByTestId("support-status")).toContainText(
    "External language review: incomplete.",
  );
  await expect(page.getByTestId("limitations")).toBeVisible();
  await expect(page.getByTestId("prompt-handoff")).toBeVisible();

  const actions = [
    page.getByTestId("copy-prompt"),
    page.getByTestId("download-prompt"),
  ];
  for (const action of actions) {
    const box = await action.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  }
  const reviewOrder = await page
    .locator(
      "[data-testid='support-status'], [data-testid='limitations'], [data-testid='prompt-handoff']",
    )
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-testid")),
    );
  expect(reviewOrder).toEqual([
    "support-status",
    "limitations",
    "prompt-handoff",
  ]);
  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  await expectNoAxeViolations(page, "forced-colors review");
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
    await openHomeChoices(page);
    await page.getByLabel("Text is in").selectOption("zh-Hant-TW");
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
