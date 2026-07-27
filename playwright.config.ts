import { defineConfig, devices } from "@playwright/test";
import { envHelper } from "@helpers/env/env.helper";
import { deviceMapper } from "@data/devices.mapper";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });
function setTestDeviceName() {
  if (!process.env.DEVICE_TYPE) {
    process.env.DEVICE_TYPE = "Ios";
  }
  return deviceMapper[process.env.DEVICE_TYPE].deviceName;
}
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "on-failure" }],
    [
      "allure-playwright",
      {
        resultsDir: "allure-results",
        detail: false,
        suiteTitle: false,
      },
    ],
  ],
  use: {
    headless: process.env.HEADLESS === "true",
    locale: "en-US",
    trace: "on",
    testIdAttribute: "data-testid",
    screenshot: "only-on-failure",
    browserName: envHelper.browserName ?? "webkit",
    isMobile: true,
  },

  projects: [
    {
      name: "smoke",
      testMatch: ["smoke.spec.ts"],
      use: {
        ...devices[setTestDeviceName()],
      },
    },
  ],
  globalSetup: require.resolve("./src/config/global.setup"),
  globalTeardown: require.resolve("./src/config/global.teardown"),
});
