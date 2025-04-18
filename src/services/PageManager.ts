import { Page, Browser, Dialog } from "puppeteer";

export interface PageData {
  page: Page;
  consoleLogs: string[];
  pageErrors: string[];
  pageUrl: string | null;
  pageTitle: string | null;
  dialog: Dialog | null;
}

export class PageManager {
  private pages: Map<string, PageData> = new Map();
  private activePage: string | null = null;
  private browser: Browser;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  async createPage(pageId?: string): Promise<string> {
    const id = pageId || crypto.randomUUID();
    const page = await this.browser.newPage();

    const pageData: PageData = {
      page,
      consoleLogs: [],
      pageErrors: [],
      pageUrl: null,
      pageTitle: null,
      dialog: null
    };

    // Set up console and error listeners
    page.on('console', msg => {
      pageData.consoleLogs.push(msg.text());
    });

    page.on('pageerror', (error) => {
      pageData.pageErrors.push(error.message);
    });

    page.on('dialog', async dialog => {
      pageData.dialog = dialog;
    });

    this.pages.set(id, pageData);
    this.activePage = id;
    return id;
  }

  getPage(pageId?: string): PageData | null {
    if (pageId) {
      return this.pages.get(pageId) || null;
    }
    return this.activePage ? this.pages.get(this.activePage) || null : null;
  }

  async closePage(pageId: string): Promise<boolean> {
    const pageData = this.pages.get(pageId);
    if (pageData) {
      await pageData.page.close();
      this.pages.delete(pageId);
      if (this.activePage === pageId) {
        this.activePage = this.pages.size > 0 ? Array.from(this.pages.keys())[0] : null;
      }
      return true;
    }
    return false;
  }

  setActivePage(pageId: string): boolean {
    if (this.pages.has(pageId)) {
      this.activePage = pageId;
      return true;
    }
    return false;
  }

  getActivePageId(): string | null {
    return this.activePage;
  }

  getAllPageIds(): string[] {
    return Array.from(this.pages.keys());
  }
}