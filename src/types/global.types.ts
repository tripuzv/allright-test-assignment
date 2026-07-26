import { BasePo } from "@pom/base/base.po";
import { OnboardingPo } from "@pom/base/onboarding.po.ts";

type StringOrEmpty = string | "";
type Nullable<T> = T | null;

type Environment = "stage" | "prod";

interface IProxyCredentials {
  username: string;
  password: string;
  host: string;
}

interface ApiConfig {
  url: string;
  key: string;
}

interface PlatformConfig {
  stage: ApiConfig;
  prod: ApiConfig;
}

interface ProjectConfig {
  web: PlatformConfig;
}

type ApiData = Record<string, ProjectConfig>;

interface IUserRegistrationInfo {
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface IScreenValuesData {
  [key: string]: any;
}

interface IAnalyticData {
  tikTok?: string[];
}

interface ITemplateMapper {
  [key: string]: {
    templateId: string;
    pageReference: new () => OnboardingPo | BasePo;
    analytics: IAnalyticData;
    screenValues: IScreenValuesData;
  };
}

interface IHandleAnalyticsOptions {
  shouldLogEvent?: boolean;
}

export type {
  StringOrEmpty,
  Nullable,
  Environment,
  ApiConfig,
  PlatformConfig,
  ProjectConfig,
  ApiData,
  IUserRegistrationInfo,
  IScreenValuesData,
  IAnalyticData,
  ITemplateMapper,
  IHandleAnalyticsOptions,
  IProxyCredentials,
};

export interface IPageObjectCaseFunctionArgs {}
