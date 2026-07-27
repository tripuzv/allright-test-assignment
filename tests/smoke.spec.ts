import { test } from "@playwright/test";
import { StartService } from "@services/start.service.ts";
import { OnboardingService } from "@services/onboarding.service.ts";
import { AdminService } from "@services/admin.service.ts";
import { useTestContext } from "@context/use.test.context.ts";
import { timeouts } from "@constants/timeouts.constants.ts";

test.setTimeout(3 * timeouts.minute);
test("@smoke Test", async ({ page }, testInfo) => {
  const { setPage, setTestInfo } = useTestContext();
  setPage(page);
  setTestInfo(testInfo);

  const startService = new StartService();
  const onboardingService = new OnboardingService();
  const adminService = new AdminService();
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
  await test.step("Switch to desktop", async () => {
    await adminService.switchToDesktop();
  });
  await test.step("Open Admin panel flow", async () => {
    await adminService.openAdminPanel();
  });
  await test.step("Search student by email", async () => {
    await adminService.searchStudentByEmail();
  });
  await test.step("Select random teacher", async () => {
    await adminService.selectRandomTeacher();
  });
  await test.step("Book lesson slot", async () => {
    await adminService.bookLessonSlot();
  });
  await test.step("Delete lesson", async () => {
    await adminService.deleteBooking();
  });
  await test.step("Cleanup created user", async () => {
    await adminService.cleanupCreatedUser();
  });
});
