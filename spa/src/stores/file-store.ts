import {defineStore, type StateTree, type StoreDefinition} from 'pinia'
import type {IPhotosphereFile} from "@/interfaces/IPhotosphereViewFile.ts";
import {downloadAndDecodeProtobuf} from "@/protobuf/photosphere-file.ts";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const useFileStore: StoreDefinition = defineStore('file-store', {
  state: () => ({
    files: [] as IPhotosphereFile[],
    signedUrlsMap: new Map<string, string>()
  }),
  actions: {
    async getFiles(url: string): Promise<IPhotosphereFile[]> {
      if (this.files.length > 0) {
        return this.files
      }
      this.files = await downloadAndDecodeProtobuf(url)
      return this.files
    },
    hasSignedUrlMap(bucketUri: string): boolean {
      return this.signedUrlsMap.has(bucketUri);
    },
    setSignedUrlMap(bucketUri: string, signedUrl: string): void {
      this.signedUrlsMap.set(bucketUri, signedUrl);
    },
    getSignedUrlMap(bucketUri: string): string | undefined {
      return this.signedUrlsMap.get(bucketUri);
    },
    clearCache(): void {
      this.files = [];
      this.signedUrlsMap.clear();
    }
  },
  persist: {
    storage: localStorage,
    key: 'file-store',
    serializer: {
      serialize: (state: StateTree): string => {
        const serializedState = {
          ...state,
          signedUrlsMap: Array.from(state.signedUrlsMap.entries()),
        }
        return JSON.stringify(serializedState)
      },
      deserialize: (value: string): StateTree => {
        const parsedState = JSON.parse(value)
        const signedUrlsMap = new Map<string, string>(
          parsedState.signedUrlsMap
        )
        return {
          ...parsedState,
          signedUrlsMap,
        }
      },
    },
  },
})
