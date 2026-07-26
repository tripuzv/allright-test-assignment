import { envHelper } from "@helpers/env/env.helper.ts";
import { Reporter } from "@reports/reporter.ts";
import { ScreenshotHelper } from "@helpers/screenshot/screenshot.helper";
import { s3Helper } from "@helpers/s3/s3.helper.ts";
import fs from "fs";

async function globalTeardown(): Promise<void> {
  const screenshotHelper = new ScreenshotHelper();
  if (envHelper.groupScreenshots) {
    await screenshotHelper.groupScreenshots();
  }

  if (!envHelper.isCI) {
    try {
      await Reporter.generateAllureReport();
    } catch {
      console.warn(
        "[globalTeardown] - Allure report generation skipped/failed",
      );
    }
    return;
  }

  if (!s3Helper.isConfigured) {
    console.warn(
      "[globalTeardown] - S3_BUCKET/S3_DOMAIN not set; skipping S3 uploads",
    );
    return;
  }

  const traceBucketPath = Reporter.generateTraceBucketPath();
  fs.mkdirSync("artifacts", { recursive: true });
  fs.writeFileSync(
    "artifacts/trace_report_s3_bucket.txt",
    traceBucketPath,
    "utf-8",
  );

  let screenshotsBucketPath: string | undefined;
  if (envHelper.groupScreenshots) {
    screenshotsBucketPath = await Reporter.uploadScreenshotReport();
  }

  const allureBucketPath = await Reporter.uploadAllureReport();

  const urls = {
    allure: allureBucketPath
      ? s3Helper.buildPublicUrl(allureBucketPath, "index.html")
      : undefined,
    screenshots: screenshotsBucketPath
      ? s3Helper.buildPublicUrl(
          screenshotsBucketPath,
          "grouped-screenshots.html",
        )
      : undefined,
    traceBucketPath,
  };

  Reporter.writeReportUrls(urls);
  Reporter.printReportUrls({
    allure: urls.allure,
    screenshots: urls.screenshots,
  });
}

export default globalTeardown;
