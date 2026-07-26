import { OnboardingPo } from "@pom/base/onboarding.po.ts";
import { expect, Locator } from "@playwright/test";
import { timeouts } from "@constants/timeouts.constants.ts";

export class RequestGottenPo extends OnboardingPo {
  private readonly stepName = "request-gotten";

  get isLastStep(): boolean {
    return true;
  }

  get root(): Locator {
    return this.page.locator("body.application_request-gotten");
  }

  get successBanner(): Locator {
    return this.page.locator("section.bg-green-10");
  }

  get title(): Locator {
    return this.successBanner.locator("h2.text-h2");
  }

  get subtitle(): Locator {
    return this.successBanner.locator("p").first();
  }

  get featureItems(): Locator {
    return this.page.locator("ul.flex.flex-col.gap-4 > li.flex");
  }

  get adminContactImage(): Locator {
    return this.page.locator('img[src*="admin-contact"]');
  }

  get teachersFeatureImages(): Locator {
    return this.page.locator('img[src*="teachers-feature"]');
  }

  get previewVideo(): Locator {
    return this.page.locator("video.levels-video");
  }

  async processScreen(): Promise<void> {
    await this.root.waitFor({ state: "attached", timeout: timeouts.s });
    await this.successBanner.waitFor({ state: "visible", timeout: timeouts.s });
    await this.title.waitFor({ state: "visible", timeout: timeouts.s });

    await expect(this.page).toHaveURL(new RegExp(`/${this.stepName}(?:\\?|$)`));
    await expect(this.successBanner).toBeVisible();
    await expect(this.title).toBeVisible();
    await expect(this.subtitle).toBeVisible();
    await expect(this.featureItems).toHaveCount(3);
    await expect(this.adminContactImage).toBeVisible();
    await expect(this.teachersFeatureImages).toHaveCount(2);
    await expect(this.previewVideo).toBeVisible();

    await this.elementHelper.setChosenObOptions(
      ["request-gotten-validated"],
      this.stepName,
    );
    await this.elementHelper.attachChosenObOptions(
      ["request-gotten-validated"],
      this.stepName,
    );

    this.logger.info(
      `${this.stepName} validated as last onboarding step (thank-you screen)`,
    );
  }
}
