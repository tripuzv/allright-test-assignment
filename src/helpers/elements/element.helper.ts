import { timeouts } from "@constants/timeouts.constants";
import { Locator } from "@playwright/test";
import { IWaitForOptions } from "./types/element.types";
import { BaseHelper } from "@helpers/base/base.helper.ts";
import { ContentType } from "allure-js-commons";

export class ElementHelper extends BaseHelper {
  constructor() {
    super();
  }

  async click(element: Locator, force = false): Promise<void> {
    if (force) {
      this.logger.info(`Force click enabled. Using JavaScript click.`);
      await this.javaScriptClick(element);
      this.logger.info(`JS click executed on element.`);
      return;
    }

    try {
      this.logger.info(`Clicking on element.`);
      await element.click();
      this.logger.info(`Successfully clicked on element.`);
    } catch (error) {
      this.logger.warn(
        `Can't click on element due to "${error.message}". Trying JS click...`,
      );
      await this.javaScriptClick(element);
      this.logger.info(`JS click executed on element.`);
    }
  }

  async javaScriptClick(element: Locator, throwError = false): Promise<void> {
    try {
      this.logger.info(`Clicking on element with JavaScript click`);
      await element.evaluate((el: HTMLElement) => el.click());
    } catch (error) {
      if (throwError) {
        throw new Error(`Can't click on element due to ${error.message}`);
      }
      this.logger.error(`Can't JS click on element due to ${error.message}`);
    }
  }

  async attachChosenObOptions(
    chosenOptionTexts: string | string[],
    screenName: string,
  ): Promise<void> {
    await this.reporter.attach(
      `chosenOption__${screenName}`,
      Array.isArray(chosenOptionTexts)
        ? chosenOptionTexts.join(",")
        : chosenOptionTexts,
      ContentType.TEXT,
    );
  }

  async waitForClickable(
    element: Locator,
    options: IWaitForOptions = { timeout: timeouts.xs },
  ): Promise<void> {
    const { timeout, throwError = false } = options;
    if (!element) {
      throw new Error("Can't waitForClickable due to element being undefined");
    }

    const startTime = Date.now();
    this.logger.info(
      `Waiting for element to be clickable within ${timeout / 1000} seconds`,
    );

    try {
      await element.waitFor({ state: "visible", timeout });

      while (Date.now() - startTime < timeout) {
        if (await element.isEnabled()) {
          this.logger.info("Element is clickable now.");
          return;
        }
        await this.page.waitForTimeout(100);
      }

      throw new Error("Element did not become clickable within the timeout");
    } catch (error) {
      if (throwError) {
        throw new Error(`Error during waitForClickable: ${error.message}`);
      }
      this.logger.error(`Error during waitForClickable: ${error.message}`);
    }
  }
}
