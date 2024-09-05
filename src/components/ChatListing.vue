<template>
  <div class="flex items-center justify-between bg-yellow p-2 rounded-md shadow-md">
    <!-- Left section: Chat name and last message -->
    <div class="flex-1 pr-4 min-w-0">
      <p class="text-xl font-semibold truncate">{{ info.name }}</p>
      <p class="text-sm text-gray-600 truncate">{{ info.lastMessage }}</p>
    </div>

    <!-- Right section: Unread messages count in a circle and time -->
    <div class="text-right flex-shrink-0">
      <div class="flex flex-col items-center">
        <!-- Circle for unread message count -->
        <div v-if="info.unreadMessages>0 &&  props.chatId !== chatStore.selectedChatId"
          class="bg-mauve text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center mb-2">
          {{ info.unreadMessages >= 30 ? "30+" : info.unreadMessages }}
        </div>
        <p class="text-xs text-gray-500">{{ info.lastMessageTime }}</p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { defineProps, computed } from 'vue';
import { useChatStore } from '@/stores/chats';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  chatId: {
    type: String,
    required: true,
  }
});

const authStore = useAuthStore();
const chatStore = useChatStore();

const info = computed(() => {
  const chat = chatStore.chats.find(chat => chat.id === props.chatId);

  const messages = chatStore.messages.get(props.chatId) || [];
  const lastMessage = messages[0] || {};

  var name = '';
  if (chat.chatType == 'PRIVATE') {
    const ids = chat.name.split('-');
    if (ids[0] === authStore.id) {
      name = chatStore.usernames.get(ids[1]);
    }
    else {
      name = chatStore.usernames.get(ids[0]);
    }
  }

  return {
    name: name ? name : chat.name,
    lastMessage: lastMessage.content || 'No messages yet',
    unreadMessages: messages.filter(msg => (!msg.readAt || !msg.readAt.hasOwnProperty(authStore.id)) && msg.from !== authStore.id).length,
    lastMessageTime: formatTime(lastMessage.sentAt) || '',
    chatType: chat.chatType
  };
});

function formatTime(localDateTime) {
  const date = new Date(localDateTime);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

</script>