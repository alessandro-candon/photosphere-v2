<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h6">What do you want to do on this file?</div>
      </q-card-section>
      <q-card-section>
        <q-btn color="primary" class="q-mb-sm" @click="handleOpen">Open File</q-btn>
        <q-btn color="secondary" class="q-mb-sm" @click="handleShowInfo">Show File Info</q-btn>
      </q-card-section>
      <q-card-section>
        <div class="text-h6 flex-center">Action on Album</div>
        <div class="row">
          <div class="col-6">
            <q-btn :disable="!isActiveAddToAlbum" color="primary" @click="handleAddToAlbum">Add
            </q-btn>
          </div>
          <div class="col-6">
            <q-btn :disable="!isActiveRemoveFromAlbum" color="negative"
                   @click="handleRemoveFromAlbum">Remove
            </q-btn>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="grey" @click="handleCancel"/>
      </q-card-actions>
    </q-card>
    <SelectAlbumModal
      v-model="selectAlbumModalRef"
      @select="handleAlbumChoice"
      @cancel="selectAlbumModalRef = false"/>
  </q-dialog>

</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {QDialog, QCard, QCardSection, QCardActions, QBtn, useQuasar} from 'quasar';
import type {
  IPhotosphereFileSignedUrls,
  IPhotosphereViewFile
} from "@/interfaces/IPhotosphereViewFile.ts";
import {fileService} from "@/services/file-service.ts";
import {getFileTypeLabel} from "@/utils/style.ts";
import SelectAlbumModal from "@/modals/SelectAlbumModal.vue";
import type {IAlbum} from "@/interfaces/IAlbum.ts";
import {useAlbumStore} from "@/stores/album-store.ts";

const $q = useQuasar();
const albumStore = useAlbumStore();

const selectAlbumModalRef = ref(false);
const actionOnAlbum = ref<'add' | 'remove'>('add');

interface Props {
  modelValue: boolean;
  file: IPhotosphereViewFile,
  album: IAlbum | null;
  isActiveAddToAlbum?: boolean;
  isActiveRemoveFromAlbum?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;

  (e: 'open', file: IPhotosphereFileSignedUrls): void;

  (e: 'showInfo', file: IPhotosphereFileSignedUrls): void;

  (e: 'addToAlbum'): void;

  (e: 'removeFromAlbum'): void;

  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {});
const emit = defineEmits<Emits>();

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const handleOpen = async () => {
  const fileSigned = await fileService.getFileWithSignedUrlsByHash(props.file.hash)
  window.open(fileSigned.signedSourceBucketUri, '_blank');
  emit('open', fileSigned);
  emit('update:modelValue', false);
}

const handleShowInfo = async () => {
  const fileSigned = await fileService.getFileWithSignedUrlsByHash(props.file.hash)
  $q.dialog({
    title: 'File Info',
    message: `
      <div><strong>File Name:</strong> ${fileSigned.sourceBucketUri.split('/').pop()}</div>
      <div><strong>Created At:</strong> ${new Date(fileSigned.createdAtTimestamp * 1000).toLocaleString()}</div>
      <div><strong>Hash:</strong> ${fileSigned.hash}</div>
      <div><strong>GeoHash:</strong> ${fileSigned.geohash}</div>
      <div><strong>FileType:</strong> ${getFileTypeLabel(fileSigned.fileType)}</div>
    `,
    html: true,
    ok: true,
  });
  emit('showInfo', fileSigned);
  emit('update:modelValue', false);
}

const handleAddToAlbum = async () => {
  if (props.album) {
    handleAddToAlbumChoice(props.album, await fileService.getFileWithSignedUrlsByHash(props.file.hash));
  } else {
    actionOnAlbum.value = 'add';
    selectAlbumModalRef.value = true;
  }
}

const handleRemoveFromAlbum = async () => {
  if (props.album) {
    await handleRemoveFromAlbumChoice(props.album, await fileService.getFileWithSignedUrlsByHash(props.file.hash));
  } else {
    actionOnAlbum.value = 'remove';
    selectAlbumModalRef.value = true;
  }
}

const handleAlbumChoice = async (album: IAlbum) => {
  const fileSigned = await fileService.getFileWithSignedUrlsByHash(props.file.hash)
  if (actionOnAlbum.value === 'add') {
    handleAddToAlbumChoice(album, fileSigned);
  } else {
    handleRemoveFromAlbumChoice(album, fileSigned);
  }
}

const handleAddToAlbumChoice = (album: IAlbum, fileSigned: IPhotosphereFileSignedUrls) => {
  $q.dialog({
    title: 'Confirm',
    message: `Are you sure you want to add this file to album "${album.name}"?`,
    ok: {
      label: 'Yes',
      color: 'positive'
    },
    cancel: {
      label: 'No',
      color: 'negative'
    }
  }).onOk(() => {
    selectAlbumModalRef.value = false;
    albumStore.addHashToAlbum(album.name, fileSigned.hash);
    $q.notify({
      type: 'positive',
      message: `File added to album "${album.name}" successfully!`
    });
    emit('addToAlbum');
    emit('update:modelValue', false);
  });
}

const handleRemoveFromAlbumChoice = (album: IAlbum, fileSigned: IPhotosphereFileSignedUrls) => {
  $q.dialog({
    title: 'Confirm',
    message: `Are you sure you want to remove this file from album "${album.name}"?`,
    ok: {
      label: 'Yes',
      color: 'positive'
    },
    cancel: {
      label: 'No',
      color: 'negative'
    }
  }).onOk(() => {
    selectAlbumModalRef.value = false;
    albumStore.removeHashFromAlbum(album.name, fileSigned.hash);
    $q.notify({
      type: 'positive',
      message: `File removed from album "${album.name}" successfully!`
    });
    emit('removeFromAlbum');
    emit('update:modelValue', false);
  });
}

const handleCancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>

<style scoped>
.q-btn {
  width: 100%;
}
</style>

