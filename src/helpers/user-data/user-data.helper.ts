import { faker } from "@faker-js/faker";
import { envHelper } from "@helpers/env/env.helper.ts";

export const userDataHelper = {
  server: envHelper.environment,
  emailPrefix: "aqa-test-",
  emailEnding: "@applyft.co",
  defaultPassword: "Password123!",

  generateEmail(): string {
    return `${this.emailPrefix}${Math.random().toString(36).substring(2, 15)}${this.emailEnding}`;
  },

  getDefaultPassword(): string {
    return this.defaultPassword;
  },

  getRandom: {
    firstName(): string {
      return faker.person.firstName();
    },
    lastName(): string {
      return faker.person.lastName();
    },
    phoneNumber(): string {
      return faker.phone.number({ style: "international" });
    },
    zipCode(): string {
      return faker.location.zipCode();
    },
  },
}
