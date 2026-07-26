export const dateHelper = {
  /** Filesystem-safe time stamp (HH-MM-SS). Colons break GitHub upload-artifact / NTFS. */
  getCurrentTime(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  },
  getSessionTime(): string {
    return new Date().toISOString().replace(/:/g, "-");
  },
};
