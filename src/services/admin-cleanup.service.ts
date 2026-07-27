import axios, { AxiosInstance } from "axios";
import { BaseService } from "@services/base.service.ts";
import { step } from "@decorators/step.ts";
import { envHelper } from "@helpers/env/env.helper.ts";
import { adminConstants } from "@constants/admin.constants.ts";
import { globalStore } from "@helpers/storage/global-data.storage.ts";
import { AdminSessionHelper } from "@helpers/auth/admin-session.helper.ts";

type JsonApiResource = {
  id?: string;
  type?: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, unknown>;
};

type JsonApiUserResponse = {
  data?: JsonApiResource;
};

export class AdminCleanupService extends BaseService {
  private readonly adminSession = new AdminSessionHelper();

  @step("Cleanup created user via API")
  async cleanupCreatedUser(userId?: string): Promise<void> {
    const id = userId ?? globalStore.get<string>("createdUserId");

    if (!id) {
      throw new Error("createdUserId not found for cleanup");
    }

    const client = await this.createApiClient();
    const { data: userResponse } = await client.get<JsonApiUserResponse>(
      `/api/v1/users/${id}`,
    );

    const userData = userResponse.data;

    if (!userData) {
      throw new Error(`User ${id} not found for cleanup`);
    }

    const patchBody = {
      data: {
        ...userData,
        attributes: {
          ...userData.attributes,
          "is-deleted": true,
          "deletion-reason": {
            code: "1",
            message: adminConstants.cleanupUserReason,
          },
        },
      },
    };

    const response = await client.patch(
      `/api/v1/users/${id}/?fields[user]=is_deleted,deletion_reason`,
      patchBody,
    );

    if (response.status !== 200) {
      throw new Error(
        `User cleanup failed with status ${response.status}: ${JSON.stringify(response.data)}`,
      );
    }

    this.logger.info(`User ${id} deleted via API cleanup`);
  }

  private async createApiClient(): Promise<AxiosInstance> {
    const token = await this.adminSession.getAccessToken();
    const adminUserId = await this.adminSession.getAdminUserId();

    return axios.create({
      baseURL: envHelper.quizBaseUrl,
      headers: {
        accept: "application/vnd.api+json",
        "content-type": "application/vnd.api+json",
        authorization: `Bearer ${token}`,
        "accept-language": "uk",
        baggage: "service.name=frontend-ember",
        ...(adminUserId ? { "x-request-id": adminUserId } : {}),
      },
    });
  }
}
