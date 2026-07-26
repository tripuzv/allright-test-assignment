import * as fs from "fs";
import { PathOrFileDescriptor } from "fs";
import { FileExtension, ISaveFileArgs } from "@helpers/fs/fs.types.ts";
import { formatHelper } from "@helpers/formatter/format.helper.ts";
import { LoggerHelper } from "@helpers/logger/logger.helper.ts";
import { Logger } from "log4js";

export class FsHelper {
  protected logger: Logger;

  constructor() {
    this.logger = LoggerHelper.getInstance().getLogger();
  }

  async saveFile(args: ISaveFileArgs): Promise<boolean> {
    const { name, data, directoryName, extension = FileExtension.json } = args;
    const fullFileName = `${name}.${extension}`;

    await this.createDirIfNotExist(directoryName);
    this.logger.info(
      `[File System Helper] - Write data to file: ${fullFileName}`,
    );
    fs.writeFile(
      `${directoryName}/${fullFileName}`,
      formatHelper.json.stringify({ value: data }),
      { encoding: "utf-8" },
      (err) => {
        if (err) {
          this.logger.error(
            `[File System Helper] - Failed to create ${fullFileName} `,
            err,
          );
          return false;
        }
      },
    );
    this.logger.info(
      `[File System Helper] - Data writen to file: ${fullFileName}`,
    );
    return true;
  }

  async removeDirectories(directoriesToClean: string[]): Promise<void> {
    directoriesToClean.forEach((dir) => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true });
      }
    });
  }

  async createDirIfNotExist(dirName: string): Promise<void> {
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true });
    }
  }

  writeFile(file: PathOrFileDescriptor, data: string): void {
    fs.writeFileSync(file, data);
  }

  readFile(path: PathOrFileDescriptor, data: BufferEncoding): string {
    return fs.readFileSync(path, data);
  }
}
