import { chromium, type Page } from "playwright";

const PAGE_LOAD_TIMEOUT_MS = 15_000;
const STYLE_SETTLE_TIMEOUT_MS = 1_000;

async function preparePage(page: Page, html: string): Promise<void> {
  page.setDefaultTimeout(PAGE_LOAD_TIMEOUT_MS);
  await page.setContent(html, { waitUntil: "domcontentloaded", timeout: PAGE_LOAD_TIMEOUT_MS });
  await page.waitForLoadState("load", { timeout: PAGE_LOAD_TIMEOUT_MS }).catch(() => undefined);
  await page.waitForTimeout(STYLE_SETTLE_TIMEOUT_MS);
}

export async function withPdfPage<T>(run: (page: Page) => Promise<T>): Promise<T> {
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();
    return await run(page);
  } finally {
    await browser.close();
  }
}

export async function renderPdfFromPage(page: Page, html: string, outputPath: string): Promise<void> {
  await preparePage(page, html);

  await page.pdf({
    path: outputPath,
    format: "Letter",
    printBackground: true,
    margin: {
      top: "0.5in",
      right: "0.5in",
      bottom: "0.5in",
      left: "0.5in",
    },
  });
}

export async function renderPdfFromHtml(html: string, outputPath: string): Promise<void> {
  await withPdfPage(async (page) => {
    await renderPdfFromPage(page, html, outputPath);
  });
}
