import { BasePo } from "@pom/base/base.po.ts";
import { Locator } from "@playwright/test";
import { timeouts } from "@constants/timeouts.constants.ts";

export class AccountSelectorPo extends BasePo {
  get adminSpaceLink(): Locator {
    return this.page.locator('a.ember-view.contents[href*="/app/admin"]');
  }

  async waitForReady(): Promise<void> {
    await this.adminSpaceLink.waitFor({
      state: "visible",
      timeout: timeouts.s,
    });
  }

  async selectAdminSpace(): Promise<void> {
    await this.waitForReady();
    await this.elementHelper.waitForClickable(this.adminSpaceLink);
    await this.elementHelper.click(this.adminSpaceLink);
  }
}
