import { OnboardingPo } from "@pom/base/onboarding.po.ts";
import { Locator } from "@playwright/test";
import { mathHelper } from "@helpers/math/math.helper.ts";

export class ChildHobbyPo extends OnboardingPo {
  private readonly stepName = "child-hobby";

  get root(): Locator {
    return this.page.locator(`[data-step-name="${this.stepName}"]`);
  }

  get title(): Locator {
    return this.root.locator(".text-title-2");
  }

  get hobbyOptions(): Locator {
    return this.root.locator("button[data-mode]");
  }

  get continueButtonOnScreen(): Locator {
    return this.root.locator("button.btn.orange");
  }

  get options(): Promise<Locator[]> {
    return this.hobbyOptions.all();
  }

  async processScreen(): Promise<void> {
    await this.waitForScreenReady(this.root, this.title);

    const options = await this.options;
    if (!options.length) {
      throw new Error(`No hobby options found on ${this.stepName}`);
    }

    const maxSelect = Math.min(3, options.length);
    const selectCount = mathHelper.random.getNumber(maxSelect) + 1;
    const selectedTexts: string[] = [];
    const usedIndexes = new Set<number>();

    while (usedIndexes.size < selectCount) {
      const index = mathHelper.random.getNumber(options.length);
      if (usedIndexes.has(index)) {
        continue;
      }
      usedIndexes.add(index);

      const option = options[index];
      const text = ((await option.textContent()) || "")
        .trim()
        .replace(/\s+/g, " ");
      selectedTexts.push(text);

      await this.elementHelper.waitForClickable(option);
      await this.elementHelper.click(option, true);
    }

    await this.elementHelper.attachChosenObOptions(
      selectedTexts,
      this.stepName,
    );

    await this.elementHelper.waitForClickable(this.continueButtonOnScreen);
    await this.elementHelper.click(this.continueButtonOnScreen);

    this.logger.info(
      `${this.stepName} processed, selected hobbies: ${selectedTexts.join(", ")}`,
    );
  }
}
