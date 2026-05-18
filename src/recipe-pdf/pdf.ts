import { chromium } from "playwright";

export async function renderPdfFromHtml(html: string, outputPath: string): Promise<void> {
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });

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
  } finally {
    await browser.close();
  }
}
