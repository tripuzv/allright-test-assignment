import { BaseService } from "@services/base.service.ts";
import { assertHelper } from "@helpers/asserts/assert.helper.ts";
import { globalStore } from "@storage/globalDataStorage.ts";
import { LoggerHelper } from "@helpers/logger/logger.helper.ts";
import { ScreenshotHelper } from "@helpers/screenshot/screenshots.helper.ts";
import { step } from "@decorators/step.ts";
import { FunnelHelper } from "@helpers/funnel/funnel.helper";
import { FunnelPage } from "@helpers/funnel/types/funnel.types";
import { templateMapper } from "@data/ob.template.mapper";
import { templateMapper as paymentTemplateMapper } from "@data/payment.template.mapper";
import { timeouts } from "@constants/timeouts.constants";
import test from "@playwright/test";
import { AmplitudeValidator } from "../validators/amplitude/amplitude.validator.ts";

export class OnboardingService extends BaseService {
  readonly logger = LoggerHelper.getInstance().getLogger();
  private screenShotHelper: ScreenshotHelper;
  private funnelHelper: FunnelHelper;
  private amplitudeValidator: AmplitudeValidator;

  constructor() {
    super();
    this.screenShotHelper = new ScreenshotHelper();
    this.funnelHelper = new FunnelHelper();
    this.amplitudeValidator = new AmplitudeValidator();
  }

  async runPreOnboardingValidation(): Promise<boolean> {
    const validationList = [
    ];
    return assertHelper.assertArrayResultsTrue(validationList);
  }

  async getPageObjectConfig(): Promise<{
    pageObject: any;
    screenValues: any;
    analytics: any;
  }> {
    throw new Error("getPageObjectConfig is not available");
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
    const funnelData = await this.funnelHelper.getFunnelData();

    const firstPaymentScreenIndex =
      this.getFirstMonetizationScreenIndex(funnelData.funnel);

    const lastObScreenIndex =
      firstPaymentScreenIndex === -1
        ? funnelData.funnel.length
        : firstPaymentScreenIndex;

    this.logger.info(
      `Processing ${lastObScreenIndex} onboarding screens (monetization segment starts at funnel index ${firstPaymentScreenIndex}; boundary = route "payment" or template key from payment.template.mapper)`,
    );
    this.validateFunnelTemplates(funnelData.funnel, firstPaymentScreenIndex);
    await this.validateInitialEventsForOnboarding();
    for (let index = 0; index < lastObScreenIndex; index++) {
      const funnelPage = funnelData.funnel[index];
      const templateName = (funnelPage.template || funnelPage.baseScreen?.template) as keyof typeof templateMapper;
      const screenRoute = funnelPage.route;
      const pageObject = templateMapper[templateName];
      await test.step(`Process ${screenRoute} screen`, async () => {
        const skipPage = await this.funnelHelper.shouldSkipOnboardingPage(funnelPage);
        if (skipPage) {
          this.logger.info(
            `Skipping onboarding page ${index + 1}/${lastObScreenIndex}: ${funnelPage.route} (skipPageSettings conditions met, data from URL)`,
          );
          const isLastObScreen = index === lastObScreenIndex - 1;
          if (!isLastObScreen) {
            await this.waitUntilOnboardingScreenChanges(screenRoute);
          }
          return;
        }

        if (!pageObject) {
          this.logger.warn(
            `Template "${templateName}" not found in templateMapper for route "${funnelPage.route}"`,
          );
          throw new Error(`Template "${templateName}" not found in templateMapper for route "${funnelPage.route}"`);
        }

        this.logger.info(
          `Processing onboarding page ${index + 1}/${lastObScreenIndex}: ${funnelPage.route} (${funnelPage.analyticRoute}) with template: ${templateName}`,
        );

        const pageObjectInstance = new pageObject.pageReference();
        const screenshotName = screenRoute === "/" ? "firstObScreen" : `onboarding_${screenRoute}`;
        await this.screenShotHelper.capture({ name: screenshotName });
        // @ts-ignore
        await pageObjectInstance?.processScreen(funnelPage);

        if (index === 0) {
          await this.amplitudeValidator.validateEventType({
            notDefaultEventType: "Onboarding_started",
          });
        }

        await this.amplitudeValidator.validateEventType({
          screenRoute: funnelPage.analyticRoute,
          eventType: "_screen_load",
        });

        const isLastObScreen = index === lastObScreenIndex - 1;
        if (!isLastObScreen) {
          await this.waitUntilOnboardingScreenChanges(screenRoute);
        }
      })
    };
    this.logger.info("Onboarding flow completed successfully");
  }

  @step("Wait for onboarding screen changes")
  private async waitUntilOnboardingScreenChanges(
    prevScreenRoute: string,
  ): Promise<void> {
    this.logger.info(
      `Waiting for screen to change from: ${prevScreenRoute}`,
    );

    await this.page.waitForFunction(
      (expectedRoute) => {
        const funnelData = (window as any)["__FUNNEL_DATA__"];
        return funnelData && funnelData.currentPage !== expectedRoute;
      },
      prevScreenRoute,
      { timeout: timeouts.s },
    );

    const funnelData = await this.funnelHelper.getFunnelData();
    this.logger.info(
      `Screen changed to: ${funnelData.currentPage}`,
    );
    await this.page.waitForTimeout(timeouts.xxs);
  }

  private getFirstMonetizationScreenIndex(funnel: FunnelPage[]): number {
    return funnel.findIndex((page) => {
      if (page.analyticRoute === "payment" || page.route === "payment") {
        return true;
      }
      const templateName = page.template ?? page.baseScreen?.template;
      return (
        typeof templateName === "string" &&
        templateName in paymentTemplateMapper
      );
    });
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
      const templateName =
        (page.template ?? page.baseScreen?.template) as keyof typeof templateMapper | undefined;
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
        `Funnel template validation failed (onboarding segment only, before payment): the following screens have no matching entry in ob.template.mapper: ${details}. Add the template to ob.template.mapper or fix the funnel config.`,
      );
    }
  }

  @step("Validate initial events for onboarding funnel")
  async validateInitialEventsForOnboarding(): Promise<void> {
    const inittialEvents = ["$identify", "Session_start"];
    for (const event of inittialEvents) {
      await this.amplitudeValidator.validateEventType({ notDefaultEventType: event });
    }
  }
}
