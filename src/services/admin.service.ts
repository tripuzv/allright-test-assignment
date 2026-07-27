import { BaseService } from "@services/base.service.ts";
import { step } from "@decorators/step.ts";
import { envHelper } from "@helpers/env/env.helper.ts";
import { adminConstants } from "@constants/admin.constants.ts";
import { globalStore } from "@helpers/storage/global-data.storage.ts";
import { AccountSelectorPo } from "@pom/admin/account-selector.po.ts";
import { LessonBookingPo } from "@pom/admin/lesson-booking.po.ts";
import { AdminCleanupService } from "@services/admin-cleanup.service.ts";
import { expect } from "@playwright/test";
import { timeouts } from "@constants/timeouts.constants.ts";

export class AdminService extends BaseService {
  private readonly accountSelector = new AccountSelectorPo();
  private readonly lessonBooking = new LessonBookingPo();
  private readonly cleanupService = new AdminCleanupService();

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

  @step("Open lesson booking page")
  async openLessonBooking(): Promise<void> {
    if (this.isOnLessonBookingPage()) {
      await this.lessonBooking.waitForReady();
      return;
    }

    await this.page.goto(adminConstants.bookingPath, {
      waitUntil: "domcontentloaded",
    });
    await this.lessonBooking.waitForReady();
  }

  @step("Search student by email")
  async searchStudentByEmail(email?: string): Promise<void> {
    const userEmail = this.resolveUserEmail(email);
    await this.openLessonBooking();
    await this.lessonBooking.searchStudentByEmail(userEmail);
  }

  @step("Select random teacher")
  async selectRandomTeacher(): Promise<void> {
    await this.lessonBooking.selectRandomTeacher();
  }

  @step("Book lesson slot")
  async bookLessonSlot(): Promise<void> {
    await this.lessonBooking.bookRandomAvailableSlot();
  }

  @step("Book lesson for user")
  async bookLessonForUser(email?: string): Promise<void> {
    await this.searchStudentByEmail(email);
    await this.selectRandomTeacher();
    await this.bookLessonSlot();
  }

  @step("Delete booking in admin")
  async deleteBooking(): Promise<void> {
    if (!this.isOnLessonBookingPage()) {
      await this.openLessonBooking();
    } else {
      await this.lessonBooking.waitForReady();
    }

    await this.lessonBooking.deleteBookedSlot();
  }

  @step("Cleanup created user via API")
  async cleanupCreatedUser(userId?: string): Promise<void> {
    await this.cleanupService.cleanupCreatedUser(userId);
  }

  private isOnLessonBookingPage(): boolean {
    return /\/app\/admin\/booking/.test(this.page.url());
  }

  private resolveUserEmail(email?: string): string {
    return email ?? globalStore.get<string>("userEmail");
  }
}
