import { ITemplateMapper } from "../../types/global.types.ts";
import { AgeRangePo } from "@pom/onboarding/age-range.po.ts";
import { ChildKnowEnglishPo } from "@pom/onboarding/child-know-english.po.ts";
import { PlanLessonPo } from "@pom/onboarding/plan-lesson.po.ts";
import { MainThingPo } from "@pom/onboarding/main-thing.po.ts";
import { ScheduleFlexibilityPo } from "@pom/onboarding/schedule-flexibility.po.ts";
import { ControlSchedulePo } from "@pom/onboarding/control-schedule.po.ts";
import { ChildDevicePo } from "@pom/onboarding/child-device.po.ts";
import { ChildDeviceAdvicePo } from "@pom/onboarding/child-device-advice.po.ts";
import { SpeakingClubsPo } from "@pom/onboarding/speaking-clubs.po.ts";
import { SpeakingClubsInfoPo } from "@pom/onboarding/speaking-clubs-info.po.ts";
import { ProgressPo } from "@pom/onboarding/progress.po.ts";
import { HomeworkPo } from "@pom/onboarding/homework.po.ts";
import { RepeatMaterialPo } from "@pom/onboarding/repeat-material.po.ts";
import { LessonFormatPo } from "@pom/onboarding/lesson-format.po.ts";
import { ChildNamePo } from "@pom/onboarding/child-name.po.ts";
import { TemperamentChildPo } from "@pom/onboarding/temperament-child.po.ts";
import { ChildHobbyPo } from "@pom/onboarding/child-hobby.po.ts";
import { UserInfoNamePo } from "@pom/onboarding/user-info-name.po.ts";
import { UserInfoPhonePo } from "@pom/onboarding/user-info-phone.po.ts";
import { UserInfoEmailPo } from "@pom/onboarding/user-info-email.po.ts";
import { RequestGottenPo } from "@pom/onboarding/request-gotten.po.ts";

export const templateMapper: ITemplateMapper = {
  "age-range": {
    templateId: "age-range",
    pageReference: AgeRangePo,
    analytics: {},
    screenValues: {},
  },
  "child-know-english": {
    templateId: "child-know-english",
    pageReference: ChildKnowEnglishPo,
    analytics: {},
    screenValues: {},
  },
  "plan-lesson": {
    templateId: "plan-lesson",
    pageReference: PlanLessonPo,
    analytics: {},
    screenValues: {},
  },
  "main-thing": {
    templateId: "main-thing",
    pageReference: MainThingPo,
    analytics: {},
    screenValues: {},
  },
  "schedule-flexibility": {
    templateId: "schedule-flexibility",
    pageReference: ScheduleFlexibilityPo,
    analytics: {},
    screenValues: {},
  },
  "control-schedule": {
    templateId: "control-schedule",
    pageReference: ControlSchedulePo,
    analytics: {},
    screenValues: {},
  },
  "child-device": {
    templateId: "child-device",
    pageReference: ChildDevicePo,
    analytics: {},
    screenValues: {},
  },
  "child-device-advice": {
    templateId: "child-device-advice",
    pageReference: ChildDeviceAdvicePo,
    analytics: {},
    screenValues: {},
  },
  "speaking-clubs": {
    templateId: "speaking-clubs",
    pageReference: SpeakingClubsPo,
    analytics: {},
    screenValues: {},
  },
  "speaking-clubs-info": {
    templateId: "speaking-clubs-info",
    pageReference: SpeakingClubsInfoPo,
    analytics: {},
    screenValues: {},
  },
  progress: {
    templateId: "progress",
    pageReference: ProgressPo,
    analytics: {},
    screenValues: {},
  },
  homework: {
    templateId: "homework",
    pageReference: HomeworkPo,
    analytics: {},
    screenValues: {},
  },
  "repeat-material": {
    templateId: "repeat-material",
    pageReference: RepeatMaterialPo,
    analytics: {},
    screenValues: {},
  },
  "lesson-format": {
    templateId: "lesson-format",
    pageReference: LessonFormatPo,
    analytics: {},
    screenValues: {},
  },
  "child-name": {
    templateId: "child-name",
    pageReference: ChildNamePo,
    analytics: {},
    screenValues: {},
  },
  "temperament-child": {
    templateId: "temperament-child",
    pageReference: TemperamentChildPo,
    analytics: {},
    screenValues: {},
  },
  "child-hobby": {
    templateId: "child-hobby",
    pageReference: ChildHobbyPo,
    analytics: {},
    screenValues: {},
  },
  "user-info-name": {
    templateId: "user-info-name",
    pageReference: UserInfoNamePo,
    analytics: {},
    screenValues: {},
  },
  "user-info-phone": {
    templateId: "user-info-phone",
    pageReference: UserInfoPhonePo,
    analytics: {},
    screenValues: {},
  },
  "user-info-email": {
    templateId: "user-info-email",
    pageReference: UserInfoEmailPo,
    analytics: {},
    screenValues: {},
  },
  "request-gotten": {
    templateId: "request-gotten",
    pageReference: RequestGottenPo,
    analytics: {},
    screenValues: {},
  },
};
