import { envHelper } from "@helpers/env/env.helper.ts";
import { Reporter } from "@reports/reporter.ts";
import { ScreenshotHelper } from "@helpers/screenshot/screenshot.helper";

async function globalTeardown(): Promise<void> {
  const screenshotHelper = new ScreenshotHelper();
  if (envHelper.groupScreenshots) {
    await screenshotHelper.groupScreenshots();
  }
  if (!envHelper.isCI) {
    try {
      await Reporter.generateAllureReport();
    } catch {
      console.warn("[globalTeardown] - Allure report generation skipped/failed");
    }
    return;
  }
  if (envHelper.groupScreenshots) {
    await Reporter.uploadScreenshotReport();
  }
}

export default globalTeardown;
