import { AdminBasePo } from "@pom/admin/admin-base.po.ts";
import { expect, Locator } from "@playwright/test";
import { timeouts } from "@constants/timeouts.constants.ts";
import { adminConstants } from "@constants/admin.constants.ts";
import { globalStore } from "@helpers/storage/global-data.storage.ts";
import { mathHelper } from "@helpers/math/math.helper.ts";

export class LessonBookingPo extends AdminBasePo {
  get studentSearchTrigger(): Locator {
    return this.userFieldGroups
      .first()
      .locator(".ember-power-select-trigger");
  }

  get teacherSearchTrigger(): Locator {
    return this.userFieldGroups
      .filter({ has: this.page.locator(".filter-sort-wrap") })
      .locator(".ember-power-select-trigger");
  }

  get freeTimeSlots(): Locator {
    return this.page.locator(".cc-event.duration-30.free");
  }

  get bookedTimeSlots(): Locator {
    return this.page.locator(
      ".cc-event.duration-30.prebooked, .cc-event.duration-30.booked, .cc-event.duration-30.confirmed, .cc-event.duration-30.reserved",
    );
  }

  async waitForReady(): Promise<void> {
    await expect(this.page).toHaveURL(/\/app\/admin\/booking/, {
      timeout: timeouts.s,
    });
    await expect(this.studentSearchTrigger).toBeVisible({
      timeout: timeouts.s,
    });
  }

  async searchStudentByEmail(email: string): Promise<void> {
    await this.searchByEmailInPowerSelect(this.studentSearchTrigger, email);
  }

  async selectRandomTeacher(): Promise<void> {
    const teacherText = await this.selectRandomPowerSelectOption(
      this.teacherSearchTrigger,
      this.visiblePowerSelectOptionsWithUserId,
    );

    const teacherIdMatch = teacherText.match(/#(\d+)/);
    if (teacherIdMatch) {
      globalStore.set("selectedTeacherId", teacherIdMatch[1]);
    }
    globalStore.set(
      "selectedTeacherLabel",
      teacherText.split(";")[0]?.trim() ?? teacherText,
    );

    await expect(this.page).toHaveURL(/tutor_id=\d+/, { timeout: timeouts.m });
    this.logger.info(`Teacher selected: ${teacherText.slice(0, 80)}`);
  }

  async bookRandomAvailableSlot(
    reason = adminConstants.deleteBookingReason,
  ): Promise<void> {
    const slots = this.freeTimeSlots;
    await slots.first().waitFor({ state: "visible", timeout: timeouts.m });

    const count = await slots.count();
    const index = mathHelper.random.getNumber(count);
    await this.elementHelper.click(slots.nth(index));

    await this.submitReasonModal(reason);
    this.logger.info(`Booked free slot #${index} with reason: ${reason}`);
  }

  async deleteBookedSlot(
    reason = adminConstants.deleteBookingReason,
  ): Promise<void> {
    const slots = this.bookedTimeSlots;
    await expect(slots.first()).toBeVisible({ timeout: timeouts.s });
    await this.elementHelper.click(slots.first());
    await this.submitReasonModal(reason);
    this.logger.info(`Deleted booked slot with reason: ${reason}`);
  }

  private async submitReasonModal(reason: string): Promise<void> {
    const hasReasonInput = await this.reasonInput
      .isVisible({ timeout: timeouts.xs })
      .catch(() => false);

    if (hasReasonInput) {
      await this.reasonInput.fill(reason);
    }

    if (await this.modalSubmitButton.isVisible().catch(() => false)) {
      await this.elementHelper.click(this.modalSubmitButton);
    }
  }
}
