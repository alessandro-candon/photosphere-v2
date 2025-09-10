<template>
  <div v-if="loadingRef" style="position: relative; height: 100vh;">
    <q-inner-loading :showing="true">
      <q-spinner color="primary" size="3em" />
    </q-inner-loading>
  </div>
  <q-layout view="hHh lpR fFf" v-else-if="firebaseInitRef">
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-footer reveal elevated class="bg-grey-8 text-white">
      <q-toolbar class="flex justify-center items-center gap-x-md">
        <q-btn size="lg" flat square ripple icon="home" :to="{ name: 'home' }" ref="homeBtn" :aria-label="'Home'" :color="route.name === 'home' ? 'primary' : 'white'">
        </q-btn>
        <q-btn size="lg" flat square ripple icon="photo_album" :to="{ name: 'albums' }" ref="albumsBtn" :aria-label="'Albums'" :color="route.name === 'albums' ? 'primary' : 'white'">
        </q-btn>
        <q-btn size="lg" flat square ripple icon="history" :to="{ name: 'memories' }" ref="historyBtn" :aria-label="'Memories'" :color="route.name === 'memories' ? 'primary' : 'white'">
        </q-btn>
        <q-btn size="lg" flat square ripple icon="settings" :to="{ name: 'settings' }" ref="settingsBtn" :aria-label="'Settings'" :color="route.name === 'settings' ? 'primary' : 'white'">
        </q-btn>
      </q-toolbar>
    </q-footer>
  </q-layout>
  <div v-else style="position: relative; height: 100vh; display: flex; align-items: center; justify-content: center;">
    <q-card style="width: 400px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h6">Setup your firebase configuration</div>
      </q-card-section>

      <q-card-section>
        <q-input
          filled
          v-model="firebaseConfigRef"
          label="Firebase configuration"
          placeholder="{...}"
          type="textarea"
          :rows="5"
          @change="onFirebaseConfigChange"
        />
        <q-input
          class="q-mt-lg"
          filled
          v-model="firebaseStorageRef"
          label="Firebase storage of files"
          placeholder="gs://..."
          type="text"
        ></q-input>
        <div class="q-mt-md">
          <q-btn label="Save" @click="saveFirebaseConfiguration" color="primary" style="width: 100%;" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import {firebaseService} from "@/services/firebase-service.ts";
import {ref} from "vue";
import { QInnerLoading, QSpinner, QLayout, QPageContainer, QFooter, QToolbar, QCard, QCardSection, QInput, QBtn } from 'quasar';
import { useRoute } from 'vue-router';
import {convertToValidJsonObj} from "@/utils/utils.ts";

const loadingRef = ref(true);
const firebaseInitRef = ref(false);
const firebaseConfigRef = ref("");
const firebaseStorageRef = ref("");
const route = useRoute();

const checkFirebaseConfiguration = () => {
  firebaseService.initFirebase().then(() => {
        firebaseService.initAuth();
        firebaseService.isUserLogged().then(() => {
          loadingRef.value = false;
          firebaseInitRef.value = true;
        }).catch((error) => {
          console.log('User is not logged in, attempting to log in...');
          console.error(error)
          loadingRef.value = false;
          firebaseInitRef.value = false;
          loginWithGoogle();
        });
      }
  ).catch((error) => {
    console.error(error);
    loadingRef.value = false;
    firebaseInitRef.value =false;
  })
}

const saveFirebaseConfiguration = async () => {
  const config = convertToValidJsonObj(firebaseConfigRef.value);
  await firebaseService.initFirebase(config);
  await loginWithGoogle();
}

const onFirebaseConfigChange = () => {
    const config = convertToValidJsonObj(firebaseConfigRef.value);
    firebaseStorageRef.value = config.storageBucket || "";
}

const loginWithGoogle = async () => {
  firebaseService.initAuth();
  await firebaseService.signIn()
  firebaseInitRef.value = true;
}

checkFirebaseConfiguration();
</script>

<style scoped></style>
