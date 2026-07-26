import { step } from "@decorators/step.ts";
import { ApiSchemaValidator } from "@validators/api-schema.validator.ts";
import {
  ApiNetworkInterceptor,
  CapturedApiCall,
} from "@interceptors/api-network.interceptor.ts";
import { assertHelper } from "@helpers/asserts/assert.helper.ts";
import { timeouts } from "@constants/timeouts.constants.ts";
import { globalStore } from "@helpers/storage/global-data.storage.ts";

type JsonApiUserPayload = {
  data?: {
    attributes?: Record<string, unknown>;
    relationships?: {
      "user-metum"?: {
        data?: {
          attributes?: Record<string, unknown>;
        };
      };
    };
  };
  included?: Array<{
    type?: string;
    attributes?: Record<string, unknown>;
  }>;
};

export class OnboardingApiValidator {
  private readonly apiSchemaValidator = new ApiSchemaValidator();
  private readonly interceptor: ApiNetworkInterceptor;

  constructor(interceptor: ApiNetworkInterceptor) {
    this.interceptor = interceptor;
  }

  @step("Validate child-hobbies API schema")
  async validateChildHobbies(): Promise<void> {
    const call = await this.interceptor.waitFor(
      "GET",
      /\/api\/v1\/child-hobbies\/?$/,
    );
    await this.assertOk(call);
    await this.apiSchemaValidator.validate({
      body: call.responseBody,
      schemaType: "response",
      apiType: "backend",
      schemaName: "child-hobbies",
    });
  }

  @step("Validate user create API schemas")
  async validateUserCreate(): Promise<void> {
    const captcha = await this.interceptor.waitFor(
      "GET",
      /\/api\/v1\/users\/check-captcha\/?$/,
    );
    await this.assertOk(captcha);
    await this.apiSchemaValidator.validate({
      body: captcha.responseBody,
      schemaType: "response",
      apiType: "backend",
      schemaName: "users-check-captcha",
    });

    const create = await this.interceptor.waitFor(
      "POST",
      /\/api\/v1\/users\/?$/,
      {
        timeout: timeouts.m,
      },
    );
    await this.assertOk(create);
    await this.apiSchemaValidator.validate({
      body: create.requestBody,
      schemaType: "request",
      apiType: "backend",
      schemaName: "users-create",
    });
    await this.apiSchemaValidator.validate({
      body: create.responseBody,
      schemaType: "response",
      apiType: "backend",
      schemaName: "users-create",
    });
    await this.validateUserIdentityFields(create, {
      checkEmail: false,
      checkPhone: true,
      checkParentName: true,
      checkChildName: true,
      label: "POST /api/v1/users",
    });

    const me = await this.interceptor.waitFor("GET", /\/api\/v1\/users\/?$/, {
      timeout: timeouts.s,
      afterTimestamp: create.timestamp,
    });
    await this.assertOk(me);
    await this.apiSchemaValidator.validate({
      body: me.responseBody,
      schemaType: "response",
      apiType: "backend",
      schemaName: "users-me",
    });
    await this.validateUserIdentityFields(me, {
      checkEmail: false,
      checkPhone: true,
      checkParentName: true,
      checkChildName: true,
      label: "GET /api/v1/users",
    });

    const balances = await this.interceptor.waitFor(
      "GET",
      /\/api\/v1\/users\/\d+\/user-balances\/?$/,
      { timeout: timeouts.s, afterTimestamp: create.timestamp },
    );
    await this.assertOk(balances);
    await this.apiSchemaValidator.validate({
      body: balances.responseBody,
      schemaType: "response",
      apiType: "backend",
      schemaName: "user-balances",
    });
  }

