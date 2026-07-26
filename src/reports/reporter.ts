import { TestInfo } from "@playwright/test";
import { ContentType } from "allure-js-commons";
import { timeouts } from "@constants/timeouts.constants.ts";
import { spawn } from "node:child_process";
import { magicStrings } from "@data/magic-strings/magic.strings.ts";
import { s3Helper } from "@helpers/s3/s3.helper.ts";
import fs from "fs";
import { StatisticUtil } from "@reports/stat.util.ts";

export class Reporter {
  private static instance: Reporter;
  private testInfo: TestInfo;

  private constructor(testInfo: TestInfo) {
    this.testInfo = testInfo;
  }

  public static getInstance(testInfo?: TestInfo): Reporter {
    if (!Reporter.instance) {
      Reporter.instance = new Reporter(testInfo);
    }
    return Reporter.instance;
  }

  async attach(
    name: string,
    text: string,
    contentType = ContentType.TEXT,
  ): Promise<void> {
    await this.testInfo.attach(name, {
      body: text,
      contentType,
    });
  }

  async attachImage(title: string, imageBuffer: Buffer): Promise<void> {
    await this.testInfo.attach(title, {
      body: imageBuffer,
      contentType: ContentType.PNG,
    });
  }

  public static async generateAllureReport(): Promise<boolean> {
    if (!fs.existsSync(magicStrings.path.allureResults)) {
      console.warn(
        "[Reporter] - allure-results does not exist, skipping Allure report generation",
      );
      return false;
    }

    return new Promise<boolean>((resolve, reject) => {
      const generation = spawn(
        "npx",
        ["allure", "generate", "allure-results", "--clean"],
        {
          stdio: "inherit",
          shell: true,
        },
      );

      const generationTimeout = setTimeout(() => {
        return reject(false);
      }, timeouts.xl);

      generation.on("exit", async (exitCode: number) => {
        clearTimeout(generationTimeout);
        if (exitCode !== 0) {
          return reject(false);
        }
        try {
          await StatisticUtil.prepareStatistics();
          return resolve(true);
        } catch (err) {
          console.error(
            "[Reporter] - Failed to prepare Allure statistics:",
            err,
          );
          return resolve(true);
        }
      });

      generation.on("error", (err) => {
        clearTimeout(generationTimeout);
        console.error("Error generating Allure report:", err);
        reject(false);
      });
    });
  }

  public static generateTraceBucketPath(): string {
    return s3Helper.buildBucketPath("trace");
  }

  public static generateScreenshotBucketPath(): string {
    return s3Helper.buildBucketPath("screenshots");
  }

  public static async uploadScreenshotReport(): Promise<string | undefined> {
    const screenshotHtmlPath = "artifacts/grouped-screenshots.html";

    if (!fs.existsSync(screenshotHtmlPath)) {
      console.warn(
        `[Reporter] - ${screenshotHtmlPath} does not exist, skipping screenshot report upload`,
      );
      return undefined;
    }

    if (!s3Helper.isConfigured) {
      console.warn(
        "[Reporter] - S3_BUCKET/S3_DOMAIN not set, skipping screenshot report upload",
      );
      return undefined;
    }

    const bucketPath = Reporter.generateScreenshotBucketPath();

    try {
      const tempDir = "artifacts/screenshots-temp";
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const tempFilePath = `${tempDir}/grouped-screenshots.html`;
      fs.copyFileSync(screenshotHtmlPath, tempFilePath);

      await s3Helper.syncFolderWithBucket(`${tempDir}/`, bucketPath);

      fs.unlinkSync(tempFilePath);
      fs.rmdirSync(tempDir);

      return bucketPath;
    } catch (error) {
      console.error(
        `[Reporter] - Failed to upload screenshot report: ${error}`,
      );
      return undefined;
    }
  }

  public static async uploadAllureReport(): Promise<string | undefined> {
    if (!s3Helper.isConfigured) {
      console.warn(
        "[Reporter] - S3_BUCKET/S3_DOMAIN not set, skipping Allure report upload",
      );
      return undefined;
    }

    try {
      const generated = await Reporter.generateAllureReport();
      if (!generated) {
        return undefined;
      }
      if (!fs.existsSync("allure-report")) {
        console.warn(
          "[Reporter] - allure-report does not exist, skipping upload",
        );
        return undefined;
      }
      const bucketPath = s3Helper.buildBucketPath("allure");
      await s3Helper.syncFolderWithBucket("allure-report/", bucketPath);
      return bucketPath;
    } catch (error) {
      console.error(`[Reporter] - Failed to upload Allure report: ${error}`);
      return undefined;
    }
  }

  public static writeReportUrls(urls: {
    allure?: string;
    screenshots?: string;
    traceBucketPath?: string;
  }): void {
    const lines: string[] = [];
    if (urls.allure) {
      lines.push(`ALLURE_URL=${urls.allure}`);
    }
    if (urls.screenshots) {
      lines.push(`SCREENSHOTS_URL=${urls.screenshots}`);
    }
    if (urls.traceBucketPath) {
      lines.push(`TRACE_BUCKET_PATH=${urls.traceBucketPath}`);
    }
    fs.mkdirSync("artifacts", { recursive: true });
    fs.writeFileSync(
      "artifacts/report-urls.txt",
      `${lines.join("\n")}\n`,
      "utf-8",
    );
  }

  public static printReportUrls(urls: {
    allure?: string;
    screenshots?: string;
    trace?: string;
  }): void {
    console.log("=".repeat(60));
    console.log("Report URLs (CloudFront / Basic Auth required)");
    console.log("=".repeat(60));
    console.log(`Allure:       ${urls.allure ?? "(not uploaded)"}`);
    console.log(`Playwright:   ${urls.trace ?? "(not uploaded yet)"}`);
    console.log(`Screenshots:  ${urls.screenshots ?? "(not uploaded)"}`);
    console.log("=".repeat(60));
  }
}
