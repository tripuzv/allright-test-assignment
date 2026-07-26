import {
  IAllureStep,
  IAllureTestResult,
  IStepStatistics,
  ITestCaseStatisticsReport,
  ProcessedStepInfo,
} from "@reports/types/allure-stat.types.ts";
import { magicStrings } from "@data/magic-strings/magic.strings.ts";
import path from "path";
import fsPromises from "fs/promises";

const techStepName = ["trace", "error-context", "screenshot"];

export class StatisticUtil {
  private static calculateSubStepStats(steps: IAllureStep[]): IStepStatistics {
    const stats: IStepStatistics = { total: 0, passed: 0, failed: 0, other: 0 };
    for (const step of steps) {
      stats.total++;
      if (step.status === "passed") stats.passed++;
      else if (step.status === "failed") stats.failed++;
      else stats.other++;

      if (step.steps?.length) {
        const nested = this.calculateSubStepStats(step.steps);
        stats.total += nested.total;
        stats.passed += nested.passed;
        stats.failed += nested.failed;
        stats.other += nested.other;
      }
    }
    return stats;
  }

  private static processTopLevelSteps(
    steps: IAllureStep[],
  ): ProcessedStepInfo[] {
    return steps
      .filter((s) => !techStepName.includes(s.name.toLowerCase()))
      .map((step) => ({
        name: step.name,
        duration: step.time.duration,
        status: step.status,
        statusMessage: step.statusMessage?.split("\n")[0],
        subStepsStatistics: this.calculateSubStepStats(step.steps || []),
      }));
  }

  private static calculateTopLevelStepOverallStats(
    steps: IAllureStep[],
  ): IStepStatistics {
    const stats: IStepStatistics = { total: 0, passed: 0, failed: 0, other: 0 };
    steps
      .filter((s) => !techStepName.includes(s.name.toLowerCase()))
      .forEach((step) => {
        stats.total++;
        if (step.status === "passed") stats.passed++;
        else if (step.status === "failed") stats.failed++;
        else stats.other++;
      });
    return stats;
  }

  public static async prepareStatistics(): Promise<void> {
    const testCaseFilePaths: string[] = magicStrings.path.allureTestCases;
    const outputDir = magicStrings.path.allureSummaryPath;

    try {
      await fsPromises.mkdir(outputDir, { recursive: true });

      if (!testCaseFilePaths.length) {
        console.warn(
          "[StatisticUtil] - No Allure test-case files found, skipping statistics",
        );
        return;
      }

      const results: Partial<ITestCaseStatisticsReport>[] = [];
      const summary = {
        total: 0,
        passed: 0,
        failed: 0,
        broken: 0,
        skipped: 0,
        other: 0,
        totalDuration: 0,
      } as const;
      const sums: any = { ...summary };

      for (const filePath of testCaseFilePaths) {
        const raw = await fsPromises.readFile(filePath, "utf-8");
        const report: IAllureTestResult = JSON.parse(raw);

        const processed: Partial<ITestCaseStatisticsReport> = {
          uid: report.uid,
          name: report.name,
          status: report.status,
          statusMessage: report.statusMessage,
          time: {
            start: new Date(report.time.start).toISOString(),
            stop: new Date(report.time.stop).toISOString(),
            duration: report.time.duration,
          },
          flaky: report.flaky,
          parameters: report.parameters || [],
          additionalInfo: {
            retriesCount: report.retriesCount,
            severity: report.extra?.severity,
            tags: report.extra?.tags,
          },
        };

        if (report.testStage?.steps?.length) {
          processed.testStage = {
            status: report.testStage.status,
            statusMessage: report.testStage.statusMessage?.split("\n")[0],
            topLevelSteps: this.processTopLevelSteps(report.testStage.steps),
            topLevelStepsStatistics: this.calculateTopLevelStepOverallStats(
              report.testStage.steps,
            ),
          };
        }

        results.push(processed);

        sums.total += 1;
        const st = (report.status || "other").toLowerCase();
        if (st === "passed") sums.passed += 1;
        else if (st === "failed") sums.failed += 1;
        else if (st === "broken") sums.broken += 1;
        else if (st === "skipped") sums.skipped += 1;
        else sums.other += 1;

        if (report.time?.duration) sums.totalDuration += report.time.duration;
      }

      const outputPath = path.join(outputDir, "test_stat_summary.json");
      const payload = {
        generatedAt: new Date().toISOString(),
        summary: sums,
        tests: results,
      };
      await fsPromises.writeFile(outputPath, JSON.stringify(payload, null, 2));
    } catch (err: any) {
      const outputPath = path.join(outputDir, "test_stat_summary.json");
      const fallback = {
        error: "Error preparing statistics",
        message: err.message,
        stack: err.stack,
      };
      try {
        await fsPromises.writeFile(
          outputPath,
          JSON.stringify(fallback, null, 2),
        );
      } catch { }
    }
  }
}
