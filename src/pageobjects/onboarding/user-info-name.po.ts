import { OnboardingPo } from "@pom/base/onboarding.po.ts";
import { Locator } from "@playwright/test";
import { timeouts } from "@constants/timeouts.constants.ts";
import { userDataHelper } from "@helpers/user-data/user-data.helper.ts";
import { envHelper } from "@helpers/env/env.helper.ts";
import { globalStore } from "@helpers/storage/global-data.storage.ts";

export class UserInfoNamePo extends OnboardingPo {
  private readonly stepName = "user-info-name";

  get root(): Locator {
    return this.page.locator(`[data-step-name="${this.stepName}"]`);
  }

  get title(): Locator {
    return this.root.locator(".text-title-2");
  }

  get parentNameInput(): Locator {
    return this.root.locator('input[name="name"]');
  }

  get friendCodeToggle(): Locator {
    return this.root.locator("button.reg-form__inv-code__info");
  }

  get continueButtonOnScreen(): Locator {
    return this.root.locator("button.btn.orange, button[type='submit']");
  }

  get whoFillsModal(): Locator {
    return this.page.locator("dialog.ui-modal");
  }

  get whoFillsModalTitle(): Locator {
    return this.whoFillsModal.locator(".ui-modal__body .text-h2, .ui-modal__body p").first();
  }

  get whoFillsChildButton(): Locator {
    return this.whoFillsModal
      .locator("button[data-mode]")
      .filter({ has: this.page.locator('img[src*="baby"]') });
  }

  get whoFillsParentButton(): Locator {
    return this.whoFillsModal
      .locator("button[data-mode]")
      .filter({ has: this.page.locator('img[src*="woman"]') });
  }

  async processScreen(): Promise<void> {
    await this.waitForScreenReady(this.root, this.title);
    await this.parentNameInput.waitFor({ state: "visible" });

    const name = userDataHelper.getRandom.firstName();
    await this.parentNameInput.fill(name);

    globalStore.set("parentName", name);
    await this.elementHelper.setChosenObOptions([name], this.stepName);
    await this.elementHelper.attachChosenObOptions([name], this.stepName);

    await this.elementHelper.waitForClickable(this.continueButtonOnScreen);
    await this.elementHelper.click(this.continueButtonOnScreen);

    await this.processWhoFillsModal();

    this.logger.info(`${this.stepName} processed, parent name: ${name}`);
  }

  private async processWhoFillsModal(): Promise<void> {
    await this.whoFillsModal.waitFor({
      state: "visible",
      timeout: timeouts.s,
    });
    await this.whoFillsChildButton.waitFor({
      state: "visible",
      timeout: timeouts.s,
    });

    const whoFills = envHelper.whoFillsForm;
    const whoFillsButton =
      whoFills === "parent"
        ? this.whoFillsParentButton
        : this.whoFillsChildButton;

    await this.elementHelper.waitForClickable(whoFillsButton);
    await this.elementHelper.click(whoFillsButton);

    const whoFillsText = ((await whoFillsButton.textContent()) || "").trim();
    await this.elementHelper.setChosenObOptions(
      [whoFillsText],
      `${this.stepName}__who-fills`,
    );
    await this.elementHelper.attachChosenObOptions(
      [whoFillsText],
      `${this.stepName}__who-fills`,
    );

    await this.whoFillsModal
      .waitFor({ state: "hidden", timeout: timeouts.s })
      .catch(() => undefined);

    this.logger.info(
      `${this.stepName} who-fills modal processed: ${whoFills} (${whoFillsText})`,
    );
  }
}
