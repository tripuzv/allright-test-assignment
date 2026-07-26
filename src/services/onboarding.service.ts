import { BaseService } from "@services/base.service.ts";
import { LoggerHelper } from "@helpers/logger/logger.helper.ts";
import { ScreenshotHelper } from "@helpers/screenshot/screenshot.helper.ts";
import { step } from "@decorators/step.ts";
import { templateMapper } from "@data/templates/onboarding.template.mapper.ts";
import { timeouts } from "@constants/timeouts.constants";
import { OnboardingPo } from "@pom/base/onboarding.po.ts";
import { ApiNetworkInterceptor } from "@interceptors/api-network.interceptor.ts";
import { OnboardingApiValidator } from "@validators/onboarding-api.validator.ts";
import test from "@playwright/test";
import { globalStore } from "@helpers/storage/global-data.storage.ts";

export class OnboardingService extends BaseService {
  readonly logger = LoggerHelper.getInstance().getLogger();
  private screenShotHelper: ScreenshotHelper;
  private apiInterceptor: ApiNetworkInterceptor;
  private apiValidator: OnboardingApiValidator;

  constructor() {
    super();
    this.screenShotHelper = new ScreenshotHelper();
    this.apiInterceptor = new ApiNetworkInterceptor(this.page);
    this.apiValidator = new OnboardingApiValidator(this.apiInterceptor);
  }

  private getCurrentScreenPartPath(): string {
    const pathname = new URL(this.page.url()).pathname;
    const segments = pathname.split("/").filter(Boolean);
    return segments.at(-1) ?? "";
  }

  @step("Process Onboarding Flow")
  async passObFunnel(): Promise<void> {
    this.apiInterceptor.start();

    try {
      while (true) {
        const screenName = this.getCurrentScreenPartPath();
        const config = templateMapper[screenName];

        if (!config) {
          this.logger.info(
            `No mapper entry for screen "${screenName}", stopping onboarding funnel`,
          );
          break;
        }

        const pageObject = new config.pageReference() as OnboardingPo;
        pageObject.screenUrl = screenName;

        let isLastStep = false;

        await test.step(`Process ${screenName} screen`, async () => {
          globalStore.set("currentScreen", screenName);
          this.logger.info(`Processing onboarding screen: ${screenName}`);

          await this.screenShotHelper.capture({ name: screenName });
          await pageObject.processScreen();
          await this.validateApisAfterScreen(screenName);

          if (pageObject.isLastStep) {
            this.logger.info(
              `Last onboarding screen "${screenName}" processed, stopping funnel`,
            );
            globalStore.set("funnelCompleted", true);
            isLastStep = true;
            return;
          }

          await this.waitUntilOnboardingScreenChanges(screenName);
        });

        if (isLastStep) {
          break;
        }
      }

      await this.apiValidator.validateBusinessOutcomes();
      this.logger.info("Onboarding flow completed successfully");
    } finally {
      this.apiInterceptor.stop();
    }
  }

  private async validateApisAfterScreen(screenName: string): Promise<void> {
    switch (screenName) {
      case "child-hobby":
        await this.apiValidator.validateChildHobbies();
        break;
      case "user-info-phone":
        await this.apiValidator.validateUserCreate();
        break;
      case "user-info-email":
        await this.apiValidator.validateUserEmailUpdate();
        break;
      default:
        break;
    }
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
}
