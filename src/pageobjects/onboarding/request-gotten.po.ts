import { OnboardingPo } from "@pom/base/onboarding.po.ts";
import { expect, Locator } from "@playwright/test";
import { timeouts } from "@constants/timeouts.constants.ts";

export class RequestGottenPo extends OnboardingPo {
  private readonly stepName = "request-gotten";

  get isLastStep(): boolean {
    return true;
  }

  get root(): Locator {
    return this.page.locator("body.application_request-gotten");
  }

  get successBanner(): Locator {
    return this.page.locator("section.bg-green-10");
  }

  async processScreen(): Promise<void> {
    await this.root.waitFor({ state: "attached", timeout: timeouts.s });
    await this.successBanner.waitFor({ state: "visible", timeout: timeouts.s });

    await expect(this.page).toHaveURL(new RegExp(`/${this.stepName}(?:\\?|$)`));
    await expect(this.successBanner).toBeVisible();

    await this.elementHelper.attachChosenObOptions(
      ["request-gotten-validated"],
      this.stepName,
    );

    this.logger.info(
      `${this.stepName} validated as funnel completion (thank-you screen)`,
    );
  }
}
