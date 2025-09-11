<script setup lang="ts">
import {
  QSpinner,
  QImg,
  QIcon,
  QInfiniteScroll,
  QSpinnerDots,
  useQuasar
} from "quasar";
import {ref, onMounted, watch} from 'vue';
import {firebaseService} from "@/services/firebase-service.ts";
import {fileService} from "@/services/file-service.ts";
import type IFileFilters from "@/interfaces/IFileFilters.ts";
import {getFileTypeColor, getFileTypeIcon} from "@/utils/style.ts";
import type {IPhotosphereViewFile} from "@/interfaces/IPhotosphereViewFile.ts";

firebaseService.initStorage();

const $q = useQuasar();

const loadingRef = ref(false);
const errorRef = ref<string | null>(null);
const isNextPageAvailableRef = ref(true);
const filesViewRef = ref<IPhotosphereViewFile[]>([]);
const selectedFileListRef = ref<Set<string>>(new Set<string>());

let longPressTimeout: ReturnType<typeof setTimeout> | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let longPressTriggered: boolean = false;
const longPressActive = ref(false);

const props = defineProps<{
  filters: IFileFilters
  selectedFileList: Set<string>
}>();
const emit = defineEmits(['imageClick', 'imageLongPress']);
const filtersRef = ref(props.filters);


watch(() => props.filters, (newFilters) => {
  filtersRef.value = newFilters;
  reloadFileList();
}, {deep: true});

watch(() => props.selectedFileList, (newSelectedFileList) => {
  selectedFileListRef.value = newSelectedFileList;
  console.log(selectedFileListRef.value);
}, {deep: true});

const onLoadNewSignedUrl = async (index: number, done: (stop?: boolean) => void) => {
  const result = await fileService.getViewListOfFiles(index, filtersRef.value);
  filesViewRef.value.push(...result);
  let isStop = false;
  if (result.length === 0) {
    isStop = true;
    isNextPageAvailableRef.value = false;
  }
  loadingRef.value = false;
  done(isStop)
}

const onImageClick = (file: IPhotosphereViewFile) => {
  emit('imageClick', file);
};

const onImageLongPress = (file: IPhotosphereViewFile) => {
  longPressActive.value = true;
  emit('imageLongPress', file);
};

const handleImagePressStart = (file: IPhotosphereViewFile) => {
  longPressTriggered = false;
  if (longPressTimeout) {
    clearTimeout(longPressTimeout);
  }
  longPressTimeout = setTimeout(() => {
    longPressTriggered = true;
    onImageLongPress(file);
  }, 500);
};

const handleImagePressEnd = () => {
  if (longPressTimeout) {
    clearTimeout(longPressTimeout);
    longPressTimeout = null;
  }
};

function reloadFileList() {
  loadingRef.value = true;
  filesViewRef.value = [];
  isNextPageAvailableRef.value = true;
  onLoadNewSignedUrl(0, () => {
  });
}


onMounted(() => {
  loadingRef.value = true;
  fileService.initFileService();
  onLoadNewSignedUrl(0, () => {
  }).finally(
    () => {
      loadingRef.value = false;
      fileService.syncAlbums().catch(
        () => {
          $q.notify({
            type: 'negative',
            message: 'Failed to sync albums from cloud, please try again manually.'
          });
        }
      )
    }
  )
});
</script>

<template>
  <div v-if="loadingRef" class="q-my-xl flex flex-center column">
    <q-spinner color="primary" size="40px" class="q-mb-md"/>
  </div>

  <div v-if="!loadingRef && !errorRef && filesViewRef.length === 0"
       class="q-my-xl flex flex-center column text-grey">
    <q-icon name="folder_open" size="48px" class="q-mb-md"/>
    <div>No files found</div>
  </div>

  <div v-if="!loadingRef && !errorRef && filesViewRef.length > 0" class="photo-grid-container">
    <q-infinite-scroll @load="onLoadNewSignedUrl" :offset="800" :debounce="200">
      <div class="photo-grid">
        <div
          :class="['photo-item']"
          v-for="(file, index) in filesViewRef"
          :key="index">
          <q-img
            :src="file.signedThumbnailUrl ? file.signedThumbnailUrl : 'no-file-preview.png'"
            class="photo-image"
            fit="cover"
            loading="lazy"
            :ratio="1"
            @click="onImageClick(file)"
            @mousedown="handleImagePressStart(file)"
            @mouseup="handleImagePressEnd"
            @mouseleave="handleImagePressEnd"
            @touchstart="handleImagePressStart(file)"
            @touchend="handleImagePressEnd"
          />
          <div class="file-type-icon">
            <q-icon
              :name="getFileTypeIcon(file.fileType)"
              :color="getFileTypeColor(file.fileType)"
              size="20px"
            />
          </div>
          <div class="file-selected-icon">
            <q-icon
              v-if="selectedFileListRef.has(file.hash)"
              name="check_circle"
              color="white"
              size="30px"
            ></q-icon>
          </div>
        </div>
      </div>
      <template v-slot:loading v-if="isNextPageAvailableRef">
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px"/>
        </div>
      </template>
    </q-infinite-scroll>
  </div>
</template>

<style scoped>
.photo-container-selected {
  padding: 5px;
  background-color: #498aff !important;
  border-radius: 8px !important;
}

.photo-grid-container {
  width: 100%;
  height: 100%;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 4px;
  padding: 0;
}

.photo-item {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  background-color: #f5f5f5;
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.3s ease;
}

/* New styles for file type icons */
.file-type-icon {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.file-selected-icon {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px;
}

/* Responsive breakpoints for different screen sizes */
@media (max-width: 600px) {
  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2px;
  }
}

@media (min-width: 601px) and (max-width: 960px) {
  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 3px;
  }
}

@media (min-width: 961px) and (max-width: 1280px) {
  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 4px;
  }
}

@media (min-width: 1281px) {
  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 6px;
  }
}

/* Create a masonry-like effect with varying heights */
.photo-item:nth-child(7n+1) {
  grid-row-end: span 1;
}

.photo-item:nth-child(7n+2) {
  grid-row-end: span 2;
}

.photo-item:nth-child(7n+3) {
  grid-row-end: span 1;
}

.photo-item:nth-child(7n+4) {
  grid-row-end: span 2;
}

.photo-item:nth-child(7n+5) {
  grid-row-end: span 1;
}

.photo-item:nth-child(7n+6) {
  grid-row-end: span 2;
}

.photo-item:nth-child(7n+7) {
  grid-row-end: span 1;
}

/* Ensure grid auto-rows for consistent spacing */
.photo-grid {
  grid-auto-rows: 140px;
}

@media (max-width: 600px) {
  .photo-grid {
    grid-auto-rows: 120px;
  }
}
</style>
