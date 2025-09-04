import {FileTypeEnum} from "@/protobuf/photosphere-file.ts";

export const getFileTypeIcon = (fileType: FileTypeEnum) => {
  switch (fileType) {
    case FileTypeEnum.IMAGE:
      return 'image';
    case FileTypeEnum.VIDEO:
      return 'videocam';
    case FileTypeEnum.FILE:
    default:
      return 'description';
  }
};

export const getFileTypeColor = (fileType: FileTypeEnum) => {
  switch (fileType) {
    case FileTypeEnum.IMAGE:
      return 'green';
    case FileTypeEnum.VIDEO:
      return 'red';
    case FileTypeEnum.FILE:
    default:
      return 'blue';
  }
};
