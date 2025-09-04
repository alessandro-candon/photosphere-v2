<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import {QDialog, QCard, QCardSection, QCardActions, QBtn, QSpace, QDate} from 'quasar'
import {getDateStringWithoutTime} from "@/utils/utils.ts";

interface Props {
  modelValue: boolean
  startDate: Date | null
  endDate: Date | null
  title?: string
  minDate?: string
  maxDate?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void

  (e: 'confirm', dates: { startDate: Date | null, endDate: Date | null }): void

  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Select Date Range',
  startDate: null,
  endDate: null,
  minDate: undefined,
  maxDate: undefined
})

const emit = defineEmits<Emits>()

// Use range object for q-date
const dateRange = ref<{ from: string; to: string } | null>(null)

// Initialize range if both dates are provided
if (props.startDate && props.endDate) {
  dateRange.value = {
    from: getDateStringWithoutTime(props.startDate),
    to: getDateStringWithoutTime(props.endDate)
  }
}

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const canConfirm = computed(() => {
  return dateRange.value && dateRange.value.from && dateRange.value.to
})

// Watch for prop changes to update local range
watch(() => [props.startDate, props.endDate], () => {
  if (props.startDate && props.endDate) {
    dateRange.value = {
      from: getDateStringWithoutTime(props.startDate),
      to: getDateStringWithoutTime(props.endDate)
    }
  } else {
    dateRange.value = null
  }
})

const handleConfirm = () => {
  if (canConfirm.value && dateRange.value) {
    emit('confirm', {
      startDate: new Date(dateRange.value.from),
      endDate: new Date(dateRange.value.to)
    })
    emit('update:modelValue', false)
  }
}

const handleCancel = () => {
  // Reset to original values
  if (props.startDate && props.endDate) {
    dateRange.value = {
      from: getDateStringWithoutTime(props.startDate),
      to: getDateStringWithoutTime(props.endDate)
    }
  } else {
    dateRange.value = null
  }
  emit('cancel')
  emit('update:modelValue', false)
}

const dateOptions = (date: string) => {
  const dateObj = new Date(date)
  const minDateCheck = props.minDate ? dateObj >= new Date(props.minDate) : true
  const maxDateCheck = props.maxDate ? dateObj <= new Date(props.maxDate) : true
  return minDateCheck && maxDateCheck
}
</script>

<template>
  <q-dialog
    v-model="dialogModel"
    persistent
    maximized-mobile
  >
    <q-card class="date-range-modal" style="min-width: 400px; max-width: 500px;">
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
        <!-- Date Range Calendar -->
        <div class="q-mb-md">
          <q-date
            v-model="dateRange"
            range
            :options="dateOptions"
            class="full-width"
            :bordered="false"
            :flat="true"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancel"
          @click="handleCancel"
        />
        <q-btn
          color="primary"
          label="Confirm"
          :disable="!canConfirm"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.date-range-modal {
  min-height: 400px;
}
</style>
