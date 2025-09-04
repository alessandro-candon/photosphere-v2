import "firebase/firestore";
import {
  getStorage,
  uploadBytes,
  type FirebaseStorage,
  ref as storageRef,
  getDownloadURL
} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup} from "firebase/auth";
import {type FirebaseOptions, type FirebaseApp} from "@firebase/app";
import {type Auth} from "@firebase/auth";
import {useFirebaseStore} from "@/stores/firebase-store.ts";
import type {StoreDefinition} from "pinia";
import type {OAuthCredential} from "firebase/auth";


class FirebaseService {
  firebaseApp!: FirebaseApp;
  googleAuthProvider: GoogleAuthProvider;
  storage!: FirebaseStorage;
  auth!: Auth;
  firebaseStore!: ReturnType<StoreDefinition>;

  constructor() {
    this.googleAuthProvider = new GoogleAuthProvider();
  }

  async initFirebase(firebaseOptions?: FirebaseOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      this.firebaseStore = useFirebaseStore();
      const firebaseOptionsStored = this.firebaseStore.getFirebaseOptions();
      if (firebaseOptionsStored && this.firebaseStore.getIsAuthenticated()) {
        this.firebaseStore.setFirebaseOptions(firebaseOptionsStored)
        this.firebaseApp = initializeApp(firebaseOptionsStored);
        resolve();
      } else if (firebaseOptions) {
        this.firebaseStore.setFirebaseOptions(firebaseOptions);
        this.firebaseApp = initializeApp(firebaseOptions);
        resolve();
      } else {
        reject('Firebase options are not provided or stored');
      }
    });
  }

  initStorage(storageBucket?: string): void {
    if (!this.storage) {
      this.storage = getStorage(this.firebaseApp, storageBucket || this.firebaseStore.storageBucket || '');
    }
  }

  initAuth() {
    if (!this.auth) {
      this.auth = getAuth();
    }
  }

  isUserLogged(): Promise<void> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          if (user.email) this.firebaseStore.setEmail(user.email)
          this.firebaseStore.setAuthenticationStatus(true);
          resolve();
        } else {
          console.log('User is signed out')
          reject();
        }
      });
    });
  }

  signIn(): Promise<OAuthCredential> {
    return new Promise((resolve, reject) => {
      signInWithPopup(this.auth, this.googleAuthProvider)
        .then((result) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential) {
            resolve(credential);
            const user = result.user;
            if (user.email) this.firebaseStore.setEmail(user.email);
            this.firebaseStore.setAuthenticationStatus(true)
          } else {
            this.firebaseStore.setAuthenticationStatus(false)
            reject("Credentials are null")
            console.error("Credential is null")
          }
        }).catch((error) => {
        const credential = GoogleAuthProvider.credentialFromError(error);
        this.firebaseStore.setAuthenticationStatus(false)
        console.error(error, credential)
        reject(error.message)
      });
    })
  }

  async getSignedUrl(gcsPath: string): Promise<string> {
    return await getDownloadURL(storageRef(this.storage, gcsPath));
  }

  async uploadStringContent(gcsPath: string, content: string, contentType: string): Promise<void> {
    const blob = new Blob([content], {type: contentType});
    const storageReference = storageRef(this.storage, gcsPath);
    await uploadBytes(storageReference, blob);
  }

  async downloadStringContent(gcsPath: string): Promise<string> {
    const url = await this.getSignedUrl(gcsPath);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  }
}

export const firebaseService = new FirebaseService();
