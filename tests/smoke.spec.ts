import { test } from "@playwright/test";
import { StartService } from "@services/start.service.ts";
import { OnboardingService } from "@services/onboarding.service.ts";
import { useTestContext } from "@context/use.test.context.ts";
import { timeouts } from "@constants/timeouts.constants.ts";

test.setTimeout(2 * timeouts.minute);
test("@smoke Test", async ({ page }, testInfo) => {
  const { setPage, setTestInfo } = useTestContext();
  setPage(page);
  setTestInfo(testInfo);

  const startService = new StartService();
  const onboardingService = new OnboardingService();
  const pathParams = "/uk/app/sign-up/long/charlie/age-range";

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
