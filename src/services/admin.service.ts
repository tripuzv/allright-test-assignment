import { BaseService } from "@services/base.service.ts";
import { step } from "@decorators/step.ts";
import { envHelper } from "@helpers/env/env.helper.ts";
import { adminConstants } from "@constants/admin.constants.ts";
import { AccountSelectorPo } from "@pom/admin/account-selector.po.ts";
import { expect } from "@playwright/test";
import { timeouts } from "@constants/timeouts.constants.ts";

export class AdminService extends BaseService {
  private readonly accountSelector = new AccountSelectorPo();

  @step("Switch browser to desktop mode")
  async switchToDesktop(): Promise<void> {
    await this.page.setViewportSize(adminConstants.desktopViewport);
    await this.page.evaluate(() => {
      Object.defineProperty(navigator, "maxTouchPoints", {
        get: () => 0,
        configurable: true,
      });
    });
    this.logger.info(
      `Desktop viewport applied: ${adminConstants.desktopViewport.width}x${adminConstants.desktopViewport.height}`,
    );
  }

  @step("Open admin panel")
  async openAdminPanel(): Promise<void> {
    await this.page.goto(envHelper.adminBaseUrl, {
      waitUntil: "domcontentloaded",
    });
    await this.accountSelector.selectAdminSpace();
    await expect(this.page).toHaveURL(/\/app\/admin/, { timeout: timeouts.s });
    this.logger.info("Admin panel opened");
  }
}
