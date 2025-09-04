<script setup lang="ts">
import { QCard, QCardActions, QBtn } from 'quasar'
import { computed } from 'vue'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'create-album'): void
  (e: 'add-to-album'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {})
const emit = defineEmits<Emits>()

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function handleCreateAlbum() {
  emit('create-album')
  emit('update:modelValue', false)
}
function handleAddToAlbum() {
  emit('add-to-album')
  emit('update:modelValue', false)
}
function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<template>
  <transition name="slide-up">
    <div v-if="dialogModel" class="selected-files-action-modal-fixed">
      <q-card class="full-width">
        <q-card-actions align="center">
          <div class="action-btn-col q-mr-xl">
            <q-btn flat round color="primary" icon="add" @click="handleCreateAlbum" size="lg" />
            <div class="action-label">Create Album</div>
          </div>
          <div class="action-btn-col q-mr-xl">
            <q-btn flat round color="secondary" icon="library_add" @click="handleAddToAlbum" size="lg" />
            <div class="action-label">Add to Album</div>
          </div>
          <div class="action-btn-col">
            <q-btn flat round color="secondary" icon="cancel" @click="handleCancel" size="lg" />
            <div class="action-label">Cancel</div>
          </div>
        </q-card-actions>
      </q-card>
    </div>
  </transition>
</template>

<style scoped>
.q-card-actions {
  padding: 0 !important;
}
.selected-files-action-modal-fixed {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  width: 100vw;
  pointer-events: auto;
}
.q-card.full-width {
  width: 100vw !important;
  border-radius: 0 !important;
}
.action-btn-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.action-label {
  margin-top: 1px;
  font-size: 0.5rem;
  text-align: center;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
