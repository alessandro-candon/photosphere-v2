import { defineStore } from 'pinia';
import type {IAlbum} from "@/interfaces/IAlbum.ts";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const useAlbumStore = defineStore('album-store', {
  state: () => ({
    albums: [] as IAlbum[],
  }),
  actions: {
    addAlbum(name: string) {
      if (!this.albums.find(album => album.name === name)) {
        this.albums.push({ name, hashes: [] });
      }
    },
    addHashesToAlbum(name: string, hashes: Set<string>) {
      const album = this.albums.find(album => album.name === name);
      if (album) {
        const existingHashes = new Set(album.hashes);
        album.hashes = Array.from(new Set([...existingHashes, ...hashes]));
      }
    },
    addHashToAlbum(name: string, hash: string) {
      const album = this.albums.find(album => album.name === name);
      if (album && !album.hashes.includes(hash)) {
        album.hashes.push(hash);
      }
    },
    removeHashFromAlbum(name: string, hash: string) {
      const album = this.albums.find(album => album.name === name);
      if (album) {
        album.hashes = album.hashes.filter(h => h !== hash);
      }
    },
    getAlbums(fullTextSearch?: string): IAlbum[] {
      if (fullTextSearch) {
        const search = fullTextSearch.toLowerCase();
        return this.albums.filter(album => album.name.toLowerCase().includes(search));
      }
      return this.albums;
    },
    setAlbums(albums: IAlbum[]) {
      this.albums = albums;
    }
  },
  persist: {
    key: 'albums',
    storage: localStorage,
  },
});