  @step("Validate user email update API schemas")
  async validateUserEmailUpdate(): Promise<void> {
    const updateEmail = await this.interceptor.waitFor(
      "PATCH",
      /\/api\/v1\/users\/\d+\/update-email\/?$/,
      { timeout: timeouts.m },
    );
    await this.assertOk(updateEmail);
    await this.apiSchemaValidator.validate({
      body: updateEmail.requestBody,
      schemaType: "request",
      apiType: "backend",
      schemaName: "users-update-email",
    });
    await this.apiSchemaValidator.validate({
      body: updateEmail.responseBody,
      schemaType: "response",
      apiType: "backend",
      schemaName: "users-update-email",
    });
    await this.validateUserIdentityFields(updateEmail, {
      checkEmail: true,
      checkPhone: true,
      checkParentName: true,
      checkChildName: true,
      label: "PATCH /users/:id/update-email",
    });

    const updateUser = await this.interceptor.waitFor(
      "PATCH",
      /\/api\/v1\/users\/\d+\/?$/,
      {
        timeout: timeouts.s,
        afterTimestamp: updateEmail.timestamp,
      },
    );
    await this.assertOk(updateUser);
    await this.apiSchemaValidator.validate({
      body: updateUser.requestBody,
      schemaType: "request",
      apiType: "backend",
      schemaName: "users-update",
    });
    await this.apiSchemaValidator.validate({
      body: updateUser.responseBody,
      schemaType: "response",
      apiType: "backend",
      schemaName: "users-update",
    });
    await this.validateUserIdentityFields(updateUser, {
      checkEmail: true,
      checkPhone: true,
      checkParentName: true,
      checkChildName: true,
      label: "PATCH /users/:id",
    });
  }

  @step("Validate user identity fields against entered OB data")
  private async validateUserIdentityFields(
    call: CapturedApiCall,
    options: {
      checkEmail: boolean;
      checkPhone: boolean;
      checkParentName: boolean;
      checkChildName: boolean;
      label: string;
    },
  ): Promise<void> {
    const expectedEmail = globalStore.get<string>("userEmail");
    const expectedPhone = globalStore.get<string>("userPhone");
    const expectedParentName = globalStore.get<string>("parentName");
    const expectedChildName = globalStore.get<string>("childName");

    const bodies = [call.requestBody, call.responseBody].filter(Boolean);

    for (const body of bodies) {
      const extracted = this.extractIdentityFields(body as JsonApiUserPayload);
      const bodyKind =
        body === call.requestBody ? "requestBody" : "responseBody";

      if (options.checkEmail && expectedEmail) {
        const actualEmail = extracted.email ?? extracted.newEmail;
        await assertHelper.expectEquals({
          actual: actualEmail,
          expected: expectedEmail,
          message: `${options.label} ${bodyKind} email/new-email must match email from user-info-email screen`,
        });
      }

      if (options.checkPhone && expectedPhone) {
        await assertHelper.expectEquals({
          actual: extracted.phone ? this.normalizePhone(extracted.phone) : null,
          expected: this.normalizePhone(expectedPhone),
          message: `${options.label} ${bodyKind}.phone must match phone from user-info-phone screen`,
        });
      }

      if (options.checkParentName && expectedParentName) {
        await assertHelper.expectEquals({
          actual: extracted.parentName,
          expected: expectedParentName,
          message: `${options.label} ${bodyKind}.name must match parent name from user-info-name screen`,
        });
      }

      if (options.checkChildName && expectedChildName) {
        await assertHelper.expectEquals({
          actual: extracted.childName,
          expected: expectedChildName,
          message: `${options.label} ${bodyKind}.child-name must match name from child-name screen`,
        });
      }
    }
  }

  private extractIdentityFields(body: JsonApiUserPayload): {
    email: string | null;
    newEmail: string | null;
    phone: string | null;
    parentName: string | null;
    childName: string | null;
  } {
    const attrs = body?.data?.attributes ?? {};
    const metaFromRelationship =
      body?.data?.relationships?.["user-metum"]?.data?.attributes ?? {};
    const metaFromIncluded =
      body?.included?.find((item) => item.type === "user-meta")?.attributes ??
      {};

    const childName =
      this.asNonEmptyString(metaFromRelationship["child-name"]) ??
      this.asNonEmptyString(metaFromIncluded["child-name"]);

    return {
      email: this.asNonEmptyString(attrs.email),
      newEmail: this.asNonEmptyString(attrs["new-email"]),
      phone: this.asNonEmptyString(attrs.phone),
      parentName: this.asNonEmptyString(attrs.name),
      childName,
    };
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, "");
  }

  private asNonEmptyString(value: unknown): string | null {
    if (typeof value !== "string") {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  private async assertOk(call: CapturedApiCall): Promise<void> {
    await assertHelper.expectEquals({
      actual: call.status,
      expected: 200,
      message: `${call.method} ${call.path} should return 200`,
    });
  }
}
