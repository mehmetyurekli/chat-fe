<template>
  <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="absolute inset-0 bg-black opacity-50" @click="close"></div>
    <div class="bg-white p-4 rounded shadow-lg relative z-10">
      <!-- Close Button -->
      <button 
        @click="close" 
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-1 rounded"
        aria-label="Close"
      >
        <i class="pi pi-times text-xl"></i>
      </button>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  isVisible: Boolean
});

const emit = defineEmits(['update:isVisible']);

const close = () => {
  emit('update:isVisible', false);
};
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
