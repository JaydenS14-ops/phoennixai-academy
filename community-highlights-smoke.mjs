import { chromium } from "playwright";

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) throw new Error("Administrator verification credentials are unavailable.");
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });

try {
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await page.getByText("Conversations worth showing up for.", { exact: true }).waitFor({ state: "visible" });
  await page.getByText("Experiences shared with permission.", { exact: true }).waitFor({ state: "visible" });
  await page.getByText(/Authentic community voices will appear here|Only authentic, approved contributor testimonials are shown here/).first().waitFor({ state: "visible" });
  await page.goto("http://127.0.0.1:3000/in-motion", { waitUntil: "networkidle" });
  await page.getByText("Latest archive moment", { exact: false }).first().waitFor({ state: "visible" });
  await page.goto("http://127.0.0.1:3000/apply", { waitUntil: "networkidle" });
  await page.locator("#contactName").fill("Prospective Founder");
  await page.locator("#contactEmail").fill("founder@example.com");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator("#studentAge").fill("28");
  await page.locator("#primarySkill").selectOption({ label: "Rise to Capital" });
  await page.getByLabel(/Rise to Capital cohort interest/).waitFor({ state: "visible" });
  await page.goto("http://127.0.0.1:3000/admin/login", { waitUntil: "networkidle" });
  await page.locator("#adminUsername").fill(process.env.ADMIN_USERNAME);
  await page.locator("#adminPassword").fill(process.env.ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in securely", exact: true }).click();
  await page.getByRole("button", { name: "Testimonials", exact: true }).waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Testimonials", exact: true }).click();
  await page.getByText("Manage testimonials responsibly.", { exact: true }).waitFor({ state: "visible" });
  await page.getByText("Permission confirmed", { exact: true }).waitFor({ state: "visible" });
  await page.screenshot({ path: "/home/ubuntu/community-testimonial-admin.png", fullPage: true });
  console.log("Community, cohort-interest, and testimonial-management smoke check passed.");
} finally {
  await browser.close();
}
