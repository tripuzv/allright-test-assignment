import { OnboardingPo } from "@pom/base/onboarding.po.ts";
import { Locator } from "@playwright/test";
import { userDataHelper } from "@helpers/user-data/user-data.helper.ts";
import { globalStore } from "@helpers/storage/global-data.storage.ts";

export class ChildNamePo extends OnboardingPo {
  private readonly stepName = "child-name";

  get root(): Locator {
    return this.page.locator(`[data-step-name="${this.stepName}"]`);
  }

  get title(): Locator {
    return this.root.locator(".text-title-2");
  }

  get nameInput(): Locator {
    return this.root.locator('input[name="name"]');
  }

  get continueButtonOnScreen(): Locator {
    return this.root.locator("button.btn.orange, button[type='submit']");
  }

  async processScreen(): Promise<void> {
    await this.waitForScreenReady(this.root, this.title);
    await this.nameInput.waitFor({ state: "visible" });

    const name = userDataHelper.getRandom.firstName();
    await this.nameInput.fill(name);

    globalStore.set("childName", name);
    await this.elementHelper.setChosenObOptions([name], this.stepName);
    await this.elementHelper.attachChosenObOptions([name], this.stepName);

    await this.elementHelper.waitForClickable(this.continueButtonOnScreen);
    await this.elementHelper.click(this.continueButtonOnScreen);

    this.logger.info(`${this.stepName} processed, child name: ${name}`);
  }
}
