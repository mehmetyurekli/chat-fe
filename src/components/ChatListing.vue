<template>
  <div class="flex items-center justify-between bg-yellow p-2 rounded-md shadow-md">
    <div class="flex-1 pr-4 min-w-0">
      <p class="text-xl font-semibold truncate"> {{ getChatName() }}</p>
      <p class="text-sm text-gray-600 truncate">{{ info.lastMessage }}</p>
    </div>

    <div class="text-right flex-shrink-0">
      <div class="flex flex-col items-center">
        <div v-if="info.unreadMessages > 0"
          class="bg-mauve text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center mb-2">
          {{ info.unreadMessages >= 30 ? "30+" : info.unreadMessages }}
        </div>
        <p class="text-xs text-gray-500">{{ info.lastMessageTime }}</p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { computed } from 'vue';
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

//chat object
const chat = computed(() => {
  if (props.chatId) {
    return chatStore.chats.find(chat => chat.id === props.chatId);
  }
  return null;
});


const messages = computed(() => {
  return chatStore.messages.get(props.chatId) || [];
});


const info = computed(() => {
  const msgs = messages.value;
  const lastMessage = msgs[0] || {};

  return {
    lastMessage: lastMessage.content ? 
      (lastMessage.from === authStore.id ? `You: ${lastMessage.content}` : lastMessage.content) : 
      'No messages yet',
    unreadMessages: msgs.filter(msg => {
      return (!msg.readAt || !(msg.readAt && msg.readAt.hasOwnProperty(authStore.id))) && msg.from !== authStore.id;
    }).length,
    lastMessageTime: lastMessage.sentAt ? formatTime(lastMessage.sentAt) : '',
    chatType: chat.value?.chatType || '' // Ensure chat.value is used for reactive access
  };
});



function formatTime(localDateTime) {
  const date = new Date(localDateTime);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getChatName() {
  if (props.chatId) {
    //setting up the name if its a private chat (id1-id2)
    var name = '';

    if (this.chat.chatType === 'PRIVATE') {
      const ids = this.chat.name.split('-');

      if (ids[0] === authStore.id) {
        name = chatStore.usernames.get(ids[1]);
      } else {
        name = chatStore.usernames.get(ids[0]);
      }
    }
    return name ? name : this.chat.name;
  }
  return '';
}

</script>