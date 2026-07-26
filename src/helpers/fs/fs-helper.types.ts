export interface ISaveFileArgs {
  name: string;
  data: object | string | number | boolean;
  directoryName: string;
  extension?: FileExtension;
}

export enum FileExtension {
  json = "json",
  txt = "txt",
}
