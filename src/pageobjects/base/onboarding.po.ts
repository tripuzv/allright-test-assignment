import { BasePo } from "./base.po.ts";
import { Locator } from "@playwright/test";
import { LocalStorageHelper } from "@helpers/storage/localstorage.helper.ts";
import { FunnelPage, ScreenSettings } from "@helpers/funnel/types/funnel.types.ts";
import { timeouts } from "@constants/timeouts.constants.ts";

export abstract class OnboardingPo extends BasePo {
  private _screenUrl = "";
  protected localStorageHelper: LocalStorageHelper;

  constructor() {
    super();
    this.localStorageHelper = new LocalStorageHelper();
  }

  abstract processScreen(funnelPage: FunnelPage): Promise<void>;

  set screenUrl(value: string) {
    this._screenUrl = value;
  }

  get screenUrl(): string {
    return this._screenUrl;
  }

  get options(): Promise<Locator[]> {
    return this.page.locator("[data-testid^='obOption-']").all();
  }

  get continueButton(): Locator {
      return this.page.getByTestId('obContinueBtn')
  }

  get bottomContainer(): Locator {
    return this.page.locator('div[class*="bottomContainer"]:not([class*="bottomContainerFake"])')
  }
  
  get progressBar(): Locator {
    return this.page.getByTestId("progressBar");
  }
  protected getScreenSettings(funnelPage: FunnelPage): ScreenSettings | undefined {
    return funnelPage.settings ?? funnelPage.baseScreen?.settings;
}

  async clickContinueButton(force = false): Promise<void> {
    const continueButtonElement = await this.bottomContainer.isVisible() ? this.bottomContainer.getByTestId('obContinueBtn') : this.continueButton;
    await continueButtonElement.waitFor({ state: 'visible', timeout: timeouts.s });
    await this.elementHelper.waitForClickable(continueButtonElement);
    await this.elementHelper.scrollToEnd();
    await this.elementHelper.click(continueButtonElement, force);
    this.logger.info('Continue button clicked');
  }

  async isInputOptionSelected(
    options: Locator[],
    index: number,
  ): Promise<boolean> {
    if (index < 0 || index >= options.length) {
      throw new Error(`Index ${index} is out of bounds for options array.`);
    }
    return options[index].isChecked();
  }

  async selectOptionByIndex(options: Locator[], index: number, isForce?: boolean): Promise<void> {
    if (index < 0 || index >= options.length) {
      throw new Error(`Index ${index} is out of bounds for options array.`);
    }
    await this.elementHelper.waitForClickable(options[index]);
    await this.elementHelper.click(options[index], isForce ?? false);
  }

  async selectRandomOption(options: Locator[], isForce?: boolean): Promise<void> {
    const randomIndex = Math.floor(Math.random() * options.length);
    const optionText = await options[randomIndex].textContent();
    await this.selectOptionByIndex(options, randomIndex, isForce);
    this.logger.info(`Selected option ${randomIndex}, ${optionText}`);
  }
}
