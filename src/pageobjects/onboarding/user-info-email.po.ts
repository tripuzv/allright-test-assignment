import { OnboardingPo } from "@pom/base/onboarding.po.ts";
import { Locator } from "@playwright/test";
import { userDataHelper } from "@helpers/user-data/user-data.helper.ts";
import { globalStore } from "@helpers/storage/global-data.storage.ts";

export class UserInfoEmailPo extends OnboardingPo {
  private readonly stepName = "user-info-email";

  get root(): Locator {
    return this.page.locator(`[data-step-name="${this.stepName}"]`);
  }

  get title(): Locator {
    return this.root.locator(".text-title-2");
  }

  get emailInput(): Locator {
    return this.root
      .locator('input[type="email"], input[placeholder*="mail" i]')
      .first();
  }

  get continueButtonOnScreen(): Locator {
    return this.root.locator("button.btn.orange, button[type='submit']");
  }

  async processScreen(): Promise<void> {
    await this.waitForScreenReady(this.root, this.title);
    await this.emailInput.waitFor({ state: "visible" });

    const email = userDataHelper.generateEmail();
    await this.emailInput.fill(email);

    globalStore.set("userEmail", email);
    await this.elementHelper.attachChosenObOptions([email], this.stepName);

    await this.elementHelper.waitForClickable(this.continueButtonOnScreen);
    await this.elementHelper.click(this.continueButtonOnScreen);

    this.logger.info(`${this.stepName} processed, email: ${email}`);
  }
}
