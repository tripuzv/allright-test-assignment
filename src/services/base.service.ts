import { LoggerHelper } from "@helpers/logger/logger.helper.ts";
import { Page } from "@playwright/test";

import { LocalStorageHelper } from "@helpers/storage/local-storage.helper.ts";
import { Reporter } from "@reports/reporter.ts";
import { useTestContext } from "@context/use.test.context.ts";

export class BaseService {
  protected logger = LoggerHelper.getInstance().getLogger();
  protected localStorageHelper: LocalStorageHelper;
  protected page: Page;
  protected reporter: Reporter;
  constructor() {
    const { page, reporter } = useTestContext();
    this.page = page;
    this.reporter = reporter;
    this.localStorageHelper = new LocalStorageHelper();
  }

  async refresh() {
    await this.page.reload();
  }
}
