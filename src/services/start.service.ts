import { BaseService } from "@services/base.service.ts";
import { step } from "@decorators/step.ts";
import { envHelper } from "@helpers/env/env.helper.ts";
import { CookieBannerPo } from "@pom/general/cookie-banner.po.ts";
import { globalStore } from "@helpers/storage/global-data.storage.ts";

export type CookieAction = "accept" | "reject";

export interface IOpenAppOptions {
  path?: string;
  cookieAction?: CookieAction;
}

interface IExperiment {
  alias: string;
  variant: string;
}

export class StartService extends BaseService {
  private readonly cookieBanner = new CookieBannerPo();

  @step("Open start URL and handle cookie banner")
  async openApp(options: IOpenAppOptions = {}): Promise<void> {
    const path = options.path;
    const cookieAction = options.cookieAction ?? "accept";
    const url = `${envHelper.baseUrl}${path}`;

    this.logger.info(`Opening start URL: ${url}`);
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
    await this.cookieBanner.handle(cookieAction);
    await this.storeRunningExperiment();
  }

  @step("Store running experiment from localStorage")
  private async storeRunningExperiment(): Promise<void> {
    const raw = await this.localStorageHelper.getLocalStorageDataByKey(
      "experiments",
    );

    if (!raw) {
      this.logger.warn("experiments key not found in localStorage");
      return;
    }

    let experiments: IExperiment[];
    try {
      experiments = JSON.parse(raw);
    } catch (error) {
      this.logger.error(
        `Failed to parse experiments from localStorage: ${raw}`,
        error,
      );
      return;
    }

    const experiment = experiments?.[0];
    if (!experiment?.alias || !experiment?.variant) {
      this.logger.warn("experiments localStorage has no alias/variant");
      return;
    }

    globalStore.set("experimentAlias", experiment.alias);
    globalStore.set("experimentVariant", experiment.variant);
    globalStore.set("runningExperiment", experiment);

    await this.reporter.attach(
      "running experiment",
      `alias: ${experiment.alias}, variant: ${experiment.variant}`,
    );

    this.logger.info(
      `Running experiment: alias=${experiment.alias}, variant=${experiment.variant}`,
    );
  }
}
