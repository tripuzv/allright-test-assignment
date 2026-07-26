import * as fs from "fs/promises";
import * as path from "path";
import addFormats from "ajv-formats";
import test, { expect } from "@playwright/test";
import { LoggerHelper } from "@helpers/logger/logger.helper.ts";
import { Logger } from "log4js";

const Ajv2020 = require("ajv/dist/2020");

export class ApiSchemaValidator {
  private ajv: any;
  protected logger: Logger;
  protected filePrefix: string = "[Api-Schema-Validator]";

  constructor() {
    this.ajv = new Ajv2020({ allErrors: true, allowUnionTypes: true });
    addFormats(this.ajv);
    this.logger = LoggerHelper.getInstance().getLogger();
  }

  async validate(args: {
    body: any;
    schemaType: "request" | "response";
    apiType: "backend";
    schemaName: string;
  }): Promise<void> {
    await test.step(`Validate ${args.schemaType} schema for ${args.schemaName}`, async () => {
      try {
        const schemaPath = path.join(
          __dirname,
          "schemas",
          `${args.apiType}/${args.schemaType}/${args.schemaName}.${args.schemaType}.schema.json`,
        );

        this.logger.info(
          `${this.filePrefix} Validating ${args.schemaType} schema for: ${args.schemaName}`,
        );

        const schema = JSON.parse(await fs.readFile(schemaPath, "utf-8"));
        const validate = this.ajv.compile(schema);

        const valid = validate(args.body);

        if (!valid) {
          const errorMessage = `Schema validation failed for ${args.schemaName}: ${JSON.stringify(validate.errors, null, 2)}`;
          this.logger.error(`${this.filePrefix} ${errorMessage}`);
          expect.soft(valid, errorMessage).toBe(true);
          return;
        }

        this.logger.info(
          `${this.filePrefix} ${args.schemaType} schema validation passed for: ${args.schemaName}`,
        );
      } catch (err) {
        const errorMessage = `Failed to validate api schema for ${args.schemaName}: ${err}`;
        this.logger.error(`${this.filePrefix} ${errorMessage}`);
        expect.soft(false, errorMessage).toBe(true);
      }
    });
  }
}
