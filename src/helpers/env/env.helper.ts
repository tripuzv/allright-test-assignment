import { EnvVariable } from "@helpers/env/env.types.ts";
import { Environment } from "../../types/global.types.ts";
import { urlConstants } from "@constants/url.constants.ts";
  
export class EnvHelper {
  private getVariableByName(variableName: string, skipError = false): string {
    const value = process.env[variableName];

    if (!value && skipError === false) {
      throw new Error(`Need to define environment variable: ${variableName}`);
    }
    return value;
  }

  get environment(): Environment {
    return this.getVariableByName(EnvVariable.SERVER) as Environment;
  }

  get isCI(): boolean {
    return this.getVariableByName(EnvVariable.IS_CI) === "true";
  }

  get baseUrl(): string {
    return urlConstants[this.environment as keyof typeof urlConstants];
  }


  getLogLevel(): string {
    return this.getVariableByName(EnvVariable.LOG_LEVEL, true) ?? "info";
  }


  get groupScreenshots(): boolean {
    return this.getVariableByName(EnvVariable.GROUP_SCREENSHOTS, true) as string === "true" ? true : false;
  }

  get browserName(): "chromium" | "firefox" | "webkit" | undefined {
    const value = this.getVariableByName(EnvVariable.BROWSER_NAME, true);
    const allowed: Array<"chromium" | "firefox" | "webkit"> = ["chromium", "firefox", "webkit"];
    return allowed.includes(value as any) ? (value as "chromium" | "firefox" | "webkit") : undefined;
  }
}

export const envHelper = new EnvHelper();
