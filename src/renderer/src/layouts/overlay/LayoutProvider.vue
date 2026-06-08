<script setup lang="ts">
import { computed } from "vue";

import { useAppStore } from "@/stores/index";
import DefaultLayout from "@/layouts/overlay/presets/Default.vue";

const appStore = useAppStore();

const currentLayout = computed(() => {
  const layoutName = appStore.layout;

  switch (layoutName) {
    case "default":
      return DefaultLayout;
    default:
      return DefaultLayout;
  }
});
</script>

<template>
  <component :is="currentLayout">
    <slot />
  </component>
</template>
