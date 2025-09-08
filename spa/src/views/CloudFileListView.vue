<template>
  <q-page class="q-pa-md">
    <HeaderPageComponent title="All Files"/>

    <FileGridListComponent
      :filters="filtersRef"
      :selected-file-list="selectedFileListRef"
      @image-click="handleImageClick"
      @image-long-press="onImageLongPress"
    ></FileGridListComponent>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab
        icon="filter_list"
        direction="up"
        color="primary">
        <q-fab-action @click="addFilterDateRange" color="dark" icon="date_range"/>
        <q-fab-action @click="addFilterGeohash" color="dark" icon="fmd_good"/>
        <q-fab-action @click="addFilterFileType" color="dark" icon="insert_drive_file"/>
        <q-fab-action
          @click="addFilterOnlyFilesNotInAlbum"
          :color="isActivatedOnlyFilesNotInAlbumRef ? 'accent' : 'dark'" icon="rule_folder"/>
        <q-fab-action
          @click="addFilterByFileName"
          color="dark"
          icon="search"/>
      </q-fab>
    </q-page-sticky>

    <DateRangeModal
      v-model="showDateRangeModalRef"
      title="Select Date Range"
      :start-date="selectedStartDateRef"
      :end-date="selectedEndDateRef"
      @confirm="handleDateRangeConfirm"
      @cancel="handleDateRangeCancel"
    />

    <LocationModal
      v-model="showLocationModalRef"
      title="Select Location"
      :selected-location="selectedLocationRef"
      @confirm="handleLocationConfirm"
      @cancel="handleLocationCancel"
    />

    <SelectedFilesActionModal
      v-model="showSelectionToolbarModalRef"
      @createAlbum="handleCreateAlbum"
      @addToAlbum="handleAddToAlbum"
      @cancel="handleSelectedFilesActionModalCancel"
    />

    <FileActionModal
      v-if="selectedFileRef"
      v-model="showFileActionModalRef"
      :file="selectedFileRef"
      :album="null"
      :is-active-add-to-album="true"
      :is-active-remove-from-album="true"
      @cancel="showFileActionModalRef = false"
    />

    <SelectAlbumModal
      v-model="selectAlbumModalRef"
      @select="handleAlbumChoice"
      @cancel="selectAlbumModalRef = false"/>
  </q-page>
</template>

<script setup lang="ts">
import {QFab, QFabAction, QPage, QPageSticky, useQuasar} from "quasar";
import {ref} from 'vue';
import {firebaseService} from "@/services/firebase-service.ts";
import DateRangeModal from "@/modals/DateRangeModal.vue";
import type IFileFilters from "@/interfaces/IFileFilters.ts";
import LocationModal from "@/modals/LocationModal.vue";
import type ILocation from "@/interfaces/ILocation.ts";
import SelectedFilesActionModal from "@/modals/SelectedFilesActionModal.vue";
import {useAlbumStore} from "@/stores/album-store.ts";
import {FileTypeEnum, type IPhotosphereViewFile} from "@/interfaces/IPhotosphereViewFile.ts";
import FileGridListComponent from "@/components/FileGridListComponent.vue";
import HeaderPageComponent from "@/components/HeaderPageComponent.vue";
import FileActionModal from "@/modals/FileActionModal.vue";
import SelectAlbumModal from "@/modals/SelectAlbumModal.vue";
import type {IAlbum} from "@/interfaces/IAlbum.ts";
import {fileService} from "@/services/file-service.ts";

firebaseService.initStorage();

const $q = useQuasar();
const albumStore = useAlbumStore();

const filtersRef = ref<IFileFilters>({
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
  }
});

const isActiveLongPressRef = ref(false);
const showDateRangeModalRef = ref(false);
const selectedStartDateRef = ref<Date | null>(null);
const selectedEndDateRef = ref<Date | null>(null);
const showLocationModalRef = ref(false);
const selectedLocationRef = ref<ILocation | null>(null);
const selectedFileListRef = ref<Set<string>>(new Set());
const showSelectionToolbarModalRef = ref(false);
const showFileActionModalRef = ref(false);
const selectedFileRef = ref<IPhotosphereViewFile | null>(null);
const isActivatedOnlyFilesNotInAlbumRef = ref(false);
const selectAlbumModalRef = ref(false);

const addFilterFileType = () => {
  // Quasar dialog to select file type filter with a dropdown
  $q.dialog({
    title: 'Select File Type',
    message: 'Which file type do you want to filter?',
    options: {
      type: 'radio',
      model: 'all',
      items: [
        {label: 'Images', value: FileTypeEnum.IMAGE},
        {label: 'Videos', value: FileTypeEnum.VIDEO},
        {label: 'Other', value: FileTypeEnum.FILE},
      ]
    },
    cancel: true,
    persistent: true
  }).onOk(data => {
    filtersRef.value.type = data;
    $q.notify({
      type: 'info',
      message: 'File type filter applied',
      timeout: 1000
    })
  }).onCancel(() => {
    filtersRef.value.type = undefined;
  });
};

const handleAddToAlbum = () => {
  selectAlbumModalRef.value = true;
}

