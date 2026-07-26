import { BaseService } from "@services/base.service.ts";
import { assertHelper } from "@helpers/asserts/assert.helper.ts";
import { globalStore } from "@helpers/storage/global-data.storage.ts";
import { LoggerHelper } from "@helpers/logger/logger.helper.ts";
import { ScreenshotHelper } from "@helpers/screenshot/screenshot.helper.ts";
import { step } from "@decorators/step.ts";
import { templateMapper } from "@data/templates/onboarding.template.mapper.ts";
import { timeouts } from "@constants/timeouts.constants";
import { OnboardingPo } from "@pom/base/onboarding.po.ts";

export class OnboardingService extends BaseService {
  readonly logger = LoggerHelper.getInstance().getLogger();
  private screenShotHelper: ScreenshotHelper;

  constructor() {
    super();
    this.screenShotHelper = new ScreenshotHelper();
  }

  private getCurrentScreenPartPath(): string {
    const pathname = new URL(this.page.url()).pathname;
    const segments = pathname.split("/").filter(Boolean);
    return segments.at(-1) ?? "";
  }

  async runPreOnboardingValidation(): Promise<boolean> {
    const validationList = [];
    return assertHelper.assertArrayResultsTrue(validationList);
  }

  async getPageObjectConfig(): Promise<{
    pageObject: OnboardingPo;
    screenValues: Record<string, any>;
    analytics: Record<string, any>;
    screenName: string;
  }> {
    const screenName = this.getCurrentScreenPartPath();
    const config = templateMapper[screenName];

    if (!config) {
      throw new Error(`No page object mapped for screen: ${screenName}`);
    }

    const pageObject = new config.pageReference() as OnboardingPo;
    pageObject.screenUrl = screenName;

    return {
      pageObject,
      screenValues: config.screenValues,
      analytics: config.analytics,
      screenName,
    };
  }

  async reportChosenObOptions(): Promise<void> {
    const allObStorageData = globalStore.getAllData();
    const obChosenOptions = {};

    for (const data in allObStorageData) {
      if (data.includes("chosenOption__")) {
        const replacedChrosenOptions = data.replace("chosenOption__", "");
        obChosenOptions[replacedChrosenOptions] =
          allObStorageData[replacedChrosenOptions];
      }
    }
  }

  @step("Process Onboarding Flow")
  async passObFunnel(): Promise<void> {
    while (true) {
      const screenName = this.getCurrentScreenPartPath();
      const config = templateMapper[screenName];

      if (!config) {
        this.logger.info(
          `No mapper entry for screen "${screenName}", stopping onboarding funnel`,
        );
        break;
      }

      globalStore.set("currentScreen", screenName);
      this.logger.info(`Processing onboarding screen: ${screenName}`);

      await this.screenShotHelper.capture({ name: screenName });

      const pageObject = new config.pageReference() as OnboardingPo;
      pageObject.screenUrl = screenName;
      await pageObject.processScreen();

      await this.waitUntilOnboardingScreenChanges(screenName);
    }

    this.logger.info("Onboarding flow completed successfully");
  }

  @step("Wait for onboarding screen changes")
  private async waitUntilOnboardingScreenChanges(
    prevScreenRoute: string,
  ): Promise<void> {
    this.logger.info(`Waiting for screen to change from: ${prevScreenRoute}`);

    await this.page.waitForFunction(
      (expectedRoute) => {
        const segments = window.location.pathname.split("/").filter(Boolean);
        const current = segments[segments.length - 1] ?? "";
        return current !== expectedRoute;
      },
      prevScreenRoute,
      { timeout: timeouts.s },
    );

    await this.page.waitForTimeout(timeouts.xxs);
  }

  private validateFunnelTemplates(
    funnel: Array<{
      route: string;
      template?: string;
      baseScreen?: { template?: string };
    }>,
    firstPaymentScreenIndex: number,
  ): void {
    const endExclusive =
      firstPaymentScreenIndex >= 0 ? firstPaymentScreenIndex : funnel.length;
    const missing: Array<{ route: string; template: string }> = [];
    for (let i = 0; i < endExclusive; i++) {
      const page = funnel[i];
      const templateName = (page.template ?? page.baseScreen?.template) as
        | keyof typeof templateMapper
        | undefined;
      if (!templateName || !templateMapper[templateName]) {
        missing.push({
          route: page.route,
          template: String(templateName ?? "(missing)"),
        });
      }
    }
    if (missing.length > 0) {
      const details = missing
        .map((m) => `route "${m.route}" -> template "${m.template}"`)
        .join("; ");
      throw new Error(
        `Funnel template validation failed (onboarding segment only, before payment): the following screens have no matching entry in onboarding.template.mapper: ${details}. Add the template to onboarding.template.mapper or fix the funnel config.`,
      );
    }
  }
}
