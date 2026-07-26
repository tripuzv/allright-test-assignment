export const dateHelper = {
  getCurrentTime(): string {
    const options: Intl.DateTimeFormatOptions = {
      hourCycle: "h24",
    };
    return new Date(Date.now()).toLocaleTimeString("en-US", options);
  },
  getSessionTime(): string {
    return new Date().toISOString().replace(/:/g, "-");
  },
};
