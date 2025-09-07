<script setup lang="ts">
import { QCard, QCardSection, QPage } from "quasar";
import HeaderPageComponent from "@/components/HeaderPageComponent.vue";
import { useFirebaseStore } from "@/stores/firebase-store.ts";
import { ref } from "vue";
import {useFileStore} from "@/stores/file-store.ts";

const firebaseStore = useFirebaseStore();
const fileStore = useFileStore();
const fileCountRef = ref<number | null>(null);
const fileCashedCountRef = ref<number | null>(null);
const versionRef = ref<string>('Loading...');

fileCountRef.value = fileStore.files.length;
fileCashedCountRef.value = fileStore.signedUrlsMap.size - 2;

fetch('/version.txt')
  .then(response => response.text())
  .then(data => {
    versionRef.value = data;
  });


</script>

<template>
  <q-page class="q-pa-md">
    <HeaderPageComponent title="Settings"/>
    <div class="q-my-xl flex flex-center column">
      <q-card class="q-mb-lg" style="max-width: 500px; width: 100%;">
        <q-card-section>
          <div class="text-h6">Application Info</div>
          <div><b>Version:</b> {{ versionRef }}</div>
        </q-card-section>
        <q-card-section>
          <div class="text-h6">Firebase Store Data</div>
          <div><b>Email:</b> {{ firebaseStore.email }}</div>
          <div><b>Authenticated:</b> {{ firebaseStore.isAuthenticated ? 'Yes' : 'No' }}</div>
          <div><b>Storage Bucket:</b> {{ firebaseStore.storageBucket }}</div>
          <div><b>Config:</b> <pre>{{ firebaseStore.firebaseOptions }}</pre></div>
        </q-card-section>
      </q-card>
      <q-card style="max-width: 500px; width: 100%;">
        <q-card-section>
          <div class="text-h6">File Store Statistics</div>
          <div v-if="fileCountRef !== null"><b>Number of files stored:</b> {{ fileCountRef }}</div>
          <div v-else>No files found</div>
        </q-card-section>
        <q-card-section>
          <div class="text-h6">File Cache Statistics</div>
          <div v-if="fileCashedCountRef !== null">
            <b>Number of files cached:</b> {{ fileCashedCountRef }}
            <section v-if="fileCountRef">
              <b>Percentage of cashed items:</b>
              {{ ((fileCashedCountRef / fileCountRef) * 100).toFixed(2) }}%
            </section>
          </div>
          <div v-else>No cached files found</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
</style>
