<template>
  <q-dialog v-model="dialogModel">
    <q-card>
      <q-card-section>
        <div class="text-h6">Select an Album</div>
      </q-card-section>
      <q-card-section>
        <q-select
          autocomplete="off"
          v-model="selectedAlbumName"
          :options="albumOptions"
          label="Album"
          use-input
          input-debounce="0"
          @filter="filterFn"
          @update:model-value="onSelect"
          :disable="albumOptions.length === 0"
          :loading="false"
          clearable
        />
        <div v-if="albumOptions.length === 0" class="q-mt-md">No albums available.</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="grey" @click="handleCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import {QDialog, QCard, QCardSection, QCardActions, QBtn, QSelect} from 'quasar';
import {useAlbumStore} from '@/stores/album-store.ts';
import type {IAlbum} from '@/interfaces/IAlbum.ts';

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'select', album: IAlbum): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {});
const emit = defineEmits<Emits>();
const albumStore = useAlbumStore();

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const albums = computed(() => albumStore.getAlbums());
const albumOptions = ref(albums.value.map(a => a.name));
const selectedAlbumName = ref<string | null>(null);

function filterFn(val: string, update: (callback: () => void) => void) {
  update(() => {
    if (!val) {
      albumOptions.value = albums.value.map(a => a.name);
    } else {
      const search = val.toLowerCase();
      albumOptions.value = albums.value
        .map(a => a.name)
        .filter(name => name.toLowerCase().includes(search));
    }
  });
}

function onSelect(name: string | null) {
  console.log('Selected album name:', name);
  if (!name) return;
  const album = albums.value.find(a => a.name === name);
  if (album) {
    emit('select', album);
    emit('update:modelValue', false);
    selectedAlbumName.value = null;
  }
}

function handleCancel() {
  emit('cancel');
  emit('update:modelValue', false);
  selectedAlbumName.value = null;
}
</script>

<style scoped>
</style>
