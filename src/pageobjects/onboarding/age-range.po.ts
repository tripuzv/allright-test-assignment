import { OnboardingPo } from "@pom/base/onboarding.po.ts";
import { Locator } from "@playwright/test";
import { timeouts } from "@constants/timeouts.constants.ts";

export class AgeRangePo extends OnboardingPo {
  get root(): Locator {
    return this.page.locator('[data-step-name="age-range"]');
  }

  get title(): Locator {
    return this.root.locator(".text-title-2");
  }

  get optionsContainer(): Locator {
    return this.root.locator(".flex.flex-wrap");
  }

  get optionsList(): Locator {
    return this.root.locator('button[type="button"]');
  }

  get options(): Promise<Locator[]> {
    return this.optionsList.all();
  }

  async processScreen(): Promise<void> {
    await this.root.waitFor({ state: "visible", timeout: timeouts.s });
    await this.title.waitFor({ state: "visible", timeout: timeouts.s });
    await this.chooseRandomOption();
  }
}
