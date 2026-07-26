import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { ICaptureScreenshotArgs } from "@helpers/screenshot/types/screenshot.types.ts";
import { BaseHelper } from "@helpers/base/base.helper.ts";
import { magicStrings } from "@data/magic-strings/magic.strings.ts";
import { dateHelper } from "@helpers/date/date.helper.ts";
import { getScreenshotHtmlTemplate } from "@helpers/screenshot/screenshot.html.template.ts";

export class ScreenshotHelper extends BaseHelper {
  private screenshotDir: string = magicStrings.path.screenshots;
  private screenshotHtmlDir: string = magicStrings.path.artifacts;
  constructor() {
    super();
  }

  async capture({
    name,
    isFullPage = false,
  }: ICaptureScreenshotArgs): Promise<void> {
    const timeStamp = dateHelper.getCurrentTime();
    await fs.mkdir(this.screenshotDir, { recursive: true });

    try {
      await this.page.waitForLoadState("domcontentloaded");
      if (isFullPage) {
        await this.page.addStyleTag({
          content: `
            html, body { height: auto !important; overflow: visible !important; }
            body { position: static !important; top: auto !important; width: auto !important; }
            #__next, main { height: auto !important; overflow: visible !important; max-height: none !important; }
          `,
        });
        await this.page.waitForTimeout(100);
      }

      const buffer = await this.page.screenshot({ fullPage: isFullPage });

      const { width, height } = await sharp(buffer).metadata();
      const vp = this.page.viewportSize();

      const actualWidth = width ?? vp?.width ?? 0;
      const actualHeight = height ?? vp?.height ?? 0;

      const screenshotPath = path.join(
        this.screenshotDir,
        `${timeStamp}__${name}__${actualWidth}x${actualHeight}.png`,
      );

      await fs.writeFile(screenshotPath, buffer);
      await this.reporter.attachImage(name, buffer);

      this.logger.debug(
        `${isFullPage ? "Full page " : ""}Screenshot saved: ${screenshotPath} (${actualWidth}x${actualHeight})`,
      );
    } catch (error) {
      this.logger.error(`Failed to capture screenshot: ${error}`);
      throw error;
    }
  }

  async groupScreenshots(
    groupName: string = "grouped-screenshots",
  ): Promise<void> {
    const imagesPerRow = 5;
    const rowGap = 100;
    const colGap = 20;
    const borderWidth = 2;
    this.logger.info(`Grouping screenshots from ${this.screenshotDir}`);
    try {
      const files = await fs.readdir(this.screenshotDir);

      const screenshotFiles = files
        .filter(
          (file) =>
            file.endsWith(".png") && !file.includes("grouped-screenshots"),
        )
        .map((file) => {
          const match = file.match(/^(\d{2}[:\-]\d{2}[:\-]\d{2})__/);
          return match ? file : null;
        })
        .filter(Boolean) as string[];

      if (screenshotFiles.length === 0) {
        this.logger.warn("No screenshots found to group");
        return;
      }

      screenshotFiles.sort();

      const screenshotData: Array<{ fileName: string; dataUri: string }> = [];

      for (const file of screenshotFiles) {
        const filePath = path.join(this.screenshotDir, file);
        const imageBuffer = await fs.readFile(filePath);
        const base64 = imageBuffer.toString("base64");
        const dataUri = `data:image/png;base64,${base64}`;
        screenshotData.push({ fileName: file, dataUri });
      }

      this.logger.debug(
        `Loaded ${screenshotData.length} screenshots as base64 data URIs`,
      );

      const html = getScreenshotHtmlTemplate(
        imagesPerRow,
        rowGap,
        colGap,
        borderWidth,
        screenshotData,
      );

      const htmlPath = path.join(this.screenshotHtmlDir, `${groupName}.html`);
      await fs.writeFile(htmlPath, html, "utf-8");

      this.logger.info(
        `Grouped screenshots HTML saved: ${htmlPath} (${screenshotData.length} screenshots embedded as base64)`,
      );
    } catch (error) {
      this.logger.error(`Failed to group screenshots: ${error}`);
      throw error;
    }
  }
}
