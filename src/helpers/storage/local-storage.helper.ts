import { ISetLocalStorageDataArgs } from "@helpers/storage/types/local-storage.types.ts";
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

  async getLocalStorage(): Promise<Record<string, string>> {
    return this.page.evaluate(() => {
      const store: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          store[key] = window.localStorage.getItem(key) ?? "";
        }
      }
      return store;
    });
  }
  
  async removeItem(key: string): Promise<void> {
    await this.page.evaluate((storageKey) => {
      window.localStorage.removeItem(storageKey);
    }, key);
  }

  async setLocalStorageData(args: ISetLocalStorageDataArgs): Promise<void> {
    const { key, value } = args;
    await this.page.evaluate(
      ({ k, v }) => {
        window.localStorage.setItem(k, v);
      },
      { k: key, v: value },
    );
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
