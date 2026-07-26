export interface IAllureStatisticObject {
  total: number;
  passed: number;
  failed: number;
  other: number;
  skipped: number;
}

export interface IAllureTime {
  start: number;
  stop: number;
  duration: number;
}

export interface IAllureAttachment {
  uid: string;
  name: string;
  source?: string;
  type: string;
  size?: number;
}

export interface IAllureStep {
  name: string;
  status: string; 
  statusMessage?: string;
  statusTrace?: string;
  time: IAllureTime;
  steps: IAllureStep[]; 
  attachments: IAllureAttachment[];
  parameters: any[]; 
  shouldDisplayMessage?: boolean;
  stepsCount?: number;
  attachmentsCount?: number;
  hasContent?: boolean;
  attachmentStep?: boolean;
}

export interface AllureTestStage {
  status: string;
  statusMessage?: string;
  statusTrace?: string;
  steps: IAllureStep[];
  attachments: IAllureAttachment[];
  parameters: any[];
  shouldDisplayMessage?: boolean;
  stepsCount?: number;
  attachmentsCount?: number;
  hasContent?: boolean;
}

export interface IAllureTestResult {
  uid: string;
  name: string;
  fullName: string;
  historyId: string;
  time: IAllureTime;
  status: string;
  statusMessage?: string;
  statusTrace?: string;
  flaky: boolean;
  newFailed: boolean;
  newBroken: boolean;
  newPassed: boolean;
  retriesCount: number;
  retriesStatusChange: boolean;
  beforeStages: any[]; 
  testStage: AllureTestStage;
  afterStages: any[]; 
  labels: { name: string; value: string }[];
  parameters: { name: string; value: string }[];
  links: any[]; 
  hidden: boolean;
  retry: boolean;
  extra: {
    severity?: string;
    retries?: any[];
    categories?: { name: string; matchedStatuses: string[]; flaky: boolean }[];
    tags?: string[];
  };
  source?: string; 
  parameterValues?: string[];
}

export interface IStepStatistics {
  total: number;
  passed: number;
  failed: number;
  other: number;
}

export interface ProcessedStepInfo {
  name: string;
  duration: number;
  status: string;
  statusMessage?: string;
  subStepsStatistics: IStepStatistics;
}

export interface ITestStageReport {
  status: string;
  statusMessage?: string;
  topLevelSteps: ProcessedStepInfo[];
  topLevelStepsStatistics: IStepStatistics;
}

export interface ITestCaseStatisticsReport {
  uid: string;
  name: string;
  status: string;
  statusMessage?: string;
  time: {
    start: string;
    stop: string;
    duration: number;
  };
  flaky: boolean;
  parameters: { name: string; value: string }[];
  testStage?: ITestStageReport;
  additionalInfo: {
    retriesCount: number;
    severity?: string;
    tags?: string[];
  };
}
