import { BasePo } from "./base.po.ts";
import { Locator } from "@playwright/test";
import { LocalStorageHelper } from "@helpers/storage/local-storage.helper.ts";
import { timeouts } from "@constants/timeouts.constants.ts";

export abstract class OnboardingPo extends BasePo {
  private _screenUrl = "";
  protected localStorageHelper: LocalStorageHelper;

  constructor() {
    super();
    this.localStorageHelper = new LocalStorageHelper();
  }

  abstract processScreen(): Promise<void>;

  set screenUrl(value: string) {
    this._screenUrl = value;
  }

  get screenUrl(): string {
    return this._screenUrl;
  }

  get currentScreenName(): string {
    const pathname = new URL(this.page.url()).pathname;
    const segments = pathname.split("/").filter(Boolean);
    return segments.at(-1) ?? "";
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

  async chooseRandomOption(
    options?: Locator[],
    isForce = false,
  ): Promise<string> {
    const screenName = this.currentScreenName;
    const opts = options ?? (await this.options);
    if (!opts.length) {
      throw new Error(`No options found on screen: ${screenName}`);
    }

    const randomIndex = Math.floor(Math.random() * opts.length);
    const text = ((await opts[randomIndex].textContent()) || "")
      .trim()
      .replace(/\s+/g, " ");

    await this.elementHelper.setChosenObOptions([text], screenName);
    await this.elementHelper.attachChosenObOptions([text], screenName);
    await this.selectOptionByIndex(opts, randomIndex, isForce);

    this.logger.info(`Selected option on ${screenName}: ${text}`);
    return text;
  }
}
