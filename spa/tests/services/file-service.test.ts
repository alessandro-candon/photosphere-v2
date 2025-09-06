import {describe, it, expect, beforeEach} from 'vitest';
import {fileService} from '@/services/file-service.ts';
import {FileTypeEnum, type IPhotosphereFile} from '@/protobuf/photosphere-file.ts';
import type IFileFilters from "@/interfaces/IFileFilters.ts";
import type {IPhotosphereViewFile} from "@/interfaces/IPhotosphereViewFile.ts";

describe('FileService', () => {
  let mockFiles: IPhotosphereFile[];

  const timestamp01 = new Date('2025-02-01').getTime() / 1000;
  const timestamp02 = new Date('2025-02-02').getTime() / 1000;
  const timestamp03 = new Date('2025-02-03').getTime() / 1000;
  const timestamp04 = new Date('2025-02-04').getTime() / 1000;

  beforeEach(() => {
    mockFiles = [
      {
        sourceBucketUri: 'bucket://file1.jpg',
        sourceBucketThumbnailUri: 'bucket://thumb1.jpg',
        fileType: FileTypeEnum.IMAGE,
        createdAtTimestamp: timestamp01,
        hash: 'u4pruydqqvj',
        geohash: 'qwebjnufs'
      },
      {
        sourceBucketUri: 'bucket://file2.mp4',
        sourceBucketThumbnailUri: 'bucket://thumb2.jpg',
        fileType: FileTypeEnum.VIDEO,
        createdAtTimestamp: timestamp01,
        hash: 'u4pruydqqvj',
        geohash: 's1zcx4v5q'
      },
      {
        sourceBucketUri: 'bucket://file3.txt',
        sourceBucketThumbnailUri: 'bucket://thumb3.jpg',
        fileType: FileTypeEnum.FILE,
        createdAtTimestamp: timestamp01,
        hash: 'u4pruydqqvk',
        geohash: 's1zceby7'
      },
      {
        sourceBucketUri: 'bucket://file4.jpg',
        sourceBucketThumbnailUri: 'bucket://thumb4.jpg',
        fileType: FileTypeEnum.IMAGE,
        createdAtTimestamp: timestamp02,
        hash: 'u4pruydqqvj',
        geohash: ''
      },
      {
        sourceBucketUri: 'bucket://file5.mp4',
        sourceBucketThumbnailUri: 'bucket://thumb5.jpg',
        fileType: FileTypeEnum.VIDEO,
        createdAtTimestamp: timestamp02,
        hash: 'u4pruydqqvj',
        geohash: ''
      },
      {
        sourceBucketUri: 'bucket://file6.txt',
        sourceBucketThumbnailUri: 'bucket://thumb6.jpg',
        fileType: FileTypeEnum.FILE,
        createdAtTimestamp: timestamp02,
        hash: 'u4pruydqqvk',
        geohash: ''
      },
      {
        sourceBucketUri: 'bucket://file7.jpg',
        sourceBucketThumbnailUri: 'bucket://thumb7.jpg',
        fileType: FileTypeEnum.IMAGE,
        createdAtTimestamp: timestamp03,
        hash: 'u4pruydqqvj',
        geohash: ''
      },
      {
        sourceBucketUri: 'bucket://file8.mp4',
        sourceBucketThumbnailUri: 'bucket://thumb8.jpg',
        fileType: FileTypeEnum.VIDEO,
        createdAtTimestamp: timestamp03,
        hash: 'u4pruydqqvj',
        geohash: ''
      },
      {
        sourceBucketUri: 'bucket://file9.txt',
        sourceBucketThumbnailUri: 'bucket://thumb9.jpg',
        fileType: FileTypeEnum.FILE,
        createdAtTimestamp: timestamp03,
        hash: 'u4pruydqqvk',
        geohash: ''
      },
      {
        sourceBucketUri: 'bucket://file10.jpg',
        sourceBucketThumbnailUri: 'bucket://thumb10.jpg',
        fileType: FileTypeEnum.IMAGE,
        createdAtTimestamp: timestamp04,
        hash: 'u4pruydqqvj',
        geohash: ''
      },
      {
        sourceBucketUri: 'bucket://file10.jpg',
        sourceBucketThumbnailUri: 'bucket://thumb10.jpg',
        fileType: FileTypeEnum.IMAGE,
        createdAtTimestamp: 0,
        hash: 'pppppppp',
        geohash: ''
      },
      {
        sourceBucketUri: 'bucket://file10.jpg',
        sourceBucketThumbnailUri: 'bucket://thumb10.jpg',
        fileType: FileTypeEnum.IMAGE,
        createdAtTimestamp: 0,
        hash: 'pppppppp',
        geohash: ''
      }
    ];
  })

  describe('when dateRange filter is inactive', () => {
    it('should return all files when dateRange is not active and no geohash filter', () => {
      const filter = {
        dateRange: {
          active: false,
          startDate: null,
          endDate: null
        },
        geohash: {
          active: false,
          value: null
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles(mockFiles, filter);

      expect(result).toHaveLength(12);
      expect(result).toEqual(mockFiles);
    });
    it('should return all files when dateRange is inactive even with date values present', () => {
      const filter = {
        dateRange: {
          active: false,
          startDate: '2022-01-01',
          endDate: '2022-12-31'
        },
        geohash: {
          active: false,
          value: null
        }
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles(mockFiles, filter);

      expect(result).toHaveLength(12);
      expect(result).toEqual(mockFiles);
    });
  });

  describe('when dateRange filter is active', () => {
    it('should return full array because all object are inside the dates, without null values', () => {
      const filter = {
        dateRange: {
          active: true,
          startDate: new Date('2025-01-30'),
          endDate: new Date('2025-02-06')
        },
        geohash: {
          active: false,
          value: null
        }
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles(mockFiles, filter);

      expect(result).toHaveLength(10);
    });

    it('should return full array when dateRange is active with null dates, is like inactive', () => {
      const filter = {
        dateRange: {
          active: true,
          startDate: null,
          endDate: null
        },
        geohash: {
          active: false,
          value: null
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles(mockFiles, filter);

      expect(result).toHaveLength(12);
    });

    it('should return partial array, filtering is working propretly', () => {
      const filter = {
        dateRange: {
          active: true,
          startDate: new Date('2025-02-02'),
          endDate: new Date('2025-02-03')
        },
        geohash: {
          active: false,
          value: null
        }
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles(mockFiles, filter);

      expect(result).toHaveLength(6);
    });
  });

  describe('when dateRange, edge cases', () => {
    it('should handle empty files array', () => {
      const filter = {
        dateRange: {
          active: false,
          startDate: null,
          endDate: null
        },
        geohash: {
          active: false,
          value: null
        }
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles([], filter);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle single file array when dateRange is inactive', () => {
      const singleFile = [mockFiles[0]];
      const filter = {
        dateRange: {
          active: false,
          startDate: null,
          endDate: null
        },
        geohash: {
          active: false,
          value: null
        }
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles(singleFile, filter);

      expect(result).toHaveLength(1);
      expect(result).toEqual(singleFile);
    });

    it('should handle single file array when dateRange is active', () => {
      const singleFile = [mockFiles[0]];
      const filter = {
        dateRange: {
          active: true,
          startDate: new Date('2021-01-01'),
          endDate: new Date('2030-12-31')
        },
        geohash: {
          active: false,
          value: null
        }
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles(singleFile, filter);

      expect(result).toHaveLength(1);
      expect(result).toEqual([mockFiles[0]]);
    });
  });

  describe('when geohash filter is inactive', () => {
    it('should return all files when geohash is not active', () => {
      const filter = {
        dateRange: {
          active: false,
          startDate: null,
          endDate: null
        },
        geohash: {
          active: false,
          latitude: null,
          longitude: null,
          radius: 0
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles(mockFiles, filter);

      expect(result).toHaveLength(12);
      expect(result).toEqual(mockFiles);
    });

    it('should return only prefixed files when active, qwebjnufs', () => {
      const filter = {
        dateRange: {
          active: false,
          startDate: null,
          endDate: null
        },
        geohash: {
          active: true,
          latitude: -8.399971,
          longitude: 117.99988,
          radius: 5,
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles(mockFiles, filter);

      expect(result).toHaveLength(1);
    });
    it('should return two element with coordinates 10.123107, 11.2132', () => {
      const filter = {
        dateRange: {
          active: false,
          startDate: null,
          endDate: null
        },
        geohash: {
          active: true,
          latitude: 10.123107,
          longitude: 11.2132,
          radius: 50000
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles(mockFiles, filter);

      expect(result).toHaveLength(2);
    });
  });

  describe('when hash filter is used', () => {
    it('should return files matching a single hash', () => {
      const filter = {
        dateRange: { active: false, startDate: null, endDate: null },
        geohash: { active: false, value: null },
        hashList: ['u4pruydqqvj']
      };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles(mockFiles, filter);
      // There are 7 files with hash 'u4pruydqqvj' in mockFiles
      expect(result).toHaveLength(7);
      expect(result.every((f: IPhotosphereViewFile) => f.hash === 'u4pruydqqvj')).toBe(true);
    });

    it('should return files matching multiple hashes', () => {
      const filter = {
        dateRange: { active: false, startDate: null, endDate: null },
        geohash: { active: false, value: null },
        hashList: ['u4pruydqqvj', 'u4pruydqqvk']
      };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles(mockFiles, filter);
      // There are 10 files with either hash 'u4pruydqqvj' or 'u4pruydqqvk'
      expect(result).toHaveLength(10);
      expect(result.every((f: IPhotosphereViewFile) => ['u4pruydqqvj', 'u4pruydqqvk'].includes(f.hash))).toBe(true);
    });

    it('should return no files if hash does not exist', () => {
      const filter = {
        dateRange: { active: false, startDate: null, endDate: null },
        geohash: { active: false, value: null },
        hashList: ['nonexistenthash']
      };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles(mockFiles, filter);
      expect(result).toHaveLength(0);
    });

    it('should return all files if hashList is empty', () => {
      const filter = {
        dateRange: { active: false, startDate: null, endDate: null },
        geohash: { active: false, value: null },
        hashList: []
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles(mockFiles, filter);
      expect(result).toHaveLength(12);
      expect(result).toEqual(mockFiles);
    });

    it('should return all files if hashList is not present', () => {
      const filter: IFileFilters = {
        dateRange: { active: false, startDate: null, endDate: null },
        geohash: { active: false, latitude: null, longitude: null, radius: 0 }
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (fileService as any).filterFiles(mockFiles, filter);
      expect(result).toHaveLength(12);
      expect(result).toEqual(mockFiles);
    });
  });

});
