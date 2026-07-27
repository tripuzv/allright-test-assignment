import { LocalStorageHelper } from "@helpers/storage/local-storage.helper.ts";

const EMBER_AUTH_SESSION_KEY = "ember_simple_auth-session";

type EmberAuthSession = {
  authenticated?: {
    access_token?: string;
    user_id?: number;
  };
};

export class AdminSessionHelper {
  private readonly localStorage = new LocalStorageHelper();

  async getAccessToken(): Promise<string> {
    const raw = await this.localStorage.getLocalStorageDataByKey(
      EMBER_AUTH_SESSION_KEY,
    );

    if (!raw) {
      throw new Error(`${EMBER_AUTH_SESSION_KEY} not found in localStorage`);
    }

    const session = JSON.parse(raw) as EmberAuthSession;
    const token = session.authenticated?.access_token;

    if (!token) {
      throw new Error(`access_token not found in ${EMBER_AUTH_SESSION_KEY}`);
    }

    return token;
  }

  async getAdminUserId(): Promise<string | undefined> {
    const raw = await this.localStorage.getLocalStorageDataByKey(
      EMBER_AUTH_SESSION_KEY,
    );

    if (!raw) {
      return undefined;
    }

    const session = JSON.parse(raw) as EmberAuthSession;
    return session.authenticated?.user_id?.toString();
  }
}
