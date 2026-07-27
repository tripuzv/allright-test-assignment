import { Page } from "@playwright/test";
import { step } from "@decorators/step.ts";
import { apiConstants } from "@constants/api.constants.ts";
import { availableTimeslotsMockHelper } from "@helpers/mocks/available-timeslots.mock.helper.ts";
import { LoggerHelper } from "@helpers/logger/logger.helper.ts";

export class AvailableTimeslotsRouteInterceptor {
  private readonly page: Page;
  private readonly logger = LoggerHelper.getInstance().getLogger();
  private readonly routePattern = `**${apiConstants.availableTimeslotsPath}**`;
  private enabled = false;

  constructor(page: Page) {
    this.page = page;
  }

  @step("Enable available-timeslots API mock")
  async enable(): Promise<void> {
    if (this.enabled) {
      return;
    }

    const responseBody = availableTimeslotsMockHelper.buildResponse();

    await this.page.route(this.routePattern, async (route) => {
      if (route.request().method().toUpperCase() !== "GET") {
        await route.continue();
        return;
      }

      this.logger.info(
        `[AvailableTimeslotsRouteInterceptor] fulfilled ${responseBody.data.length} mocked slots`,
      );

      await route.fulfill({
        status: 200,
        contentType: "application/vnd.api+json",
        body: JSON.stringify(responseBody),
      });
    });

    this.enabled = true;
    this.logger.info("[AvailableTimeslotsRouteInterceptor] enabled");
  }

  async disable(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    await this.page.unroute(this.routePattern);
    this.enabled = false;
    this.logger.info("[AvailableTimeslotsRouteInterceptor] disabled");
  }
}
