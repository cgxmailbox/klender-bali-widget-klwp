import { chromium } from "playwright";
import fs from "fs";

const SOURCE = "https://kalenderbali.org/prevwidget.php?id=4";

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({
    locale: "id-ID",
    timezoneId: "Asia/Makassar",
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"
  });

  await page.goto(SOURCE, {
    waitUntil: "domcontentloaded",
    timeout: 90000
  });

  await page.waitForTimeout(8000);

  const title = await page.title();
  const rawText = await page.locator("body").innerText();

  const blocked =
    /please wait while your request is being verified/i.test(rawText) ||
    /one moment,\s*please/i.test(rawText) ||
    /just a moment/i.test(rawText) ||
    /just a moment/i.test(title);

  if (blocked) {
    throw new Error(
      "KalenderBali.org masih menampilkan halaman verifikasi, jadi today.txt tidak diubah."
    );
  }

  const lines = rawText
    .split(/\r?\n/)
    .map(s => s.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (!lines.length) {
    throw new Error("Widget tidak menghasilkan teks.");
  }

  const display = lines.join(" ");

  if (
    display.length < 8 ||
    /error|forbidden|access denied|captcha/i.test(display)
  ) {
    throw new Error("Isi widget tidak valid: " + display.slice(0, 150));
  }

  const data = {
    source: "KalenderBali.org widget id=4",
    source_url: SOURCE,
    timezone: "Asia/Makassar",
    generated_at: new Date().toISOString(),
    display,
    raw_lines: lines
  };

  fs.writeFileSync("today.txt", display + "\n", "utf8");
  fs.writeFileSync(
    "today.json",
    JSON.stringify(data, null, 2) + "\n",
    "utf8"
  );

  console.log("Berhasil:");
  console.log(display);
} finally {
  await browser.close();
}
