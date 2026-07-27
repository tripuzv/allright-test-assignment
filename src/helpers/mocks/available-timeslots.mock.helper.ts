import { apiConstants } from "@constants/api.constants.ts";

export type AvailableTimeslotResource = {
  type: typeof apiConstants.availableTimeslotType;
  id: string;
  attributes: {
    "time-start": string;
  };
};

export type AvailableTimeslotsResponse = {
  data: AvailableTimeslotResource[];
};

const pad = (value: number): string => String(value).padStart(2, "0");

const parseTime = (time: string): { hours: number; minutes: number } => {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours, minutes };
};

const formatSlotId = (
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
): string => {
  const datePart = `${year}-${pad(month)}-${pad(day)}`;
  const timePart = `${pad(hours)}:${pad(minutes)}:00`;

  return `${datePart} ${timePart}_${apiConstants.availableTimeslotIdSuffix}`;
};

const formatTimeStart = (
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
): string => {
  return `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00.000${apiConstants.availableTimeslotsTimezoneOffset}`;
};

const startOfDay = (date: Date): Date => {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
};

const buildSlot = (
  year: number,
  month: number,
  day: number,
  time: string,
): AvailableTimeslotResource => {
  const { hours, minutes } = parseTime(time);

  return {
    type: apiConstants.availableTimeslotType,
    id: formatSlotId(year, month, day, hours, minutes),
    attributes: {
      "time-start": formatTimeStart(year, month, day, hours, minutes),
    },
  };
};

export const availableTimeslotsMockHelper = {
  buildResponse(options: {
    days?: number;
    startDate?: Date;
  } = {}): AvailableTimeslotsResponse {
    const days = options.days ?? apiConstants.availableTimeslotsDays;
    const startDate = startOfDay(options.startDate ?? new Date());

    if (!options.startDate) {
      startDate.setDate(startDate.getDate() + 1);
    }

    const data: AvailableTimeslotResource[] = [];

    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + dayOffset);

      const year = day.getFullYear();
      const month = day.getMonth() + 1;
      const dayOfMonth = day.getDate();

      const times =
        dayOffset === 0
          ? apiConstants.availableTimeslotsFirstDaySlots
          : apiConstants.availableTimeslotsRegularDaySlots;

      for (const time of times) {
        data.push(buildSlot(year, month, dayOfMonth, time));
      }
    }

    return { data };
  },
};
