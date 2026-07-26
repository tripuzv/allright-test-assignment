import TestContext from "./test.context";
import { Page, TestInfo } from "@playwright/test";
import { Reporter } from "@reports/reporter.ts";

export function useTestContext() {
  const context = TestContext.getInstance();

  return {
    page: context.page,
    testInfo: context.testInfo,
    reporter: context.reporter,
    setPage: (page: Page) => {
      context.page = page;
    },
    setTestInfo: (testInfo: TestInfo) => {
      context.testInfo = testInfo;
      context.reporter = Reporter.getInstance(testInfo);
    },
  };
}
