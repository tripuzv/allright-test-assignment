import { expect, test } from "@playwright/test";

export const assertHelper = {
  async expectEquals({
    actual,
    expected,
    message,
  }: {
    actual: any;
    expected: any;
    message: any;
  }): Promise<void> {
    await test.step(`${message}`, () => {
      expect.soft(actual, message).toBe(expected);
    });
  },
};
