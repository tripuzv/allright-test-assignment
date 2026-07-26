import { test } from "@playwright/test";
import { StartService } from "@services/start.service.ts";
import { OnboardingService } from "@services/onboarding.service.ts";
import { useTestContext } from "@context/use.test.context.ts";
import { timeouts } from "@constants/timeouts.constants.ts";
import { envHelper } from "@helpers/env/env.helper.ts";

test.setTimeout(6 * timeouts.minute);
test("@smoke Test", async ({ page }, testInfo) => {
  let startService: StartService;
  let onboardingService: OnboardingService;

  const { setPage, setTestInfo } = useTestContext();
  setPage(page);
  setTestInfo(testInfo);

  startService = new StartService();
  onboardingService = new OnboardingService();

  let pathParams = "/uk/app/sign-up/long/charlie/age-range";
  if (envHelper.environment === "prod") {
    pathParams = "/uk/app/sign-up/long/charlie/age-range";
  }

  await test.step("Start Flow", async () => {
    await startService.openApp({
      cookieAction: "accept",
      path: pathParams,
    });
  });

  await test.step("Onboarding processing", async () => {
    await onboardingService.passObFunnel();
  });
});
