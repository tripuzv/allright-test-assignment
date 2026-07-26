import { expect, test } from "@playwright/test";
import { LoggerHelper } from "@helpers/logger/logger.helper.ts";

const logger = LoggerHelper.getInstance().getLogger();

export const assertHelper = {
  filePrefix: "[Assert-Helper]",

  async expectToBeNotUndefined<T>({
    actual,
    message,
  }: {
    actual: T;
    message: string;
    knownIssue?: any;
  }): Promise<void> {
    expect.soft(actual, message).not.toBeUndefined();
  },

  async expectToBeNotNull<T>({
    actual,
    message,
  }: {
    actual: T;
    message: string;
    knownIssue?: any;
  }): Promise<void> {
    expect.soft(actual, message).not.toBeNull();
  },
  async expectToBeNull<T>({
    actual,
    message,
  }: {
    actual: T;
    message: string;
    knownIssue?: any;
  }): Promise<void> {
    expect.soft(actual, message).toBeNull();
  },

  async expectEquals({
    actual,
    expected,
    message,
  }: {
    actual: any;
    expected: any;
    message: any;
    knownIssue?: any;
  }): Promise<void> {
    await test.step(`${message}`, () => {
      expect.soft(actual, message).toBe(expected);
    });
  },

  async expectNotEquals({
    actual,
    expected,
    message,
  }: {
    actual: any;
    expected: any;
    message: any;
  }): Promise<void> {
    expect.soft(actual, message).not.toBe(expected);
  },

  async expectInclude({
    actual,
    expected,
    message,
  }: {
    actual: any;
    expected: any;
    message: any;
  }): Promise<void> {
    await test.step(`${message}`, () => {
      expect.soft(actual, message).toContain(expected);
    });
  },

  async expectType({
    actual,
    expected,
    message,
  }: {
    actual: any;
    expected: string;
    message: any;
  }): Promise<void> {
    expect.soft(typeof actual, message).toBe(expected);
  },

  async expectToBeOneOf<T>({
    actual,
    expected,
    message,
  }: {
    actual: any;
    expected: T[];
    message: any;
  }): Promise<void> {
    expect.soft(expected, message).toContain(actual);
  },

  async expectToBe({
    actual,
    message,
  }: {
    actual: any;
    message: string;
  }): Promise<void> {
    expect.soft(actual, message).not.toBeNull();
    expect.soft(actual, message).not.toBeUndefined();
  },

  async expectToDeepEqual<T>({
    actual,
    expected,
    message,
  }: {
    actual: T;
    expected: T;
    message: string;
  }): Promise<void> {
    expect.soft(actual, message).toBe(expected);
  },

  async soft<T>(
    callback: () => Promise<T>,
    title: string,
    knownIssue?: string,
  ): Promise<boolean> {
    try {
      await test.step(title, async () => {
        const callBackResult = await callback();
        return typeof callBackResult === "boolean" ? callBackResult : true;
      });
      return true;
    } catch (error) {
      return await this.handleError({ error: error, knownIssue: knownIssue });
    }
  },

  async handleError({
    error,
    knownIssue,
  }: {
    error: any;
    knownIssue?: string;
  }): Promise<boolean> {
    if (error.name === "AssertionError") {
      logger.error(`${error.message}`);
    }

    if (knownIssue) {
      logger.error(`Test failed with known issue: ${knownIssue}`);
      return true;
    }
    return false;
  },

  async assertArrayResultsTrue(array: boolean[]): Promise<boolean> {
    return array.filter((e) => !e).length === 0;
  },

  async strict(callback: () => Promise<void>, title: string): Promise<boolean> {
    try {
      await test.step(title, async () => {
        await callback();
      });
      return true;
    } catch (error) {
      logger.error(`Error during validation ${title}\n${error.message}`);
      throw new Error(`Error during validation ${title}\n${error.message}`);
    }
  },
};
