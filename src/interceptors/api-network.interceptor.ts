import { Page, Response } from "@playwright/test";
import { timeouts } from "@constants/timeouts.constants.ts";
import { LoggerHelper } from "@helpers/logger/logger.helper.ts";

export type CapturedApiCall = {
  method: string;
  url: string;
  path: string;
  status: number;
  requestBody: unknown;
  responseBody: unknown;
  timestamp: number;
};

const SKIP_PATH_PARTS = ["/api/v1/tutor-urls", "/api/v1/experiments"];

export class ApiNetworkInterceptor {
  private readonly page: Page;
  private readonly calls: CapturedApiCall[] = [];
  private readonly logger = LoggerHelper.getInstance().getLogger();
  private started = false;

  constructor(page: Page) {
    this.page = page;
  }

  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.page.on("response", this.handleResponse);
    this.logger.info("[ApiNetworkInterceptor] started");
  }

  stop(): void {
    if (!this.started) {
      return;
    }
    this.page.off("response", this.handleResponse);
    this.started = false;
  }

  getCalls(): CapturedApiCall[] {
    return [...this.calls];
  }

  findLatest(
    method: string,
    pathPattern: RegExp,
    afterTimestamp = 0,
  ): CapturedApiCall | undefined {
    for (let i = this.calls.length - 1; i >= 0; i--) {
      const call = this.calls[i];
      if (
        call.method.toUpperCase() === method.toUpperCase() &&
        pathPattern.test(call.path) &&
        call.timestamp >= afterTimestamp
      ) {
        return call;
      }
    }
    return undefined;
  }

  async waitFor(
    method: string,
    pathPattern: RegExp,
    options: { timeout?: number; afterTimestamp?: number } = {},
  ): Promise<CapturedApiCall> {
    const timeout = options.timeout ?? timeouts.s;
    const afterTimestamp = options.afterTimestamp ?? 0;

    const existing = this.findLatest(method, pathPattern, afterTimestamp);
    if (existing) {
      return existing;
    }

    const response = await this.page.waitForResponse(
      (res) => {
        try {
          const url = new URL(res.url());
          return (
            res.request().method().toUpperCase() === method.toUpperCase() &&
            pathPattern.test(url.pathname) &&
            !SKIP_PATH_PARTS.some((p) => url.pathname.includes(p))
          );
        } catch {
          return false;
        }
      },
      { timeout },
    );

    const fromBuffer = this.findLatest(method, pathPattern, afterTimestamp);
    if (fromBuffer) {
      return fromBuffer;
    }

    return this.toCapturedCall(response);
  }

  private handleResponse = async (response: Response): Promise<void> => {
    try {
      const url = response.url();
      if (!url.includes("/api/v1/")) {
        return;
      }
      if (SKIP_PATH_PARTS.some((p) => url.includes(p))) {
        return;
      }

      const call = await this.toCapturedCall(response);
      this.calls.push(call);
      this.logger.info(
        `[ApiNetworkInterceptor] captured ${call.method} ${call.path} (${call.status})`,
      );
    } catch (error) {
      this.logger.warn(
        `[ApiNetworkInterceptor] failed to capture response: ${error}`,
      );
    }
  };

  private async toCapturedCall(response: Response): Promise<CapturedApiCall> {
    const request = response.request();
    const url = response.url();
    const path = new URL(url).pathname;
    let requestBody: unknown = null;
    let responseBody: unknown = null;

    try {
      const postData = request.postData();
      if (postData) {
        requestBody = JSON.parse(postData);
      }
    } catch {
      requestBody = request.postData();
    }

    try {
      responseBody = await response.json();
    } catch {
      try {
        responseBody = await response.text();
      } catch {
        responseBody = null;
      }
    }

    return {
      method: request.method().toUpperCase(),
      url,
      path,
      status: response.status(),
      requestBody,
      responseBody,
      timestamp: Date.now(),
    };
  }
}
