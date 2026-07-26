export const getScreenshotHtmlTemplate = (
  imagesPerRow: number,
  rowGap: number,
  colGap: number,
  borderWidth: number,
  screenshotData: Array<{ fileName: string; dataUri: string }>,
): string => {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Grouped Screenshots</title>
  <style>
    body {
      margin: 0;
      padding: 32px;
      background: #fff;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(${imagesPerRow}, auto);
      column-gap: ${colGap}px;
      row-gap: ${rowGap}px;
      align-items: start;
      justify-items: start;
    }
    .cell {
      border: ${borderWidth}px solid red;
      display: inline-flex;
      flex-direction: column;
      max-width: 360px;
    }
    .label {
      font-size: 12px;
      padding: 4px 6px;
      background: #fff;
      border-bottom: 1px solid #ddd;
      word-break: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      min-width: 0;
      width: 100%;
      box-sizing: border-box;
    }
    img {
      display: block;
      width: 100%;
      max-width: 360px;
      height: auto;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <div class="grid">
    ${screenshotData
      .map(
        ({ fileName, dataUri }) => `
      <div class="cell">
        <div class="label">${fileName}</div>
        <img src="${dataUri}" />
      </div>
    `,
      )
      .join("\n")}
  </div>
</body>
</html>`;
};
