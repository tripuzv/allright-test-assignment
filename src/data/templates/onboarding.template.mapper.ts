import { ITemplateMapper } from "../../types/global.types.ts";
import { AgeRangePo } from "@pom/onboarding/age-range.po.ts";

export const templateMapper: ITemplateMapper = {
  "age-range": {
    templateId: "age-range",
    pageReference: AgeRangePo,
    analytics: {},
    screenValues: {},
  },
};