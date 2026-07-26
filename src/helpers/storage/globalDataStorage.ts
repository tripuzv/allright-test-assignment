import { Nullable } from "../types/global.types.ts";

class GlobalDataStorage {
  private static instance: GlobalDataStorage;
  private data: Record<string, any> = {};

  private constructor() {}

  public static getInstance(): GlobalDataStorage {
    if (!GlobalDataStorage.instance) {
      GlobalDataStorage.instance = new GlobalDataStorage();
    }
    return GlobalDataStorage.instance;
  }

  set<T>(key: string, value: T): void {
    this.data[key] = value;
  }

  get<T>(key: string): Nullable<T> {
    return this.data[key] ?? null;
  }

  clear(): void {
    this.data = {};
  }
  deleteByKey(key: string): void {
    delete this.data[key];
  }
  getAllData(): Record<string, any> {
    return { ...this.data };
  }
}

export const globalStore = GlobalDataStorage.getInstance();
