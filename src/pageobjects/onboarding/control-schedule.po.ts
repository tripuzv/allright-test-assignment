import { OnboardingPo } from "@pom/base/onboarding.po.ts";
import { Locator } from "@playwright/test";

export class ControlSchedulePo extends OnboardingPo {
  private readonly stepName = "control-schedule";

  get root(): Locator {
    return this.page.locator(`[data-step-name="${this.stepName}"]`);
  }

  get title(): Locator {
    return this.root.locator(".text-title-2");
  }

  get nextButton(): Locator {
    return this.root.locator("button.btn.fuchsia-secondary");
  }

  async processScreen(): Promise<void> {
    await this.waitForScreenReady(this.root, this.title);
    await this.elementHelper.waitForClickable(this.nextButton);
    await this.elementHelper.click(this.nextButton);
    this.logger.info(`${this.stepName} info screen processed`);
  }
}
