import { faker } from "@faker-js/faker";
import { envHelper } from "@helpers/env/env.helper.ts";
import { parsePhoneNumber } from "libphonenumber-js";
import {
  CountryNames,
  generatePhoneNumber,
  isPhoneNumberValid,
} from "phone-number-generator-js";

type CountryName = (typeof CountryNames)[keyof typeof CountryNames];

export type GeneratedPhone = {
  e164: string;
  national: string;
};

export const userDataHelper = {
  server: envHelper.environment,
  emailPrefix: "aqa-test-",
  emailEnding: "@test.mail",
  defaultPassword: "Password123!",

  generateEmail(): string {
    return `${this.emailPrefix}${Math.random().toString(36).substring(2, 15)}${this.emailEnding}`;
  },

  getDefaultPassword(): string {
    return this.defaultPassword;
  },

  generateValidPhone(countryName: CountryName): GeneratedPhone {
    for (let attempt = 0; attempt < 10; attempt++) {
      const e164 = generatePhoneNumber({ countryName });
      if (!isPhoneNumberValid(e164)) {
        continue;
      }

      const parsed = parsePhoneNumber(e164);
      if (!parsed?.nationalNumber) {
        continue;
      }

      return { e164, national: parsed.nationalNumber };
    }
    throw new Error(
      `Failed to generate valid phone number for country: ${countryName}`,
    );
  },

  getRandom: {
    firstName(): string {
      return faker.person.firstName();
    },
    lastName(): string {
      return faker.person.lastName();
    },
    phoneNumber(countryName?: CountryName): string {
      if (countryName) {
        return userDataHelper.generateValidPhone(countryName).e164;
      }
      return faker.phone.number({ style: "international" });
    },
    zipCode(): string {
      return faker.location.zipCode();
    },
  },
};
