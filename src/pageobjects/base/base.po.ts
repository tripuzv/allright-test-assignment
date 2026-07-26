import { Page } from "@playwright/test";
import { Reporter } from "@reports/reporter.ts";
import { useTestContext } from "@context/use.test.context.ts";
import { Logger } from "log4js";
import { LoggerHelper } from "@helpers/logger/logger.helper.ts";
import { ElementHelper } from "@helpers/elements/element.helper.ts";

export class BasePo {
  protected page: Page;
  protected reporter: Reporter;
  protected logger: Logger;
  protected elementHelper: ElementHelper;

  constructor() {
    const { page, reporter } = useTestContext();
    this.page = page;
    this.reporter = reporter;
    this.logger = LoggerHelper.getInstance().getLogger();
    this.elementHelper = new ElementHelper();
  }
}
