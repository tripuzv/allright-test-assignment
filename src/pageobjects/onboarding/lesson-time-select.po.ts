import { OnboardingPo } from "@pom/base/onboarding.po.ts";
import { Locator } from "@playwright/test";

export class LessonTimeSelectPo extends OnboardingPo {
  private readonly stepName = "lesson-time-select";

  get root(): Locator {
    return this.page.locator(`[data-step-name="${this.stepName}"]`);
  }

  get title(): Locator {
    return this.root.locator(".text-title-2");
  }

  get selectedDay(): Locator {
    return this.root.locator("ul li.border-fuchsia-30");
  }

  get selectedPeriod(): Locator {
    return this.root.locator(".grid.grid-cols-3 button.border-fuchsia-30");
  }

  get selectedTimeSlot(): Locator {
    return this.root.locator(".grid.grid-cols-4 button.border-fuchsia-30");
  }

  get bookLessonButton(): Locator {
    return this.root.locator("button.btn.orange");
  }

  async processScreen(): Promise<void> {
    await this.waitForScreenReady(this.root, this.title);
    await this.selectedDay.waitFor({ state: "visible" });
    await this.selectedTimeSlot.waitFor({ state: "visible" });

    await this.elementHelper.setChosenObOptions(
      ["preselected-lesson-slot"],
      this.stepName,
    );
    await this.elementHelper.attachChosenObOptions(
      ["preselected-lesson-slot"],
      this.stepName,
    );

    await this.elementHelper.waitForClickable(this.bookLessonButton);
    await this.elementHelper.click(this.bookLessonButton);

    this.logger.info(
      `${this.stepName} processed with preselected day/time slot`,
    );
  }
}
