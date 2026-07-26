import { languageLocales } from "@constants/language.constants";
import { Nullable } from "../../types/global.types.ts";

export const dateHelper = {
  getCurrentTime(): string {
    const options: Intl.DateTimeFormatOptions = {
      hourCycle: "h24",
    };
    return new Date(Date.now()).toLocaleTimeString(
      `${languageLocales.en}`,
      options,
    );
  },
  getSessionTime(): string {
    return new Date().toISOString().replace(/:/g, "-");
  },
  convertDateToEventLabelFormat(date: string): string {
    const [year, month, day] = date.split("-");
    return `${day}_${month}_${year}`;
  },

  getOccasionDate(occasionDate?: string): Nullable<string> {
    if (occasionDate) {
      const date = new Date(occasionDate);
      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const year = date.getUTCFullYear();

      return `${day}-${month}-${year}`;
    }

    return null;
  },
};
