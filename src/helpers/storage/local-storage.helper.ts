import { BaseHelper } from "@helpers/base/base.helper.ts";
import { timeouts } from "@constants/timeouts.constants.ts";

export class LocalStorageHelper extends BaseHelper {
  constructor() {
    super();
  }

  async getLocalStorageDataByKey(key: string): Promise<string | null> {
    await this.waitUntilKeyExists(key);
    return this.page.evaluate((storageKey) => {
      return window.localStorage.getItem(storageKey);
    }, key);
  }

  private async waitUntilKeyExists(
    key: string,
    timeout = timeouts.xs,
  ): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const value = await this.page.evaluate((storageKey) => {
        return window.localStorage.getItem(storageKey);
      }, key);
      if (value !== null) {
        return;
      }
      await this.page.waitForTimeout(100);
    }
  }
}
