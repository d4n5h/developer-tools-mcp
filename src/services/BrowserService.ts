import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import type { KeyInput, ElementHandle, Page, Browser } from 'puppeteer';

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin());

const browser = await puppeteer.launch({ headless: false, devtools: true });

export { browser };