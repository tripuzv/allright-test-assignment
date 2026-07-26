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

  get policyLink(): Locator {
    return this.banner.locator("a.cp-eea__link");
  }

  get manageButton(): Locator {
    return this.banner.locator('button[data-action="manage"]');
  }

  get rejectButton(): Locator {
    return this.banner.locator('button[data-action="reject"]');
  }

  get acceptButton(): Locator {
    return this.banner.locator('button[data-action="accept"]');
  }

  async isVisible(): Promise<boolean> {
    return this.banner.isVisible();
  }

  async waitForVisible(): Promise<void> {
    await this.banner.waitFor({ state: "visible", timeout: timeouts.s });
  }

  async waitForHidden(): Promise<void> {
    await this.root.waitFor({ state: "hidden", timeout: timeouts.s });
  }

  async acceptAll(): Promise<void> {
    await this.waitForVisible();
    await this.elementHelper.waitForClickable(this.acceptButton);
    await this.elementHelper.click(this.acceptButton);
    await this.waitForHidden();
    this.logger.info("Cookie banner: accepted all");
  }

  async rejectAll(): Promise<void> {
    await this.waitForVisible();
    await this.elementHelper.waitForClickable(this.rejectButton);
    await this.elementHelper.click(this.rejectButton);
    await this.waitForHidden();
    this.logger.info("Cookie banner: rejected all");
  }

  async openManage(): Promise<void> {
    await this.waitForVisible();
    await this.elementHelper.waitForClickable(this.manageButton);
    await this.elementHelper.click(this.manageButton);
    this.logger.info("Cookie banner: opened manage cookies");
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

    if (action === "accept") {
      await this.elementHelper.waitForClickable(this.acceptButton);
      await this.elementHelper.click(this.acceptButton);
      await this.waitForHidden();
      this.logger.info("Cookie banner: accepted all");
    } else {
      await this.elementHelper.waitForClickable(this.rejectButton);
      await this.elementHelper.click(this.rejectButton);
      await this.waitForHidden();
      this.logger.info("Cookie banner: rejected all");
    }

    return true;
  }
}
