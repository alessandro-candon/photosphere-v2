<script setup lang="ts">
import {ref, computed} from 'vue';
import {QDialog, QCard, QCardSection, QBtn} from 'quasar';
import FileGridListComponent from '@/components/FileGridListComponent.vue';
import type {IAlbum} from '@/interfaces/IAlbum.ts';
import type IFileFilters from '@/interfaces/IFileFilters.ts';
import FileActionModal from "@/modals/FileActionModal.vue";
import type {IPhotosphereViewFile} from "@/interfaces/IPhotosphereViewFile.ts";

interface Props {
  modelValue: boolean;
  album: IAlbum;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const filters = computed(() => ({
  dateRange: {
    active: false,
    startDate: null,
    endDate: null,
  },
  geohash: {
    active: false,
    latitude: null,
    longitude: null,
    radius: 0,
  },
  hashList: props.album.hashes,
}) as IFileFilters);
const selectedFileList = ref<Set<string>>(new Set());
const showFileActionModalRef = ref(false);
const selectedFileRef = ref<IPhotosphereViewFile | null>(null);


const handleImageClick = (file: IPhotosphereViewFile) => {
  selectedFileRef.value = file;
  showFileActionModalRef.value = true;
};
</script>

<template>
  <q-dialog class="dialog-album-content full-screen-dialog" v-model="dialogModel" persistent>
    <q-card class="full-width full-height">
      <q-card-section>
        <div class="row items-center justify-between">
          <q-btn flat round icon="close" @click="dialogModel = false" aria-label="Close"/>
        </div>
      </q-card-section>
      <q-card-section class="q-pa-none" style="flex: 1; overflow: auto;">
        <FileGridListComponent
          :filters="filters"
          :selectedFileList="selectedFileList"
          @image-click="handleImageClick"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
  <FileActionModal
    v-if="selectedFileRef"
    v-model="showFileActionModalRef"
    :file="selectedFileRef"
    :album="props.album"
    :isActiveAddToAlbum="false"
    :isActiveRemoveFromAlbum="true"
    @open="console.log('File open', $event)"
    @showInfo="console.log('File show info', $event)"
    @addToAlbum="console.log('File add to album', $event)"
    @cancel="showFileActionModalRef = false"
  />
</template>

<style scoped>
.full-screen-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog-album-content {
  margin: 5px !important;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 2px 24px rgba(0, 0, 0, 0.18);
}
</style>
