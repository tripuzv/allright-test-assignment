import { Locator } from "@playwright/test";

export interface IWaitForOptions {
  timeout: number;
  throwError?: boolean;
}

export interface IClickRandomOptions {
  shouldReportChosenObOptions?: boolean;
}

export interface IGetElement {
  element: Locator;
  index: number;
}

export interface IGetRandomElements {
  shuffledElements: Locator[];
  indexes: number[];
}
