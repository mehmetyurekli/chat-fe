<template class="flex">
    <div class="flex flex-col min-h-screen w-full bg-peach">
        <h2 class="text-2xl font-bold p-5 bg-yellow-500 text-black bg-mauve text-left">{{`Welcome, ${username}!`}}</h2>
        <div class="flex-1 overflow-y-auto p-4 space-y-2">
            <ChatListing 
                class="hover:bg-mauve/15"
                @click="handleClick(chat.id)" 
                v-for="chat in sortedChats" 
                :key="chat.id" 
                :chatId="chat.id" />
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useChatStore } from '@/stores/chats'; // Adjust the import path as needed
import ChatListing from './ChatListing.vue'; // Import your ChatListing component
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const chatStore = useChatStore();
const emit = defineEmits(['selected']);

onMounted(async () => {
    await chatStore.initChats();
});

const username = computed(() => chatStore.usernames.get(authStore.id));

const chats = computed(() => chatStore.chats.filter(chat => {
    const chatMessages = chatStore.messages.get(chat.id);
    
    return chatMessages && chatMessages.length > 0;
}));

const sortedChats = computed(() => {
    return chats.value.slice().sort((a, b) => {
        const messagesA = chatStore.messages.get(a.id) || [];
        const messagesB = chatStore.messages.get(b.id) || [];
        const lastMessageA = messagesA[0] || {};
        const lastMessageB = messagesB[0] || {};
        
        const dateA = new Date(lastMessageA.sentAt);
        const dateB = new Date(lastMessageB.sentAt);

        return dateB - dateA;
    });
});

const handleClick = (chatId) => {
    emit("selected", chatId);
}
</script>