const handleAlbumChoice = (album: IAlbum) => {
  if (selectedFileListRef.value.size === 0) {
    $q.notify({
      type: 'negative',
      message: 'No files selected',
      timeout: 1000
    });
    return;
  }
  albumStore.addHashesToAlbum(album.name, selectedFileListRef.value);
  fileService.syncAlbums().catch(
    _ => {
      $q.notify({
        type: 'negative',
        message: 'Error syncing albums, please do it manually from album view',
        timeout: 1000
      })
    }
  )
  $q.notify({
    type: 'positive',
    message: `Added ${selectedFileListRef.value.size} files to album "${album.name}"`,
    timeout: 1000
  });
  selectedFileListRef.value = new Set();
  showSelectionToolbarModalRef.value = false;
  isActiveLongPressRef.value = false;
  selectAlbumModalRef.value = false;
}

const handleSelectedFilesActionModalCancel = () => {
  showSelectionToolbarModalRef.value = false;
  selectedFileListRef.value = new Set();
}

const handleCreateAlbum = () => {
  $q.dialog({
    title: 'Add new album',
    message: 'Which is the name of the new album?',
    prompt: {
      model: '',
      isValid: val => val.length > 5,
      type: 'text'
    },
    cancel: true,
    persistent: true
  }).onOk(data => {
    albumStore.addAlbum(data)
    albumStore.addHashesToAlbum(data, selectedFileListRef.value)
    selectedFileListRef.value = new Set();
    showSelectionToolbarModalRef.value = false;
    isActiveLongPressRef.value = false;
    $q.notify({
      type: 'positive',
      message: `Album "${data}" created successfully!`
    })
  }).onCancel(() => {
    handleSelectedFilesActionModalCancel();
    selectedFileListRef.value = new Set();
    showSelectionToolbarModalRef.value = false;
    isActiveLongPressRef.value = false;
  });
}

const handleLocationConfirm = (location: ILocation) => {
  $q.notify({
    type: 'info',
    message: 'Location filter applied',
    timeout: 1000
  })
  selectedLocationRef.value = location;
  filtersRef.value.geohash.active = true;
  filtersRef.value.geohash.latitude = location.latitude;
  filtersRef.value.geohash.longitude = location.longitude;
  filtersRef.value.geohash.radius = location.radius * 1000; // convert to meters
  console.log('Location selected:', filtersRef.value.geohash);
}

const handleLocationCancel = () => {
  $q.notify({
    type: 'info',
    message: 'Location filter removed',
    timeout: 1000
  })
  selectedLocationRef.value = null;
  filtersRef.value.geohash.active = false;
  filtersRef.value.geohash.latitude = null;
  filtersRef.value.geohash.longitude = null;
  filtersRef.value.geohash.radius = 0;
}

const handleDateRangeConfirm = ({startDate, endDate}: {
  startDate: Date | null,
  endDate: Date | null
}) => {
  $q.notify({
    type: 'info',
    message: 'Date filter applied',
    timeout: 1000
  })
  filtersRef.value.dateRange.active = true;
  filtersRef.value.dateRange.startDate = startDate;
  filtersRef.value.dateRange.endDate = endDate;
}

const handleDateRangeCancel = () => {
  filtersRef.value.dateRange.active = false;
  filtersRef.value.dateRange.startDate = null;
  filtersRef.value.dateRange.endDate = null;
}

const addFilterByFileName = () => {
  $q.dialog({
    title: 'Filter by file name',
    message: 'Enter the file name or part of it to filter',
    prompt: {
      model: '',
      isValid: val => val.length > 0,
      type: 'text'
    },
    cancel: true,
    persistent: true
  }).onOk(data => {
    filtersRef.value.fileName = data;
    $q.notify({
      type: 'info',
      message: 'File name filter applied',
      timeout: 1000
    })
  }).onCancel(() => {
    filtersRef.value.fileName = undefined;
  });
};

const addFilterOnlyFilesNotInAlbum = () => {
  isActivatedOnlyFilesNotInAlbumRef.value = !isActivatedOnlyFilesNotInAlbumRef.value;
  if (isActivatedOnlyFilesNotInAlbumRef.value) {
    const hashesInAlbums = new Set();
    albumStore.getAlbums().forEach(album => {
      album.hashes.forEach(hash => hashesInAlbums.add(hash));
    });
    filtersRef.value.excludeHashList = Array.from(hashesInAlbums) as string[];
  } else {
    filtersRef.value.excludeHashList = null;
  }

  $q.notify({
    type: 'info',
    message: isActivatedOnlyFilesNotInAlbumRef.value ?
      'Filter Only files not in album active' :
      'Filter Only files not in album removed',
    timeout: 1000
  })
};

const addFilterDateRange = () => {
  showDateRangeModalRef.value = true;
};

const addFilterGeohash = () => {
  showLocationModalRef.value = true;
};

const handleImageClick = (file: IPhotosphereViewFile) => {
  if (isActiveLongPressRef.value) {
    toggleSelectionOfSelectionValue(file);
  } else {
    selectedFileRef.value = file;
    showFileActionModalRef.value = true;
  }
}

const toggleSelectionOfSelectionValue = (file: IPhotosphereViewFile) => {
  if (selectedFileListRef.value.has(file.hash))
    selectedFileListRef.value.delete(file.hash);
  else
    selectedFileListRef.value.add(file.hash)
}

const onImageLongPress = () => {
  showSelectionToolbarModalRef.value = true;
  isActiveLongPressRef.value = true;
};

</script>

<style scoped>
</style>
