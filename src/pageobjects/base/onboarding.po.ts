import { BasePo } from "./base.po.ts";
import { Locator } from "@playwright/test";
import { timeouts } from "@constants/timeouts.constants.ts";

export abstract class OnboardingPo extends BasePo {
  private _screenUrl = "";

  abstract processScreen(): Promise<void>;

  get isLastStep(): boolean {
    return false;
  }

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

  protected async waitForScreenReady(
    root: Locator,
    title: Locator,
  ): Promise<void> {
    await root.waitFor({ state: "visible", timeout: timeouts.s });
    await title.waitFor({ state: "visible", timeout: timeouts.s });
  }
}
