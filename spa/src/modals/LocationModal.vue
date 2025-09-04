<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import {
  QDialog,
  QCard,
  QCardSection,
  QCardActions,
  QBtn,
  QSpace,
  QInput,
  QList,
  QItem,
  QItemSection,
  QItemLabel,
  QSlider,
  QSpinner, useQuasar
} from 'quasar'
import type ILocation from "@/interfaces/ILocation.ts";
import {useFirebaseStore} from "@/stores/firebase-store.ts";

const firebaseStore = useFirebaseStore();
const $q = useQuasar();

interface LocationResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
  importance: number
}

interface Props {
  modelValue: boolean
  title?: string
  initialLocation?: ILocation | null
  minRadius?: number
  maxRadius?: number
  defaultRadius?: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void

  (e: 'confirm', location: ILocation): void

  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Select Location',
  initialLocation: null,
  minRadius: 1,
  maxRadius: 50,
  defaultRadius: 10
})

const emit = defineEmits<Emits>()

// State
const searchQuery = ref('')
const searchResults = ref<LocationResult[]>([])
const selectedLocation = ref<LocationResult | null>(null)
const radius = ref(props.initialLocation?.radius || props.defaultRadius)
const isLoading = ref(false)
const searchTimeout = ref<number | null>(null)


const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const canConfirm = computed(() => {
  return selectedLocation.value !== null
})

// Watch search query and debounce API calls
watch(searchQuery, (newQuery) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (newQuery.trim().length < 3) {
    searchResults.value = []
    return
  }

  searchTimeout.value = setTimeout(() => {
    searchLocations(newQuery)
  }, 1000)
})

// Search locations using Nominatim API
const searchLocations = async (query: string) => {
  if (query.trim().length < 3) return

  isLoading.value = true
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '10',
      extratags: '1',
      email: firebaseStore.getEmail()
    })

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      method: 'GET'
    })

    if (!response.ok) {
      $q.notify({
        type: 'negative',
        message: 'Error fetching location data. Please try again later.'
      });
    }

    const results: LocationResult[] = await response.json()

    // Sort by importance (higher is better)
    searchResults.value = results.sort((a, b) => (b.importance || 0) - (a.importance || 0))
  } catch (error) {
    console.error('Error searching locations:', error)
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

const selectLocation = (location: LocationResult) => {
  selectedLocation.value = location
  searchQuery.value = location.display_name
  searchResults.value = []
    if (canConfirm.value && selectedLocation.value) {
    const locationData: ILocation = {
      placeId: selectedLocation.value.place_id,
      displayName: selectedLocation.value.display_name,
      latitude: parseFloat(selectedLocation.value.lat),
      longitude: parseFloat(selectedLocation.value.lon),
      radius: radius.value
    }
    emit('confirm', locationData)
    emit('update:modelValue', false);
  }
}

const handleCancel = () => {
  selectedLocation.value = null
  searchQuery.value = ''
  radius.value = props.defaultRadius
  searchResults.value = []
  emit('cancel')
  emit('update:modelValue', false)
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  selectedLocation.value = null
}
</script>

<template>
  <q-dialog
    v-model="dialogModel"
    persistent
    maximized-mobile
  >
    <q-card class="location-modal" style="min-width: 400px; max-width: 500px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ title }}</div>
        <q-space/>
        <q-btn
          icon="close"
          flat
          round
          dense
          @click="handleCancel"
        />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <!-- Location Search -->
        <div class="q-mb-md">
          <q-input
            v-model="searchQuery"
            label="Search for a city or street"
            placeholder="Enter location name..."
            outlined
            clearable
            @clear="clearSearch"
          >
            <template v-slot:append>
              <q-spinner v-if="isLoading" size="20px"/>
              <q-icon v-else name="search"/>
            </template>
          </q-input>
        </div>

        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="q-mb-md">
          <q-list bordered separator>
            <q-item
              v-for="location in searchResults"
              :key="location.place_id"
              clickable
              v-ripple
              @click="selectLocation(location)"
              class="location-item"
            >
              <q-item-section>
                <q-item-label>{{ location.display_name }}</q-item-label>
                <q-item-label caption>{{ location.type }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="location_on" color="primary"/>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Selected Location Display -->
        <div v-if="selectedLocation" class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">Selected Location:</div>
          <q-card flat bordered class="bg-grey-1">
            <q-card-section class="q-pa-sm">
              <div class="text-body2">{{ selectedLocation.display_name }}</div>
              <div class="text-caption text-grey-6">
                Lat: {{ selectedLocation.lat }}, Lon: {{ selectedLocation.lon }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Radius Selector -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">Search Radius: {{ radius }} km</div>
          <q-slider
            v-model="radius"
            :min="props.minRadius"
            :max="props.maxRadius"
            :step="1"
            label-always
            color="primary"
            class="q-mt-md"
          />
          <div class="row justify-between text-caption text-grey-6 q-mt-xs">
            <span>{{ props.minRadius }} km</span>
            <span>{{ props.maxRadius }} km</span>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancel"
          @click="handleCancel"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.location-modal {
  min-height: 450px;
}

.location-item:hover {
  background-color: rgba(25, 118, 210, 0.04);
}

.q-slider {
  padding: 16px 0;
}
</style>
