import path from "path";
import fs from "fs";

export const pathMagicStrings = {
  root: process.cwd(),
  get artifacts(): string {
    return `${this.root}/artifacts`;
  },
  get funnelData(): string {
    return `${this.artifacts}/funnelData`;
  },
  get screenshots(): string {
    return `${this.artifacts}/screenshots`;
  },
  get requests(): string {
    return `${this.artifacts}/requests`;
  },
  get logs(): string {
    return `${this.artifacts}/logs`;
  },
  get allureResults() {
    return `${this.root}/allure-results`;
  },
  get allureReport() {
    return `${this.root}/allure-report`;
  },
  get allureTestCasesDir() {
    return path.join(this.allureReport, "data/test-cases");
  },
  get allureTestCases() {
    const dirPath = this.allureTestCasesDir;
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));
    return files.map((f) => path.join(dirPath, f));
  },
  get allureSummaryDir() {
    return `${this.artifacts}/summary`;
  },
  get allureSummaryPath() {
    return `${this.artifacts}/summary`;
  },
};
