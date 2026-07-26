import { timeouts } from "@constants/timeouts.constants";
import { FrameLocator, Locator } from "@playwright/test";
import {
  IClickRandomOptions,
  IGetElement,
  IGetRandomElements,
  IWaitForOptions,
} from "./types/types";
import { BaseHelper } from "@helpers/base/base.helper.ts";
import { mathHelper } from "@helpers/math/math.helper.ts";
import { globalStore } from "@storage/globalDataStorage.ts";
import { ContentType } from "allure-js-commons";

export class ElementHelper extends BaseHelper {
  private readonly filePrefix = "[Element-Helper]";

  constructor() {
    super();
  }

  getRandom = {
    async index(elements: Locator): Promise<number> {
      const count = await elements.count();
      return mathHelper.random.getNumber(count);
    },
    async elementFrom(elements: Locator[]): Promise<IGetElement> {
      const randomIndex = mathHelper.random.getNumber(elements.length);
      return {
        element: elements[randomIndex],
        index: randomIndex,
      };
    },
    async elements(elements: Locator[]): Promise<IGetRandomElements> {
      const allElements = elements;
      const shuffledArray = [...allElements];

      for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = mathHelper.random.getNumber(i + 1);
        [shuffledArray[i], shuffledArray[j]] = [
          shuffledArray[j],
          shuffledArray[i],
        ];
      }

      const numberOfRandomElements =
        mathHelper.random.getNumber(shuffledArray.length) + 1;

      const shuffledElements = shuffledArray.slice(0, numberOfRandomElements);

      const indexes: number[] = shuffledElements.map((selectedElement) =>
        allElements.indexOf(selectedElement),
      );

      return {
        shuffledElements,
        indexes,
      };
    },
  };

  async isPresent(element: Locator): Promise<boolean> {
    try {
      return (await element.count()) > 0;
    } catch (error) {
      this.logger.error(`Error checking presence of element ${element}`, error);
      return false;
    }
  }

  async isDisplayed(element: Locator): Promise<boolean> {
    try {
      return await element.isVisible();
    } catch (error) {
      this.logger.error(
        `Error checking visibility of element ${element}`,
        error,
      );
      return false;
    }
  }

  async isEnabled(element: Locator): Promise<boolean> {
    try {
      return await element.isEnabled();
    } catch (error) {
      this.logger.error(`Error checking enabled of element ${element}`, error);
      return false;
    }
  }

  async isFrameElementDisplayed(
    frame: FrameLocator,
    selector: string,
  ): Promise<boolean> {
    try {
      const element = frame.locator(selector);
      return await element.isVisible();
    } catch (error) {
      this.logger.error(
        `Error checking visibility of element ${selector} inside frame`,
        error,
      );
      return false;
    }
  }

  async scrollToElement(element: Locator): Promise<void> {
    if (!element) {
      throw new Error(
        `${this.filePrefix} - Can't scroll because an element is undefined`,
      );
    }

    try {
      await element.scrollIntoViewIfNeeded();
    } catch (error) {
      this.logger.error(error.message);
      throw new Error(error.message);
    }
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
        `⚠️ Can't click on element due to "${error.message}". Trying JS click...`,
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
      } else {
        this.logger.error(`Can't JS click on element due to ${error.message}`);
      }
    }
  }

  async clickAndHoldForNSeconds(
    element: Locator,
    timeout: number,
  ): Promise<void> {
    await element.waitFor({ state: "visible", timeout: timeouts.xs });
    const box = await element.boundingBox();
    if (!box) {
      throw new Error("Element not found or not visible");
    }
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.waitForTimeout(timeouts.animation);
    await this.page.mouse.down();
    await this.page.waitForTimeout(timeout);
    await this.page.mouse.up();
    await this.page.waitForTimeout(timeouts.animation);
  }

  async clickRandomElement(
    elements: Locator[],
    options: IClickRandomOptions = {},
  ): Promise<void> {
    const { shouldReportChosenObOptions = true } = options;

    if (elements.length === 0) {
      throw new Error("No elements found to click");
    }

    const randomIndex = Math.floor(Math.random() * elements.length);
    const element = elements[randomIndex];

    const elementValue = await element.getAttribute("value");
    this.logger.info(`Clicking on random element: ${elementValue}`);

    if (shouldReportChosenObOptions) {
      await this.setChosenObOptions(
        [elementValue || (await element.textContent()) || ""],
        "screenName",
      );
      await this.attachChosenObOptions(
        [elementValue || (await element.textContent()) || ""],
        "screenName",
      );
    }

    await this.click(element);
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

  async setChosenObOptions(
    chosenOptionTexts: string[],
    screenName: string,
  ): Promise<void> {
    const value =
      chosenOptionTexts.length === 1
        ? chosenOptionTexts[0]
        : JSON.stringify(chosenOptionTexts);

    globalStore.set(`chosenOption__${screenName}`, value);
  }

  async waitUntilDisplayed(
    element: Locator,
    timeout: number,
  ): Promise<boolean> {
    try {
      await element.waitFor({ state: "visible", timeout });
      return true;
    } catch (error) {
      this.logger.error(
        `Element ${element} was not displayed within ${timeout}ms`,
        error,
      );
      return false;
    }
  }

  async waitForDisplayed(
    element: Locator,
    options: IWaitForOptions = { timeout: timeouts.xs },
  ): Promise<void> {
    const { timeout, throwError = false } = options;
    if (!element) {
      throw new Error("Can't waitForDisplayed due to element being undefined");
    }

    try {
      this.logger.info(
        `Waiting for element to be displayed within ${timeout / 1000} seconds`,
      );
      await element.waitFor({ state: "visible", timeout });
    } catch (error) {
      if (throwError) {
        throw new Error(`Error during waitForDisplayed: ${error.message}`);
      }
      this.logger.error(`Error during waitForDisplayed: ${error.message}`);
    }
  }

  async waitForFrameDisplayed(
    frameLocator: FrameLocator,
    selector: string,
    options: IWaitForOptions = { timeout: timeouts.xs },
  ): Promise<void> {
    const { timeout, throwError = false } = options;

    if (!frameLocator) {
      throw new Error(
        "Can't waitForFrameDisplayed due to frameLocator being undefined",
      );
    }

    try {
      this.logger.info(
        `Waiting for element '${selector}' inside iframe to be displayed within ${timeout / 1000} seconds`,
      );
      await frameLocator
        .locator(selector)
        .waitFor({ state: "visible", timeout });
    } catch (error) {
      if (throwError) {
        throw new Error(`Error during waitForFrameDisplayed: ${error.message}`);
      }
      this.logger.error(`Error during waitForFrameDisplayed: ${error.message}`);
    }
  }

  async waitForDisappear(
    element: Locator,
    options: IWaitForOptions = { timeout: timeouts.xs },
  ): Promise<void> {
    const { timeout, throwError = false } = options;
    if (!element) {
      throw new Error("Can't waitForDisappear due to element being undefined");
    }

    try {
      this.logger.info(
        `Waiting for element to disappear within ${timeout / 1000} seconds`,
      );
      await element.waitFor({ state: "hidden", timeout });
    } catch (error) {
      if (throwError) {
        throw new Error(`Error during waitForDisappear: ${error.message}`);
      }
      this.logger.error(`Error during waitForDisappear: ${error.message}`);
    }
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

  async enterText(element: Locator, text: string): Promise<void> {
    if (!text) {
      throw new Error("Text has not been provided");
    }
    try {
      this.logger.info(`Enter text ${text} in ${element}}`);
      await element.fill(text);
    } catch (error) {
      this.logger.error(`Enter text ${text} failed: ${error.message}`);
    }
  }

  async clearInput(element: Locator): Promise<void> {
    try {
      this.logger.info(`Clear value for element`);
      await element.clear();
    } catch (error) {
      this.logger.error(`Clear value failed: ${error.message}`);
    }
  }

  async getCSSProperty(element: Locator, property: string): Promise<string> {
    if (!element) {
      throw new Error(
        `${this.filePrefix} - Can't get CSS property because element is undefined`,
      );
    }

    try {
      this.logger.info(`Getting CSS property '${property}' from element`);
      const value = await element.evaluate(
        (el, prop) => getComputedStyle(el)[prop as any],
        property,
      );
      this.logger.info(`Successfully got CSS property '${property}': ${value}`);
      return value;
    } catch (error) {
      this.logger.error(
        `Error getting CSS property '${property}': ${error.message}`,
      );
      throw new Error(
        `Failed to get CSS property '${property}': ${error.message}`,
      );
    }
  }

  async scrollToEnd(): Promise<boolean> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.waitForTimeout(timeouts.xxxxs);

    const initialScrollPosition = await this.page.evaluate(
      () => window.scrollY,
    );
    const totalHeight = await this.page.evaluate(
      () => document.body.scrollHeight,
    );

    await this.page.evaluate(
      (height) => window.scrollTo(0, height),
      totalHeight,
    );
    await this.page.waitForTimeout(timeouts.xxxxs);

    const finalScrollPosition = await this.page.evaluate(() => window.scrollY);
    return finalScrollPosition > initialScrollPosition;
  }

  async waitForEnabled(element: Locator): Promise<void> {
    await element.waitFor({ state: 'attached', timeout: 10000 });
    
    await this.page.waitForFunction(
      (el: Element) => {
        return (
          el &&
          !el.hasAttribute('disabled') &&
          el.getAttribute('aria-disabled') !== 'true'
        );
      },
      await element.elementHandle(),
      { timeout: 10000 }
    );
  }
}
