import {useFileStore} from "@/stores/file-store.ts";
import {firebaseService} from "@/services/firebase-service.ts";
import type IFileFilters from "@/interfaces/IFileFilters.ts";
import {isThisGeohashInsideThisCoordinatesRadius} from "@/utils/geohash.ts";
import type {IAlbum} from "@/interfaces/IAlbum.ts";
import {useAlbumStore} from "@/stores/album-store.ts";
import type {
  IPhotosphereFile,
  IPhotosphereFileSignedUrls,
  IPhotosphereViewFile
} from "@/interfaces/IPhotosphereViewFile.ts";
import type {StoreDefinition} from "pinia";

class FileService {

  DATABASE_URI = '/photosphere_database_cloud.pb';
  ALBUMS_URI = '/photosphere_albums.json';
  fileStore!: ReturnType<StoreDefinition>;
  albumStore!: ReturnType<StoreDefinition>;
  pageSize = 10;


  initFileService(): void {
    if (!this.fileStore) this.fileStore = useFileStore();
    if (!this.albumStore) this.albumStore = useAlbumStore();
  }

  getViewListOfFiles(
    page: number,
    filter: IFileFilters,
    pageSize: number = this.pageSize
  ): Promise<IPhotosphereViewFile[]> {
    return new Promise(async (resolve, reject) => {
      this.fileStore.getFiles(await this.getSignedUrlIfNotExists(this.DATABASE_URI))
        .then(async (files: IPhotosphereFile[]) => {
          files = this.filterFiles(files, filter).sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);
          const startIndex = page * pageSize;
          const endIndex = startIndex + pageSize;
          const slicedFiles = files.slice(startIndex, endIndex);
          const viewFiles: IPhotosphereViewFile[] = [];
          for (const file of slicedFiles) {
            let signedUrl: string | false = false;
            try {
              signedUrl = await this.getSignedUrlIfNotExists(file.sourceBucketThumbnailUri);
            } catch (e) {
              console.error(`Failed to get signed URL for ${file.sourceBucketThumbnailUri}:`, e);
              signedUrl = false;
            }
            viewFiles.push({
              hash: file.hash,
              signedThumbnailUrl: signedUrl,
              sourceUri: file.sourceBucketUri,
              fileType: file.fileType
            });
          }
          resolve(viewFiles);
        })
        .catch((error: unknown) => {
          reject(error);
        });
    });
  }

  getFileWithSignedUrlsByHash(hash: string): Promise<IPhotosphereFileSignedUrls> {
    return new Promise(async (resolve, reject) => {
      this.fileStore.getFiles(await this.getSignedUrlIfNotExists(this.DATABASE_URI))
        .then(async (files: IPhotosphereFile[]) => {
          const file = files.find((f: IPhotosphereFile) => f.hash === hash);
          if (file) {
            try {
              const fileSignedUrls: IPhotosphereFileSignedUrls = {
                ...file,
                signedSourceBucketUri: await this.getSignedUrlIfNotExists(file.sourceBucketUri),
                signedSourceBucketThumbnailUri: await this.getSignedUrlIfNotExists(file.sourceBucketThumbnailUri)
              }
              resolve(fileSignedUrls);
            } catch (e) {
              console.error(`Failed to get signed URL for ${file.hash}:`, e);
              reject(`Failed to get signed URL for ${file.hash}:`);
            }
          } else {
            reject(`File with hash ${hash} not found.`);
          }
        })
    });
  }

  getSignedUrlIfNotExists(bucketUri: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (this.fileStore.hasSignedUrlMap(bucketUri)) {
        const signedUrl = this.fileStore.getSignedUrlMap(bucketUri);
        if (signedUrl) {
          resolve(signedUrl);
        } else {
          console.error(`An empty signed URL was found for ${bucketUri}.`);
          reject();
        }
      } else {
        try {
          const signedUrl = await firebaseService.getSignedUrl(bucketUri);
          this.fileStore.setSignedUrlMap(bucketUri, signedUrl);
          resolve(signedUrl);
        } catch (error) {
          console.error('Error fetching signed URL:', error);
          reject();
        }
      }
    });
  }

  private filterFiles(files: IPhotosphereFile[], filter: IFileFilters): IPhotosphereFile[] {
    console.log('Applying filter:', filter);
    let startDateTimestamp: number, endDateTimestamp: number = 0;
    const filterDateRangeIsActive =
      filter.dateRange.active &&
      filter.dateRange.startDate &&
      filter.dateRange.endDate;
    if (filterDateRangeIsActive) {
      startDateTimestamp = (filter.dateRange.startDate as Date).setHours(0,0,0,0) / 1000;
      endDateTimestamp = (filter.dateRange.endDate as Date).setHours(23,59,59,999) / 1000;
    }
    return files.filter((file: IPhotosphereFile) => {
      let isMatchingTheFilter = true;
      if (filter.excludeHashList && filter.excludeHashList.length >= 0) {
        isMatchingTheFilter = !filter.excludeHashList.includes(file.hash);
      }
      if (filter.hashList && filter.hashList.length >= 0) {
        isMatchingTheFilter = filter.hashList.includes(file.hash);
      }
      if (filter.type !== undefined) {
        isMatchingTheFilter = isMatchingTheFilter && file.fileType === filter.type;
      }
      if (filterDateRangeIsActive) {
        isMatchingTheFilter = file.createdAtTimestamp >= (startDateTimestamp as number) && file.createdAtTimestamp <= (endDateTimestamp as number);
      }
      if (filter.geohash.active && filter.geohash.latitude && filter.geohash.longitude) {
        isMatchingTheFilter = !!(
          isMatchingTheFilter &&
          file.geohash &&
          file.geohash.length > 0 &&
          isThisGeohashInsideThisCoordinatesRadius(file.geohash, filter.geohash.latitude, filter.geohash.longitude, filter.geohash.radius)
        );
      }
      if (filter.fileName && filter.fileName.length > 0) {
        isMatchingTheFilter = isMatchingTheFilter && file.sourceBucketUri.toLowerCase().includes(filter.fileName.toLowerCase());
      }
      if (filter.singleDateList && filter.singleDateList.length > 0) {
        isMatchingTheFilter = isMatchingTheFilter &&
          filter.singleDateList.some(date => {
            const singleDateStart = date.setHours(0,0,0,0) / 1000;
            const singleDateEnd = date.setHours(23,59,59,999) / 1000;
            return file.createdAtTimestamp >= singleDateStart && file.createdAtTimestamp <= singleDateEnd;
          });
      }
      return isMatchingTheFilter;
    })
  }

  public async uploadAlbums(albums: IAlbum[]) {
    const albumsContent = JSON.stringify(albums, null, 2);
    await firebaseService.uploadStringContent(this.ALBUMS_URI, albumsContent, 'application/json');
  }

  public async syncAlbums(): Promise<IAlbum[]> {
    try {
      const albumsContent = await firebaseService.downloadStringContent(this.ALBUMS_URI);
      const albums: IAlbum[] = JSON.parse(albumsContent);
      for (const album of albums) {
        this.albumStore.addAlbum(album.name);
        this.albumStore.addHashesToAlbum(album.name, new Set(album.hashes));
      }
      return this.albumStore.getAlbums()
    } catch (e) {
      console.error('Failed to download or parse albums:', e);
      return [];
    }
  }
}

export const fileService = new FileService();
