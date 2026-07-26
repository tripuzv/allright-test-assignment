import { Page } from "@playwright/test";
import { Reporter } from "@reports/reporter.ts";
import { useTestContext } from "@context/use.test.context.ts";
import { LoggerHelper } from "@helpers/logger/logger.helper.ts";
import { Logger } from "log4js";

export class BaseHelper {
  protected page: Page;
  protected reporter: Reporter;
  protected logger: Logger;

  constructor() {
    const { page, reporter } = useTestContext();
    this.page = page;
    this.reporter = reporter;
    this.logger = LoggerHelper.getInstance().getLogger();
  }
}
