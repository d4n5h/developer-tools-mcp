import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin());

const browser = await puppeteer.launch({ headless: false, devtools: true });

// Get the first tab
const pages = await browser.pages();
const firstPage = pages[0];

firstPage.goto("http://localhost:3001/index.html");

export { browser };