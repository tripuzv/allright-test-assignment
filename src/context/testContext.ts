// testContext.ts
import { Page, TestInfo } from "@playwright/test";
import { Reporter } from "@reports/reporter.ts";

class TestContext {
  private static instance: TestContext;
  private _page?: Page;
  private _testInfo?: TestInfo;
  private _reporter?: Reporter;

  private constructor() {}

  // Singleton instance getter
  static getInstance(): TestContext {
    if (!TestContext.instance) {
      TestContext.instance = new TestContext();
    }
    return TestContext.instance;
  }

  // Getter and setter for page
  get page(): Page | undefined {
    return this._page;
  }

  set page(page: Page | undefined) {
    this._page = page;
  }

  // Getter and setter for testInfo
  get testInfo(): TestInfo | undefined {
    return this._testInfo;
  }

  set testInfo(testInfo: TestInfo | undefined) {
    this._testInfo = testInfo;
  }

  get reporter(): Reporter | undefined {
    return this._reporter;
  }

  set reporter(reporter: Reporter | undefined) {
    this._reporter = reporter;
  }
}

export default TestContext;
