import { test } from "@playwright/test";

export function step(stepName?: string) {
  return function decorator(target: Function, _: ClassMethodDecoratorContext) {
    return function replacementMethod(...args: any) {
      return test.step(stepName, async () => {
        // @ts-ignore
        return await target.call(this, ...args);
      });
    };
  };
}
