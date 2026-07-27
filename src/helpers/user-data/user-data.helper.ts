import { faker } from "@faker-js/faker";
import { parsePhoneNumber } from "libphonenumber-js";
import {
  CountryNames,
  generatePhoneNumber,
  isPhoneNumberValid,
} from "phone-number-generator-js";

type CountryName = (typeof CountryNames)[keyof typeof CountryNames];

type GeneratedPhone = {
  e164: string;
  national: string;
};

export const userDataHelper = {
  emailPrefix: "aqa-test-",
  emailEnding: "@test.mail",

  generateEmail(): string {
    return `${this.emailPrefix}${Math.random().toString(36).substring(2, 15)}${this.emailEnding}`;
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
  },
};
