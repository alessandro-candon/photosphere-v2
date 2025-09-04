import {FileTypeEnum} from "@/protobuf/photosphere-file.ts";

export interface IPhotosphereViewFile {
  signedThumbnailUrl: string | false;
  sourceUri: string;
  fileType: FileTypeEnum;
  hash: string;
}
