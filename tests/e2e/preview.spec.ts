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
  await page.getByRole("button", { name: "Open the prompt builder" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Shape the behavior" }),
  ).toBeFocused();
}

async function generate(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: "Generate portable prompt" })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Your portable prompt" }),
  ).toBeFocused();
}

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
      name: /Carry what you mean/,
    }),
  ).toBeVisible();
  await expect(page.getByText("Local compiler · nothing sent")).toBeVisible();
  await expect(page.getByTestId("support-status")).toContainText("Preview");
  await expect(
    page.getByText("Versioned instructions compile deterministically."),
  ).toBeVisible();
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
  await page.getByLabel("Register treatment").selectOption("polite");
  await expect(page.getByTestId("behavior-summary")).toContainText(
    "Adapts toward polite language",
  );
  await page.screenshot({
    path: "artifacts/screenshots/builder-written-desktop.png",
    fullPage: true,
  });
  await expectNoAxeViolations(page, "written builder");

  await generate(page);
  await expect(page.getByTestId("support-status")).toContainText("Preview");
  await expect(page.getByTestId("limitations")).toContainText(
    "external linguistic review has not been completed",
  );
  await expect(
    page.getByText(
      "Preview guidance has not completed external linguistic review.",
    ),
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
  expect(
    normalizeClipboardText(
      await page.evaluate(() => navigator.clipboard.readText()),
    ),
  ).toBe(canonical);
  const canonicalDownload = page.waitForEvent("download");
  await page.getByTestId("download-prompt").click();
  const downloaded = await canonicalDownload;
  const downloadedPath = await downloaded.path();
  expect(downloadedPath).not.toBeNull();
  expect(readFileSync(downloadedPath!, "utf8")).toBe(canonical);

  await page.getByText("Version and provenance").click();
  await expect(page.getByText("en-ja-preview@1.0.0-preview.1")).toBeVisible();

  await page.getByRole("button", { name: "Edit settings" }).click();
  await page.getByRole("button", { name: "Swap languages" }).click();
  await generate(page);
  await expect(page.getByTestId("canonical-prompt")).toContainText(
    "For Japanese→English",
  );

  await page.getByRole("button", { name: "Edit settings" }).click();
  await page.getByRole("button", { name: "Swap languages" }).click();
  await page
    .getByLabel(/Live Voice Coach/)
    .check();
  await expect(page.getByLabel("Correction timing")).toBeVisible();
  await expect(page.getByLabel("Pronunciation help")).toBeVisible();
  await expect(page.getByTestId("behavior-summary")).toContainText(
    "Balances meaning, social force, grammar, and natural form in corrections.",
  );
  await page.getByLabel("Correction focus").selectOption("form-detail");
  await expect(page.getByTestId("behavior-summary")).toContainText(
    "Prioritizes grammar and form detail after preserving meaning and social force.",
  );
  await expect(page.getByLabel("Learner evidence")).toBeHidden();
  await page
    .getByText("Destination capabilities", { exact: true })
    .click();
  await expect(page.getByLabel("Learner evidence")).toHaveValue("unknown");
  await generate(page);
  await expect(page.getByTestId("canonical-prompt")).toContainText(
    "Live Voice Coach",
  );
  await expect(page.getByTestId("canonical-prompt")).toContainText(
    "interrupt, wait, repeat, and slower",
  );
  await expect(page.getByTestId("limitations")).toContainText(
    "Audio evidence is unknown",
  );

  await page.getByRole("button", { name: "Edit settings" }).click();
  await page
    .getByLabel("Target language")
    .selectOption("id");
  await expect(page.getByTestId("support-status")).toContainText("Generic");
  await generate(page);
  const generic = await page.getByTestId("canonical-prompt").textContent();
  expect(generic).toContain("Support tier: Generic");
  expect(generic).not.toContain("## 6. Exact pair guidance");
  expect(generic).not.toContain("ordinary Japanese omission");
  await page.getByText("Version and provenance").click();
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

  await page.getByRole("button", { name: "Edit a local copy" }).click();
  const textarea = page.getByRole("textbox", {
    name: "Your edited copy",
  });
  await expect(textarea).toBeVisible();
  await expect(page.getByText("Modified locally")).toHaveCount(0);

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
  await expect(page.getByText("Modified locally")).toHaveCount(0);
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
  await expect(page.getByText("Modified locally")).toBeVisible();
  await expect(
    page.getByText("Modified locally · canonicality is not certified"),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Modified locally · not byte-identical to compiler output",
    ),
  ).toHaveCount(0);
  const edited = await textarea.inputValue();
  expect(edited).toContain("Local IME note: 日本語");

  await page.getByTestId("copy-prompt").click();
  expect(
    normalizeClipboardText(
      await page.evaluate(() => navigator.clipboard.readText()),
    ),
  ).toBe(edited);
  const downloadEvent = page.waitForEvent("download");
  await page.getByTestId("download-prompt").click();
  const download = await downloadEvent;
  const path = await download.path();
  expect(readFileSync(path!, "utf8")).toBe(edited);

  await page
    .getByRole("button", { name: "Regenerate canonical output" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Replace your edited copy?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep my edit" }).click();
  await expect(textarea).toHaveValue(edited);

  await page
    .getByRole("button", { name: "Regenerate canonical output" })
    .click();
  await page.getByRole("button", { name: "Restore canonical" }).click();
  await expect(page.getByTestId("canonical-prompt")).toBeVisible();
  await expect(page.getByText("Modified locally")).toHaveCount(0);
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
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Carry what you mean/,
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
  await expect(page.getByLabel(/Written Translator/)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Open the prompt builder" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { level: 1, name: "Shape the behavior" }),
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
  await expect(page.getByLabel(/Written Translator/)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Relationship")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Hierarchy")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Register treatment")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Output detail")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByText("Safeguards and ambiguity", { exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Back" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Generate portable prompt" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { level: 1, name: "Your portable prompt" }),
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
    page.getByRole("button", { name: "Edit a local copy" }),
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
    .getByRole("button", { name: "Open the prompt builder" })
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
    await openBuilder(page);
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
