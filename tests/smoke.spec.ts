import { test } from "@playwright/test";
import { StartService } from "@services/start.service.ts";
import { OnboardingService } from "@services/onboarding.service.ts";
import { AdminService } from "@services/admin.service.ts";
import { AdminCleanupService } from "@services/admin-cleanup.service.ts";
import { useTestContext } from "@context/use.test.context.ts";
import { timeouts } from "@constants/timeouts.constants.ts";

test.setTimeout(2 * timeouts.minute);
test("@smoke Test", async ({ page }, testInfo) => {
  const { setPage, setTestInfo } = useTestContext();
  setPage(page);
  setTestInfo(testInfo);

  const startService = new StartService();
  const onboardingService = new OnboardingService();
  const adminService = new AdminService();
  const cleanupService = new AdminCleanupService();
  const quizPathParams = "/uk/app/sign-up/long/charlie/age-range";

  await test.step("Start Flow", async () => {
    await startService.openApp({
      cookieAction: "accept",
      path: quizPathParams,
    });
  });

  await test.step("Onboarding processing", async () => {
    await onboardingService.passObFunnel();
  });

  await test.step("Open admin panel", async () => {
    await adminService.openAdminPanel();
  });

  await test.step("Cleanup created user", async () => {
    await cleanupService.cleanupCreatedUser();
  });
});
