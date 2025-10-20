<script setup lang="ts">
import {QBtn, QCard, QCardSection, QPage, useQuasar} from "quasar";
import HeaderPageComponent from "@/components/HeaderPageComponent.vue";
import {useFirebaseStore} from "@/stores/firebase-store.ts";
import {onMounted, ref} from "vue";
import {useFileStore} from "@/stores/file-store.ts";
import {fileService} from "@/services/file-service.ts";
import {useAlbumStore} from "@/stores/album-store.ts";

const $q = useQuasar();
const firebaseStore = useFirebaseStore();
const fileStore = useFileStore();
const albumStore = useAlbumStore();
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

const handleFileClearCache = () => {
  fileStore.clearCache();
  fileCountRef.value = 0;
  fileCashedCountRef.value = 0;
  $q.notify({
    type: 'info',
    message: 'File cache cleared',
  })
}

const handleAlbumClearCache = async () => {
  albumStore.clearCache();
  await fileService.syncAlbums();
  $q.notify({
    type: 'info',
    message: 'File cache cleared',
  })
}

const handleDatabaseLoad = async () => {
  fileService.deleteDatabaseFromLocalCache();
}

onMounted(() => {
  fileService.initFileService();
})
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
          <div><b>Config:</b>
            <pre>{{ firebaseStore.firebaseOptions }}</pre>
          </div>
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
      <q-card class="q-mt-lg" style="max-width: 500px; width: 100%;">
        <q-card-section>
          <div class="text-h6">File Cache Actions</div>
          <div class="q-mt-lg">
            <div class="row">
              <div class="col">
                <q-btn class="full-width" color="negative" label="Delete File Cache" @click="handleFileClearCache"/>
              </div>
              <div class="col">
                <q-btn class="full-width" color="negative" label="Delete Album Cache" @click="handleAlbumClearCache"/>
              </div>
            </div>
            <div class="row q-mt-lg">
              <div class="col">
                <q-btn class="full-width" color="warning" label="Force sync database" @click="handleDatabaseLoad"/>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
</style>
