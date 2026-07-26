import * as log4js from "log4js";
import { magicStrings } from "@data/magic-strings/magicStrings.ts";
import { dateHelper } from "@helpers/date/date.helper.ts";
import { envHelper } from "@helpers/env/envHelper.ts";

export class LoggerHelper {
  private static instance: LoggerHelper;
  private readonly logger: log4js.Logger;
  private sessionTime = dateHelper.getSessionTime();
  private logFilename = `${magicStrings.path.logs}/${this.sessionTime}.log`;

  private constructor() {
    log4js.configure({
      appenders: {
        console: {
          type: "console",
          layout: {
            type: "pattern",
            pattern: `%d [%p] [p-${process.env.TEST_PARALLEL_INDEX ?? "0"}] %m`,
          },
        },
        file: {
          type: "file",
          filename: this.logFilename,
          layout: {
            type: "pattern",
            pattern: `%d [%p] [p-${process.env.TEST_PARALLEL_INDEX ?? "0"}] %m`,
          },
        },
      },
      categories: {
        default: {
          appenders: ["console", "file"],
          level: envHelper.getLogLevel(),
        },
      },
    });
    this.logger = log4js.getLogger();
  }

  public static getInstance(): LoggerHelper {
    if (!LoggerHelper.instance) {
      LoggerHelper.instance = new LoggerHelper();
    }
    return LoggerHelper.instance;
  }

  public getLogger(): log4js.Logger {
    return this.logger;
  }
}
