import { BasePo } from "@pom/base/base.po.ts";
import { Locator } from "@playwright/test";
import { timeouts } from "@constants/timeouts.constants.ts";

export class CookieBannerPo extends BasePo {
  get root(): Locator {
    return this.page.locator(".cp-eea");
  }

  get banner(): Locator {
    return this.root.locator(".cp-eea__inner");
  }

  get rejectButton(): Locator {
    return this.banner.locator('button[data-action="reject"]');
  }

  get acceptButton(): Locator {
    return this.banner.locator('button[data-action="accept"]');
  }

  async waitForHidden(): Promise<void> {
    await this.root.waitFor({ state: "hidden", timeout: timeouts.s });
  }

  async handle(action: "accept" | "reject"): Promise<boolean> {
    const appeared = await this.banner
      .waitFor({ state: "visible", timeout: timeouts.s })
      .then(() => true)
      .catch(() => false);

    if (!appeared) {
      this.logger.info("Cookie banner: not shown, skipping");
      return false;
    }

    const button = action === "accept" ? this.acceptButton : this.rejectButton;
    await this.elementHelper.waitForClickable(button);
    await this.elementHelper.click(button);
    await this.waitForHidden();
    this.logger.info(
      `Cookie banner: ${action === "accept" ? "accepted" : "rejected"} all`,
    );

    return true;
  }
}
