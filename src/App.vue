<template>
  <div class="flex items-center justify-center min-h-screen bg-soft-pink">
    <RouterView />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';
</script>