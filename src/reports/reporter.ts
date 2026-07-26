import { TestInfo } from "@playwright/test";
import { ContentType } from "allure-js-commons";
import { timeouts } from "@constants/timeouts.constants.ts";
import { spawn } from "node:child_process";
import { magicStrings } from "@data/magic-strings/magic.strings.ts";
import { IAllureStatisticObject } from "@reports/types/allure-stat.types.ts";
import { envHelper } from "@helpers/env/env.helper.ts";
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

  async attachObject(name: string, data: object): Promise<void> {
    const jsonData = JSON.stringify(data, null, 2);
    await this.attach(name, jsonData, ContentType.JSON);
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
          console.error("[Reporter] - Failed to prepare Allure statistics:", err);
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

  public static async getStatisticsObject(): Promise<IAllureStatisticObject> {
    const summaryFilePath = `${magicStrings.path.allureSummaryDir}/test_stat_summary.json`;

    const summaryFileContent = fs.readFileSync(summaryFilePath, "utf-8");
    const summary = JSON.parse(summaryFileContent);
    const tests: any[] = Array.isArray(summary?.tests) ? summary.tests : [];

    const stableParamKey = (
      params?: Array<{ name: string; value: string }>,
    ) => {
      if (!params?.length) return "";
      return params
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => `${p.name}=${p.value}`)
        .join("|");
    };

    const toMillis = (s?: string) => (s ? new Date(s).getTime() : 0);
    const testKey = (t: any) => `${t.name}::${stableParamKey(t.parameters)}`;

    const latestByKey = new Map<string, any>();
    for (const t of tests) {
      const key = testKey(t);
      const prev = latestByKey.get(key);
      const currStop = toMillis(t?.time?.stop) || toMillis(t?.time?.start) || 0;
      const prevStop =
        toMillis(prev?.time?.stop) || toMillis(prev?.time?.start) || 0;
      if (!prev || currStop >= prevStop) {
        latestByKey.set(key, t);
      }
    }

    const result: IAllureStatisticObject = {
      total: 0,
      passed: 0,
      failed: 0,
      other: 0,
      skipped: 0,
    };

    for (const t of latestByKey.values()) {
      if (t?.testStage?.topLevelStepsStatistics) {
        const stepStats = t.testStage.topLevelStepsStatistics;
        result.total += stepStats.total || 0;
        result.passed += stepStats.passed || 0;
        result.failed += stepStats.failed || 0;
        result.other += stepStats.other || 0;
      } else {
        // Fallback to test-level status if no step statistics available
        const status = (t?.status || t?.testStage?.status || "").toLowerCase();
        result.total += 1;

        switch (status) {
          case "passed":
            result.passed += 1;
            break;
          case "failed":
            result.failed += 1;
            break;
          case "skipped":
            result.skipped += 1;
            break;
          case "broken":
          case "unknown":
          default:
            result.other += 1;
        }
      }
    }

    return result;
  }

  public async generateExecutorInfo(): Promise<void> {
    const executionInfoFilePath = `${magicStrings.path.allureResults}/executor.json`;

    const buildNumber = process.env.CI_PIPELINE_ID || "0";
    const jobName = process.env.CI_JOB_NAME || "unknown job";
    const jobUrl = process.env.CI_JOB_URL || "";
    const suite = process.env.SUITE_NAME;
    const env = envHelper.environment;

    const data = {
      name: "gitlab",
      type: "gitlab",
      buildOrder: parseInt(buildNumber, 10),
      buildName: `${jobName}#${buildNumber}`,
      buildUrl: `${jobUrl}#${buildNumber}`,
      reportName: `${suite} - ${env} Report`,
      reportUrl: `https://${process.env.S3_BUCKET}/${env}/index.html`,
    };

    try {
      fs.writeFileSync(executionInfoFilePath, JSON.stringify(data), "utf-8");
    } catch (e) {
      console.error(
        `[Reporter] - Error during executor.json creation: ${e.message}`,
      );
    }
  }

  public static async uploadScreenshotReport(): Promise<string | undefined> {
    const screenshotHtmlPath = "artifacts/grouped-screenshots.html";

    if (!fs.existsSync(screenshotHtmlPath)) {
      console.warn(
        `[Reporter] - ${screenshotHtmlPath} does not exist, skipping screenshot report upload`,
      );
      return undefined;
    }

    try {
      const tempDir = "artifacts/screenshots-temp";
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const tempFilePath = `${tempDir}/grouped-screenshots.html`;
      fs.copyFileSync(screenshotHtmlPath, tempFilePath);

      fs.unlinkSync(tempFilePath);
      fs.rmdirSync(tempDir);

      return undefined;
    } catch (error) {
      console.error(
        `[Reporter] - Failed to upload screenshot report: ${error}`,
      );
      return undefined;
    }
  }
}
