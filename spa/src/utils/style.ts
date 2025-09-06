import {FileTypeEnum} from "@/interfaces/IPhotosphereViewFile.ts";

export const getFileTypeLabel = (fileType: FileTypeEnum) => {
  switch (fileType) {
    case FileTypeEnum.IMAGE:
      return 'Image';
    case FileTypeEnum.VIDEO:
      return 'Video';
    case FileTypeEnum.FILE:
      return 'File';
    default:
      return 'Unknown';
  }
}

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
