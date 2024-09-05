<template>
  <div class="flex flex-col h-full">
    <div class="bg-charcoal text-white p-4 flex justify-between items-center">
      <div>
        <h1 class="text-xl font-semibold pl-4">
          <span v-if="props.chatId !== null">{{ chatName }}</span>
          <span v-else>Select a chat</span>
        </h1>
      </div>
      <!-- Logout Button -->
      <button @click="logout()" class="bg-terracotta text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
    <!-- Messages Container -->
    <div ref="messagesContainer" class="flex-1 bg-cream max-h-[calc(100vh-2rem)] p-4 space-y-2 overflow-y-auto"
      @scroll="handleScroll">
      <Message v-for="message in messages" :key="message.sentAt" :message="message" />
    </div>

    <!-- Message Input Bar -->
    <div class="p-2 flex items-center bg-cream">
      <input v-model="newMessage" @keyup.enter="sendMessage" type="text" placeholder="Type a message..."
        class="flex-1 border rounded p-2 mr-2" />
      <button @click="sendMessage" class="bg-green-500 text-white px-4 py-2 rounded">
        Send
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, nextTick, onUnmounted } from 'vue';
import Message from './Message.vue';
import { useChatStore } from '@/stores/chats';
import { useAuthStore } from '@/stores/auth';
import { useSocketStore } from '@/stores/socket';
import router from '@/router';
import axios from 'axios';

const scrollThreshold = 200;
const authStore = useAuthStore();
const chatStore = useChatStore();
const socketStore = useSocketStore();
const messagesContainer = ref(null);
const newMessage = ref('');
const loading = ref(false); // Define the loading state
const allMessagesAreFetched = ref(false);

const currentPage = ref(0);

const props = defineProps({
  chatId: String
});

// Computed property to get messages for the current chat and reverse them
const messages = computed(() => {
  const messagesArray = chatStore.messages.get(props.chatId) || [];
  return messagesArray.slice().reverse(); // Reverse the array
});

const chatName = computed(() => {
  if (props.chatId) {
    const chat = chatStore.chats.find(chat => chat.id === props.chatId);

    var name = '';
    if (chat.chatType === 'PRIVATE') {
      const ids = chat.name.split('-');
      if (ids[0] === authStore.id) {
        name = chatStore.usernames.get(ids[1]);
      } else {
        name = chatStore.usernames.get(ids[0]);
      }
    }
    return name ? name : chat.name;
  }
  return '';
})

// Function to scroll to the bottom
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Function to check if the user is near the bottom of the container
const isNearBottom = () => {
  if (messagesContainer.value) {
    const containerHeight = messagesContainer.value.clientHeight;
    const scrollTop = messagesContainer.value.scrollTop;
    const scrollHeight = messagesContainer.value.scrollHeight;
    return scrollHeight - scrollTop - containerHeight < scrollThreshold;
  }
  return false;
};

// Function to check if the user is near the top of the container
const isNearTop = () => {
  if (messagesContainer.value) {
    const scrollTop = messagesContainer.value.scrollTop;
    return scrollTop < scrollThreshold;
  }
  return false;
};

// Scroll event handler
const handleScroll = async () => {
  if (isNearTop() && !loading.value && !allMessagesAreFetched.value) {
    loading.value = true; // Indicate loading state
    await loadMore();
    loading.value = false; // Reset loading state
  }
};

// Watch for changes in chatId and fetch messages
watch(() => props.chatId, async (newChatId) => {

  if (newChatId) {
    currentPage.value = 0; // Reset page number
    allMessagesAreFetched.value = false;
    const response = await chatStore.fetchMessages(newChatId, currentPage.value, 30);
    chatStore.messages.set(newChatId, response.data.content);

    // Ensure scroll to bottom after messages are fetched
    await nextTick(); // Ensure DOM updates
    scrollToBottom();
  }
}, { immediate: true });

// Watch for changes in messages to scroll to the bottom if user is near the bottom
watch(messages, async () => {
  await nextTick(); // Ensure DOM updates before checking scroll position
  if (isNearBottom()) {
    scrollToBottom();
  }
}, { immediate: true });

const sendMessage = () => {
  if (newMessage.value.trim()) {
    const messageDto = {
      from: authStore.id,
      content: newMessage.value,
      chatId: props.chatId
    };

    socketStore.sendMessage(messageDto); // Replace with your actual method
    newMessage.value = ''; // Clear the input field
  }
};

const loadMore = async () => {
  currentPage.value += 1;
  const response = await chatStore.fetchMessages(props.chatId, currentPage.value, 30);

  console.log(response);

  if (!response.data.content.length) {
    allMessagesAreFetched.value = true;
  }
  const currentMessages = chatStore.messages.get(props.chatId) || [];
  chatStore.messages.set(props.chatId, [...currentMessages, ...response.data.content]);
}

const logout = async () => {
  socketStore.disconnect();
  authStore.clearId();
  router.push('/login')
}

onMounted(async () => {
  await nextTick(); // Ensure DOM is fully updated
  scrollToBottom();
  allMessagesAreFetched.value = false;
});

onUnmounted(async () => {
  const response = await chatStore.fetchMessages(props.chatId, 0, 30);
  chatStore.messages.set(props.chatId, response.data.content);
  currentPage.value = 0;
  allMessagesAreFetched.value = false;
})

</script>