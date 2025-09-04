import {defineStore} from "pinia";
import type {FirebaseOptions} from "@firebase/app";
import { setSecureCookie, getCookie, deleteCookie } from "@/utils/cookies_utils";

const cookieStorage = {
  getItem(key: string): string | null {
    return getCookie(key);
  },
  setItem(key: string, value: string): void {
    setSecureCookie(key, value, 360 * 24 * 60 * 60);
  },
  removeItem(key: string): void {
    deleteCookie(key);
  }
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const useFirebaseStore = defineStore('firebase-storage', {
    state: () => ({
      firebaseOptions: null,
      isAuthenticated: false,
      storageBucket: null,
      email: null
    }) as {
      firebaseOptions: FirebaseOptions | null,
      isAuthenticated: boolean,
      storageBucket: string | null,
      email: string | null
    },
    actions: {
      setEmail(email: string) {
        this.email = email;
      },
      getEmail(): string {
        return this.email || '';
      },
      setStorageBucket(bucket: string) {
        this.storageBucket = bucket;
      },
      setFirebaseOptions(options: FirebaseOptions) {
        this.firebaseOptions = options;
        this.storageBucket = 'gs://' + options.storageBucket;
      },
      setAuthenticationStatus(status: boolean) {
        this.isAuthenticated = status;
      },
      getFirebaseOptions(): FirebaseOptions | null {
        return this.firebaseOptions;
      },
      getIsAuthenticated(): boolean {
        return this.isAuthenticated;
      }
    },
    persist: {
      storage: cookieStorage,
      key: 'firebase-storage',
    },
  }
);
