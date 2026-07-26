import {
  IRetryOptions,
  ISleepArgs,
  IWaitOptions,
} from "@helpers/waiters/types/waiters.types.ts";
import { utils } from "@helpers/waiters/utils/waiterUtils.ts";
import { timeouts } from "@constants/timeouts.constants.ts";
import { BaseHelper } from "@helpers/base/base.helper.ts";
import { BrowserContext } from "playwright";

export class WaitersHelper extends BaseHelper {
  async wait(
    callback: (...args: any[]) => Promise<boolean>,
    timeout: number,
    options: IWaitOptions = {},
    ...args: any[]
  ): Promise<boolean> {
    const { interval = 100, errorMessage, throwError = true } = options;
    try {
      await this.page.waitForFunction(callback, args, {
        timeout,
        polling: interval,
      });
      return true;
    } catch (error) {
      if (throwError) {
        errorMessage && this.logger.error(errorMessage);
        throw new Error(error.message);
      }
      errorMessage && this.logger.warn(errorMessage);
      return false;
    }
  }

  async waitForAnimation(): Promise<void> {
    return this.sleep({ timeout: timeouts.animation, ignoreReason: true });
  }

  async waitWithoutDriver(
    callback: () => Promise<boolean>,
    timeout: number,
    options: IWaitOptions = {},
  ): Promise<boolean> {
    const { interval = 100, errorMessage, throwError = true } = options;
    const startTime = Date.now();
    while (utils.hasTime(startTime, timeout)) {
      try {
        const result = await callback();
        if (result) {
          return true;
        }
        await this.sleep({ timeout: interval, ignoreReason: true });
      } catch (error) {
        if (throwError) {
          errorMessage && this.logger.error(errorMessage);
          throw new Error(error.message);
        }
        errorMessage && this.logger.warn(errorMessage);
        return false;
      }
    }
    return false;
  }

  async retry<T>(
    callback: () => Promise<T>,
    retryCount: number,
    options: IRetryOptions = {},
  ): Promise<T> {
    const {
      interval = timeouts.xxxs,
      throwError = true,
      resolveWhenNoException = false,
      continueWithException = resolveWhenNoException,
      errorMessage,
    } = options;
    let caughtError = null;
    do {
      try {
        const result = await callback();
        if (resolveWhenNoException || result) {
          return result;
        }
      } catch (error) {
        caughtError = error;
        this.logger.error(`Caught error: ${caughtError}`);
        if (!continueWithException) {
          break;
        }
      }
      await this.logErrorAndSleep(errorMessage, caughtError, interval);
    } while (retryCount--);
    throwError && this.logRetryFailedAndThrow(errorMessage, caughtError);
    this.logger.warn(`${errorMessage}: ${caughtError}`);
  }

  sleep(args: ISleepArgs): Promise<void> {
    const { timeout, sleepReason, ignoreReason = false } = args;
    try {
      ignoreReason ||
        this.logger.info(
          `Sleeping: ${timeout / 1000} seconds${
            sleepReason ? `. Due to: ${sleepReason}` : ""
          }`,
        );
      return new Promise((resolve) => setTimeout(resolve, timeout));
    } catch (e) {
      this.logger.error(`Error during sleeping: ${e.message}`);
    }
  }

  async waitUntilSingleWindowOpen(
    context: BrowserContext,
    timeout: number = 4000,
    interval: number = 100,
  ): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const pages = context.pages();
      if (pages.length === 1) {
        return;
      }
      await new Promise((r) => setTimeout(r, interval));
    }
    throw new Error(
      `Timeout: More than one window still open after ${timeout}ms`,
    );
  }

  private async logErrorAndSleep(
    errorMessage: string | undefined,
    error: Error,
    interval: number,
  ): Promise<void> {
    if (error || errorMessage) {
      this.logger.warn(`${errorMessage}: ${error}`);
    }
    this.logger.warn(`Retrying...`);
    await this.sleep({ timeout: interval, ignoreReason: true });
  }

  private logRetryFailedAndThrow(
    errorMessage: string | undefined,
    caughtError: boolean,
  ): never {
    const message = `Retry failed: ${errorMessage}
      ${caughtError || ""}`;
    this.logger.error(message);
    throw new Error(message);
  }
}
