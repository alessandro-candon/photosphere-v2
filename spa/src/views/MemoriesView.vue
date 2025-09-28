<script setup lang="ts">
import HeaderPageComponent from "@/components/HeaderPageComponent.vue";
import FileGridListComponent from "@/components/FileGridListComponent.vue";
import {onMounted, ref} from "vue";
import type IFileFilters from "@/interfaces/IFileFilters.ts";
import type {IPhotosphereViewFile} from "@/interfaces/IPhotosphereViewFile.ts";
import {fileService} from "@/services/file-service.ts";
import FileGridListByDayComponent from "@/components/FileGridListByDayComponent.vue";

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
  }
});


onMounted(() => {
  const today = new Date('2022-05-29');
  console.log(today);
  const currentYear = today.getFullYear();
  for (let year = 1970; year <= currentYear; year++) {
    const toadyWithOldYear = new Date(today);
    toadyWithOldYear.setFullYear(year);
    toadyWithOldYear.setHours(0, 0, 0, 0);
    filtersRef.value.singleDateList?.push(toadyWithOldYear)
  }
})

const handleImageClick = async (file: IPhotosphereViewFile) => {
  const fileSigned = await fileService.getFileWithSignedUrlsByHash(file.hash)
  window.open(fileSigned.signedSourceBucketUri, '_blank');
}

</script>

<template>
  <q-page class="q-pa-md">
    <HeaderPageComponent title="Memories"/>
    <FileGridListByDayComponent
      :filters="filtersRef"
      :selected-file-list="new Set<string>()"
      @on-image-click="handleImageClick"
      @image-long-press="console.log('long press', $event)"
    ></FileGridListByDayComponent>
  </q-page>
</template>

<style scoped>
</style>
