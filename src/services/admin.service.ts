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
  async openLessonBooking(userId?: string): Promise<void> {
    const resolvedUserId = userId ?? this.resolveCreatedUserId();
    const bookingUrl = this.buildBookingUrl(resolvedUserId);

    if (this.isOnLessonBookingPage(resolvedUserId)) {
      await this.lessonBooking.waitForReady(resolvedUserId);
      return;
    }

    this.logger.info(`Opening lesson booking: ${bookingUrl}`);
    await this.page.goto(bookingUrl, {
      waitUntil: "domcontentloaded",
    });
    await this.lessonBooking.waitForReady(resolvedUserId);
  }

  @step("Open lesson booking for created user")
  async openLessonBookingForCreatedUser(userId?: string): Promise<void> {
    await this.openLessonBooking(userId);
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
  async bookLessonForUser(userId?: string): Promise<void> {
    await this.openLessonBookingForCreatedUser(userId);
    await this.selectRandomTeacher();
    await this.bookLessonSlot();
  }

  @step("Delete booking in admin")
  async deleteBooking(): Promise<void> {
    const userId = this.resolveCreatedUserId();

    if (!this.isOnLessonBookingPage(userId)) {
      await this.openLessonBooking(userId);
    } else {
      await this.lessonBooking.waitForReady(userId);
    }

    await this.lessonBooking.deleteBookedSlot();
  }

  @step("Cleanup created user via API")
  async cleanupCreatedUser(userId?: string): Promise<void> {
    await this.cleanupService.cleanupCreatedUser(userId);
  }

  private isOnLessonBookingPage(userId?: string): boolean {
    if (!/\/app\/admin\/booking/.test(this.page.url())) {
      return false;
    }

    if (!userId) {
      return true;
    }

    return new URL(this.page.url()).searchParams.get("user_id") === userId;
  }

  private buildBookingUrl(userId: string): string {
    return `${envHelper.quizBaseUrl}${adminConstants.bookingPath}?user_id=${userId}`;
  }

  private resolveCreatedUserId(): string {
    const userId = globalStore.get<string>("createdUserId");

    if (!userId) {
      throw new Error("createdUserId not found in global store");
    }

    return userId;
  }
}
