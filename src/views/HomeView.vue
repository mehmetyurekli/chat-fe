<template>
  <div class="flex w-full h-screen">
    <div v-if="connecting" class="absolute inset-0 flex items-center justify-center bg-white z-50">
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-12 w-12 text-soft-pink" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 118 8V12H4z"></path>
        </svg>
        <p class="text-gray-600 mt-2">Login successful! Connecting...</p>
      </div>
    </div>


    <div class="w-3/10 min-w-[30%] max-w-[30%] h-full flex-shrink-0">
      <ChatListings @selected="handleChat" class="w-full h-full" />
    </div>

    <div class="w-7/10 h-full flex-grow">
      <Chat :chatId="selectedChatId" class="w-full h-full" />
    </div>
  </div>
</template>


<script setup>
import { onMounted, computed } from 'vue';
import ChatListings from '@/components/ChatListings.vue';
import Chat from '@/components/Chat.vue';
import { useSocketStore } from '@/stores/socket';
import { useChatStore } from '@/stores/chats';
import { useAuthStore } from '@/stores/auth';

const socketStore = useSocketStore()
const chatStore = useChatStore()
const authStore = useAuthStore();
const selectedChatId = computed(() => chatStore.selectedChatId)

const connecting = computed(() => !socketStore.connected);

onMounted(async () => {
  await chatStore.initChats();
  await socketStore.connect();
});

const handleChat = async (chatId) => {
  const notifyBulkReadDto = {
    chatId: chatId,
    readBy: authStore.id
  }
  socketStore.updateBulkMessage(notifyBulkReadDto);
  chatStore.setSelectedChatId(chatId);

}
</script>
