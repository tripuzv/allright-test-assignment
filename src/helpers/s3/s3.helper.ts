import { exec } from "child_process";
import { LoggerHelper } from "@helpers/logger/logger.helper.ts";
import { envHelper } from "@helpers/env/env.helper.ts";

const logger = LoggerHelper.getInstance().getLogger();

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function getDateAndTime(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("/");
}

export const s3Helper = {
  async syncFolderWithBucket(
    folderPath: string,
    bucketPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `aws s3 sync ${folderPath} s3://${bucketPath} --only-show-errors`,
        (error) => {
          if (error) {
            logger.error(
              `[S3 Helper] Failed to sync ${folderPath} → s3://${bucketPath}: ${error.message}`,
            );
            reject(error);
          } else {
            logger.info(
              `[S3 Helper] Synced ${folderPath} → s3://${bucketPath}`,
            );
            resolve();
          }
        },
      );
    });
  },

  buildBucketPath(reportType: string): string {
    const stamp = process.env.REPORT_TIMESTAMP || getDateAndTime();
    if (!process.env.REPORT_TIMESTAMP) {
      process.env.REPORT_TIMESTAMP = stamp;
    }
    const server = envHelper.environment;
    const suiteName = envHelper.suite;
    const s3Bucket = envHelper.s3Bucket;
    return `${s3Bucket}/web/${server}/${suiteName}/${reportType}/${stamp}`;
  },

  buildPublicUrl(bucketPath: string, entryFile = "index.html"): string {
    const domain = (envHelper.s3Domain || "").replace(/\/$/, "");
    const relative = bucketPath.includes("/")
      ? bucketPath.split("/").slice(1).join("/")
      : bucketPath;
    if (!domain) {
      return `s3://${bucketPath}/${entryFile}`;
    }
    return `${domain}/${relative}/${entryFile}`;
  },

  get isConfigured(): boolean {
    return Boolean(envHelper.s3Bucket && envHelper.s3Domain);
  },
};
