<script setup lang="ts">
import { QHeader } from 'quasar';
import { defineProps } from 'vue';
const props = defineProps<{ title: string }>();
</script>

<template>
  <q-header class="q-mb-md flex items-center justify-between" style="height: 50px">
    <div class="text-h5 white q-pl-lg">{{ props.title }}</div>
  </q-header>
</template>

<style scoped>

</style>
