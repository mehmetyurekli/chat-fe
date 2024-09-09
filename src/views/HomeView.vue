<template>
  <div class="flex w-full h-screen">
    <div class="w-3/10 max-w-[30%] h-full flex-shrink-0">
      <ChatListings @selected="handleChat" class="w-full h-full" />
    </div>

    <div class="w-7/10 h-full flex-grow">
      <Chat :chatId="selectedChatId" class="w-full h-full" />
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import ChatListings from '@/components/ChatListings.vue';
import Chat from '@/components/Chat.vue';
import { useSocketStore } from '@/stores/socket';
import { useChatStore } from '@/stores/chats';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';


const socketStore = useSocketStore()
const chatStore = useChatStore()
const authStore = useAuthStore();
const selectedChatId = computed(() => chatStore.selectedChatId)


onMounted(async () => {
  await chatStore.initChats();
  socketStore.connect();
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
