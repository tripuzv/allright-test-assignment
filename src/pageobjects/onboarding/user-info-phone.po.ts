import { OnboardingPo } from "@pom/base/onboarding.po.ts";
import { expect, Locator } from "@playwright/test";
import { CountryNames } from "phone-number-generator-js";
import { timeouts } from "@constants/timeouts.constants.ts";
import { userDataHelper } from "@helpers/user-data/user-data.helper.ts";
import { globalStore } from "@helpers/storage/global-data.storage.ts";

export class UserInfoPhonePo extends OnboardingPo {
  private readonly stepName = "user-info-phone";

  get root(): Locator {
    return this.page.locator(`[data-step-name="${this.stepName}"]`);
  }

  get title(): Locator {
    return this.root.locator(".text-title-2");
  }

  get countryButton(): Locator {
    return this.root.locator("button.iti__selected-country");
  }

  get phoneInput(): Locator {
    return this.root.locator("input.iti__tel-input, input[type='tel']").first();
  }

  get continueButtonOnScreen(): Locator {
    return this.root.locator("button.btn.orange, button[type='submit']");
  }

  async processScreen(): Promise<void> {
    await this.waitForScreenReady(this.root, this.title);
    await this.phoneInput.waitFor({ state: "visible" });
    await this.countryButton.waitFor({ state: "visible" });

    const countryName = await this.getSelectedCountryName();
    const { e164, national } = userDataHelper.generateValidPhone(countryName);

    await this.clearPhoneInput();
    await this.phoneInput.pressSequentially(national, { delay: 30 });
    await this.phoneInput.blur();

    const e164Digits = e164.replace(/\D/g, "");
    await expect
      .poll(async () => (await this.phoneInput.inputValue()).replace(/\D/g, ""))
      .toMatch(new RegExp(`^(${national}|${e164Digits})$`));

    const enteredValue = (await this.phoneInput.inputValue()).replace(
      /\s+/g,
      "",
    );
    this.logger.info(
      `${this.stepName}: country=${countryName}, e164=${e164}, national=${national}, entered=${enteredValue}`,
    );

    await this.elementHelper.attachChosenObOptions([e164], this.stepName);
    globalStore.set("userPhone", e164);

    await this.elementHelper.waitForClickable(this.continueButtonOnScreen, {
      timeout: timeouts.s,
      throwError: true,
    });
    await this.elementHelper.click(this.continueButtonOnScreen);

    this.logger.info(`${this.stepName} processed, phone: ${e164}`);
  }

  private async clearPhoneInput(): Promise<void> {
    await this.phoneInput.click();
    await this.phoneInput.press(
      process.platform === "darwin" ? "Meta+A" : "Control+A",
    );
    await this.phoneInput.press("Backspace");
    await this.phoneInput.fill("");
    await expect(this.phoneInput).toHaveValue("");
    await this.page.waitForTimeout(timeouts.animation);
  }

  private async getSelectedCountryName(): Promise<
    (typeof CountryNames)[keyof typeof CountryNames]
  > {
    const countryTitle = await this.countryButton.getAttribute("title");
    if (!countryTitle) {
      throw new Error("Selected country title is missing on phone flag button");
    }

    const matchedCountry = Object.values(CountryNames).find(
      (name) => name.toLowerCase() === countryTitle.toLowerCase(),
    );

    if (!matchedCountry) {
      throw new Error(
        `Country "${countryTitle}" is not supported by phone-number-generator-js`,
      );
    }

    return matchedCountry;
  }
}
