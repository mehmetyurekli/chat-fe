<template>
  <div class="flex flex-col h-full">
    <div class="bg-charcoal text-white p-4 flex justify-between items-center">
      <div>
        <h1 class="text-xl font-semibold pl-4">
          <span v-if="props.chatId !== null">{{ getChatName() }}</span>
          <span v-else>Select a chat</span>
        </h1>
      </div>
      <button @click="logout()" class="bg-terracotta text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
    <div ref="messagesContainer" class="flex-1 bg-cream max-h-[calc(100vh-2rem)] p-4 space-y-2 overflow-y-auto"
      @scroll="handleScroll">
      <div v-if="chat?.chatType === 'GROUP'" class="flex justify-center items-center">
        <p class="bg-soft-pink text-gray-700 pl-2 pr-2 rounded-lg text-sm flex justify-center items-center">
          {{ `Created by ${chatStore.usernames.get(chat.createdBy)} on ${formatDateWithHours(chat.createdAt)}` }}
        </p>
      </div>
      <div v-for="(message, index) in messages" :key="message.id" :message="message">
        <div v-if="isNewDay(message.sentAt, index)" class="flex justify-center items-center pt-5 pb-5">
          <p class="bg-soft-pink text-gray-700 pl-2 pr-2 rounded-lg text-sm flex justify-center items-center">
            {{ formatDate(message.sentAt) }}
          </p>
        </div>
        <Message :message="message" />
      </div>
    </div>

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

const authStore = useAuthStore();
const chatStore = useChatStore();
const socketStore = useSocketStore();
const messagesContainer = ref(null);
const newMessage = ref('');
const loading = ref(false);
const allMessagesAreFetched = ref(false);

const currentPage = ref(0);

const props = defineProps({
  chatId: String
});

onMounted(async () => {
  await nextTick();
  scrollToBottom();
  allMessagesAreFetched.value = false;
});

//chat object
const chat = computed(() => {
  if (props.chatId) {
    return chatStore.chats.find(chat => chat.id === props.chatId);
  }
  return null;
});

//messages
const messages = computed(() => {
  const messagesArray = chatStore.messages.get(props.chatId) || [];
  return messagesArray.slice().reverse(); // Reverse the array
});


const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const isNearBottom = (threshold) => {
  if (messagesContainer.value) {
    const containerHeight = messagesContainer.value.clientHeight;
    const scrollTop = messagesContainer.value.scrollTop;
    const scrollHeight = messagesContainer.value.scrollHeight;
    return scrollHeight - scrollTop - containerHeight < threshold;
  }
  return false;
};

const isNearTop = (threshold) => {
  if (messagesContainer.value) {
    const scrollTop = messagesContainer.value.scrollTop;
    return scrollTop < threshold;
  }
  return false;
};

//infinite scroll logic
let previousScrollTop = 0;
const handleScroll = async () => {
  const currentScrollTop = messagesContainer.value.scrollTop;

  if (currentScrollTop < previousScrollTop && isNearTop(450) && !loading.value && !allMessagesAreFetched.value) {
    loading.value = true;
    await loadMore();

    setTimeout(() => {
      loading.value = false;
    }, 300);
  }
  previousScrollTop = currentScrollTop;
};

// watch if chatid changes
watch(() => props.chatId, async (newChatId) => {
  if (newChatId) {
    //reset old chats messages to last 30 messages
    const response = await chatStore.fetchMessages(props.chatId, 0, 30);
    chatStore.messages.set(props.chatId, response.data.content);

    currentPage.value = 0;
    allMessagesAreFetched.value = false;

    await nextTick();
    scrollToBottom();
  }
}, { immediate: true });

// if a new message is received while near bottom, scroll to bottom
watch(messages, async () => {
  await nextTick();
  if (isNearBottom(400)) {
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

    socketStore.sendMessage(messageDto);
    scrollToBottom();
    newMessage.value = '';
  }
};

const loadMore = async () => {
  currentPage.value += 1;
  const response = await chatStore.fetchMessages(props.chatId, currentPage.value, 30);

  //stop fetching if receiving no messages
  if (!response.data.content.length) {
    allMessagesAreFetched.value = true;
  }
  const currentMessages = chatStore.messages.get(props.chatId) || [];
  chatStore.messages.set(props.chatId, [...currentMessages, ...response.data.content]);
}

const logout = async () => {
  socketStore.disconnect();
  authStore.clearId();
  chatStore.clear();
  router.push('/login')
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

function formatDateWithHours(localDateTime) {
  const date = new Date(localDateTime);

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}-${month}-${year} at ${hours}:${minutes}`;
}

function formatDate(localDateTime) {
  const date = new Date(localDateTime);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function isNewDay(localDateTime, index) {
  if (index === 0) return true; //first message

  const currentDate = new Date(localDateTime).setHours(0, 0, 0, 0);

  const previousDate = new Date(messages.value[index - 1].sentAt).setHours(0, 0, 0, 0);

  return currentDate !== previousDate; //compare dates without hours
}

</script>