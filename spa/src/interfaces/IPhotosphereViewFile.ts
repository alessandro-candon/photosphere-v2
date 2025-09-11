export interface IPhotosphereViewFile {
  signedThumbnailUrl: string | false;
  sourceUri: string;
  fileType: FileTypeEnum;
  hash: string;
  createdAtTimestamp?: number; // Added for day-by-day segmentation
}

export interface IPhotosphereFile {
  sourceBucketUri: string;
  sourceBucketThumbnailUri: string;
  fileType: FileTypeEnum;
  createdAtTimestamp: number;
  geohash: string;
  hash: string;
}

export enum FileTypeEnum {
  FILE = 0,
  IMAGE = 1,
  VIDEO = 2,
}

export interface IPhotosphereFileSignedUrls extends IPhotosphereFile {
  signedSourceBucketUri: string;
  signedSourceBucketThumbnailUri: string;
}
