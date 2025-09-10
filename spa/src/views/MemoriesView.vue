<script setup lang="ts">
import HeaderPageComponent from "@/components/HeaderPageComponent.vue";
import FileGridListComponent from "@/components/FileGridListComponent.vue";
import {onMounted, ref} from "vue";
import type IFileFilters from "@/interfaces/IFileFilters.ts";

const filtersRef = ref<IFileFilters>({
  singleDateList: [],
  dateRange: {
    active: false,
    startDate: null,
    endDate: null,
  },
  geohash: {
    active: false,
    latitude: null,
    longitude: null,
    radius: 0
  }});

onMounted(() => {
  const today = new Date();
  const currentYear = today.getFullYear();
  for (let year = 1970; year <= currentYear; year++) {
    const toadyWithOldYear = new Date(today);
    toadyWithOldYear.setFullYear(year);
    toadyWithOldYear.setHours(0, 0, 0, 0);
    filtersRef.value.singleDateList?.push(toadyWithOldYear)
  }
})

</script>

<template>
  <q-page class="q-pa-md">
    <HeaderPageComponent title="Memories"/>
    <FileGridListComponent
      :filters="filtersRef"
      :selected-file-list="new Set<string>()"
      @image-click="console.log('click', $event)"
      @image-long-press="console.log('long press', $event)"
    ></FileGridListComponent>
  </q-page>
</template>

<style scoped>
</style>
