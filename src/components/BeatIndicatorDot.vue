<script setup lang="ts">
defineProps<{
  isActive: boolean;
  isAccent: boolean;
}>();
</script>

<template>
  <div
    class="w-4 h-4 rounded-full transition-all duration-75"
    :class="[
      isActive
        ? 'bg-primary scale-[1.25] shadow-lg shadow-primary/50'
        : 'bg-muted',
      isAccent && 'w-[18px] h-[18px]'
    ]"
  />
</template>
