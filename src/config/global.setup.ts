import { FullConfig } from "@playwright/test";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { magicStrings } from "@data/magic-strings/magic.strings.ts";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function globalSetup(_: FullConfig) {
  await cleanDirectoriesBeforeRun();
  await prepareDirectoriesBeforeRun();
}

async function cleanDirectoriesBeforeRun(): Promise<void> {
  const directories = [
    magicStrings.path.allureReport,
    magicStrings.path.allureResults,
    magicStrings.path.artifacts,
  ];

  directories.forEach((dir) => {
    if (fs.existsSync(dir)) {
      console.log(`Clearing ${dir} ...`);
      fs.rmSync(dir, { recursive: true });
    }
  });
}

async function prepareDirectoriesBeforeRun(): Promise<void> {
  const directories = [
    magicStrings.path.artifacts,
    magicStrings.path.screenshots,
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`${dir} is ready for new test run.`);
    }
  });
}

export default globalSetup;
