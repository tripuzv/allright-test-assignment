import { BasePo } from "@pom/base/base.po";
import { OnboardingPo } from "@pom/base/onboarding.po.ts";

type Nullable<T> = T | null;
type Environment = "stage" | "prod";

interface ITemplateMapper {
  [key: string]: {
    templateId: string;
    pageReference: new () => OnboardingPo | BasePo;
  };
}

export type { Nullable, Environment, ITemplateMapper };
