<template>
  <q-page class="q-pa-md">
    <HeaderPageComponent title="Albums"/>

    <div v-if="loadingRef" class="q-my-xl flex flex-center column">
      <q-spinner color="primary" size="40px" class="q-mb-md"/>
    </div>

    <div v-if="!loadingRef && albumsRef.length === 0" class="q-my-xl flex flex-center column text-grey">
      <q-icon name="folder_open" size="48px" class="q-mb-md"/>
      <div>No albums found</div>
    </div>

    <div v-if="!loadingRef && albumsRef.length > 0" class="album-grid-container">
      <div class="album-grid">
        <div class="album-item" v-for="album in albumsRef" :key="album.name">
          <q-card @click="handleOpenAlbum(album)" class="cursor-pointer">
            <q-card-section>
              <div class="text-subtitle1">{{ album.name }}</div>
              <q-badge color="primary" class="q-mt-sm">{{ album.hashes.length }} files</q-badge>
            </q-card-section>
            <q-card-section>
              <div v-if="fileForPreviewRefByAlbum[album.name] && fileForPreviewRefByAlbum[album.name].length > 0" class="album-preview-images" style="display: flex; align-items: center;">
                <q-img
                  v-for="(file) in fileForPreviewRefByAlbum[album.name]"
                  :key="file.hash"
                  :src="file.signedThumbnailUrl ? file.signedThumbnailUrl : 'no-file-preview.png'"
                  :alt="file.hash"
                  class="album-preview-thumb q-mr-xs"
                  style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #eee;"
                />
                <q-badge v-if="album.hashes.length > previewImageCount" color="grey" class="q-ml-xs">...</q-badge>
              </div>
              <div v-if="fileForPreviewRefByAlbum[album.name] && fileForPreviewRefByAlbum[album.name].length === 0" class="text-grey-5 text-caption">
                No preview available
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab icon="add" direction="up" color="primary">
        <q-fab-action @click="syncWithCloud" color="dark" icon="cloud_sync" />
      </q-fab>
    </q-page-sticky>
  </q-page>

  <AlbumContentViewModal
      v-if="selectedAlbumRef"
      v-model="showAlbumContentModalRef"
      :album="selectedAlbumRef"
    />
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {
  QImg,
  QSpinner,
  QIcon,
  QCard,
  QCardSection,
  QBadge,
  QFab,
  QFabAction,
  QPageSticky,
  QPage, useQuasar
} from 'quasar';
import { useAlbumStore } from '../stores/album-store';
import {fileService} from "@/services/file-service.ts";
import type {IAlbum} from "@/interfaces/IAlbum.ts";
import type {IPhotosphereViewFile} from "@/interfaces/IPhotosphereViewFile.ts";
import AlbumContentViewModal from "@/modals/AlbumContentViewModal.vue";
import HeaderPageComponent from "@/components/HeaderPageComponent.vue";

const $q = useQuasar();
const albumStore = useAlbumStore();

const previewImageCount = 4;
const loadingRef = ref(false);
const albumsRef = ref<IAlbum[]>([]);
const fileForPreviewRefByAlbum = ref<{ [key: string]: IPhotosphereViewFile[] }>({});

const showAlbumContentModalRef = ref(false);
const selectedAlbumRef = ref<IAlbum>()


const setPreviewImagesForAlbum = (album: IAlbum) => {
  fileService.getViewListOfFiles(0, {
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
      },
      hashList: album.hashes
    }, previewImageCount).then(
      (files) => {
        console.log(files);
        fileForPreviewRefByAlbum.value[album.name] = files;
      }
  ).catch((error) => {
    console.error('Error fetching preview images for album:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load preview images for album'
    });
  });
}

const syncWithCloud = () => {
  $q.loading.show();
  const albums = albumStore.getAlbums();
  fileService.uploadAlbums(albums).then(() => {
    $q.loading.hide();
  }).catch(() => {
    $q.loading.hide();
    $q.notify({
      type: 'negative',
      message: 'Failed to sync with cloud'
    });
  }).finally(() => {
    $q.loading.hide();
  });
}

const handleOpenAlbum = (album: IAlbum) => {
  selectedAlbumRef.value = album;
  showAlbumContentModalRef.value = true;
}

onMounted(
  () => {
    fileService.initFileService();
    albumsRef.value = albumStore.getAlbums();
    albumsRef.value.forEach((album) => {
      setPreviewImagesForAlbum(album);
    });
  }
)

</script>

<style scoped>
.album-grid-container {
  margin-top: 16px;
}
.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.album-item {
  display: flex;
  flex-direction: column;
}
</style>
