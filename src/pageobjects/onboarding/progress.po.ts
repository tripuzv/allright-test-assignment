import { OnboardingPo } from "@pom/base/onboarding.po.ts";
import { Locator } from "@playwright/test";
import { mathHelper } from "@helpers/math/math.helper.ts";

export class ProgressPo extends OnboardingPo {
  private readonly stepName = "progress";

  get root(): Locator {
    return this.page.locator(`[data-step-name="${this.stepName}"]`);
  }

  get title(): Locator {
    return this.root.locator(".text-title-2");
  }

  get optionsList(): Locator {
    return this.root.locator("button[data-mode]");
  }

  get options(): Promise<Locator[]> {
    return this.optionsList.all();
  }

  async processScreen(): Promise<void> {
    await this.waitForScreenReady(this.root, this.title);

    const options = await this.options;
    if (!options.length) {
      throw new Error(`No options found on ${this.stepName}`);
    }

    const randomIndex = mathHelper.random.getNumber(options.length);
    const option = options[randomIndex];
    const text = ((await option.textContent()) || "").trim().replace(/\s+/g, " ");

    await this.elementHelper.setChosenObOptions([text], this.stepName);
    await this.elementHelper.attachChosenObOptions([text], this.stepName);
    await this.elementHelper.waitForClickable(option);
    await this.elementHelper.click(option);

    this.logger.info(`${this.stepName} processed, selected: ${text}`);
  }
}
