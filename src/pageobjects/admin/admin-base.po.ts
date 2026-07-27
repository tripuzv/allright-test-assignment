import { BasePo } from "@pom/base/base.po.ts";
import { expect, Locator } from "@playwright/test";
import { timeouts } from "@constants/timeouts.constants.ts";
import { mathHelper } from "@helpers/math/math.helper.ts";

export abstract class AdminBasePo extends BasePo {
  protected get visiblePowerSelectDropdown(): Locator {
    return this.page.locator(
      "#ember-basic-dropdown-wormhole .ember-power-select-dropdown",
    );
  }

  protected get visiblePowerSelectSearchInput(): Locator {
    return this.visiblePowerSelectDropdown.locator(
      "input.ember-power-select-search-input, input[type='search']",
    );
  }

  protected get visiblePowerSelectOptions(): Locator {
    return this.visiblePowerSelectDropdown.locator(
      "li.ember-power-select-option[role='option']",
    );
  }

  protected get visiblePowerSelectOptionsWithUserId(): Locator {
    return this.visiblePowerSelectOptions.filter({ hasText: /#\d+;/ });
  }

  protected get userFieldGroups(): Locator {
    return this.page.locator(".field-group.can-show-selected-user-icon");
  }

  protected get actionModal(): Locator {
    return this.page.locator(".ember-modal-dialog, [role='dialog']").last();
  }

  protected get reasonInput(): Locator {
    return this.actionModal.locator(
      'input[name*="reason" i], textarea[name*="reason" i]',
    );
  }

  protected get modalSubmitButton(): Locator {
    return this.actionModal
      .locator('button[type="submit"], button.btn-primary, button.btn-danger')
      .last();
  }

  protected powerSelectOptionByEmail(email: string): Locator {
    return this.visiblePowerSelectOptionsWithUserId.filter({ hasText: email });
  }

  protected async openPowerSelect(trigger: Locator): Promise<void> {
    await trigger.scrollIntoViewIfNeeded();
    await this.elementHelper.waitForClickable(trigger);

    for (let attempt = 0; attempt < 3; attempt++) {
      await this.elementHelper.click(trigger);

      const opened = await this.visiblePowerSelectDropdown
        .isVisible({ timeout: timeouts.xxs })
        .catch(() => false);

      if (opened) {
        break;
      }

      await this.page.waitForTimeout(timeouts.animation);
    }

    await this.visiblePowerSelectDropdown.waitFor({
      state: "visible",
      timeout: timeouts.s,
    });
  }

  protected async searchByEmailInPowerSelect(
    trigger: Locator,
    email: string,
  ): Promise<void> {
    await this.openPowerSelect(trigger);

    const searchInput = this.visiblePowerSelectSearchInput.first();
    await searchInput.waitFor({ state: "visible", timeout: timeouts.s });
    await searchInput.fill(email);
    await searchInput.press("Enter");

    const option = this.powerSelectOptionByEmail(email);
    await expect(option.first()).toBeVisible({ timeout: timeouts.m });
    await option.first().scrollIntoViewIfNeeded();
    await this.elementHelper.click(option.first());

    await expect(this.visiblePowerSelectDropdown).toBeHidden({
      timeout: timeouts.s,
    });
    await expect(trigger).toContainText(/#\d+/, { timeout: timeouts.s });

    this.logger.info(`Power-select option selected by email: ${email}`);
  }

  protected async selectRandomPowerSelectOption(
    trigger: Locator,
    options: Locator,
  ): Promise<string> {
    await this.openPowerSelect(trigger);

    await expect(options.first()).toBeVisible({ timeout: timeouts.m });

    const count = await options.count();
    const index = mathHelper.random.getNumber(count);
    const selected = options.nth(index);

    await selected.scrollIntoViewIfNeeded();
    const optionText = (await selected.innerText()).trim();
    await this.elementHelper.click(selected);

    await expect(this.visiblePowerSelectDropdown).toBeHidden({
      timeout: timeouts.s,
    });

    return optionText;
  }
}
